#!/usr/bin/env python3
"""Emit editable deck content on top of an authorized official DEE template.

The template stays outside Git. This adapter removes its sample slides, retains
semantically identical real masters/layouts/themes and referenced artwork, and
adds typed IR content as native PowerPoint objects. Input is one JSON document
on stdin.
"""

from __future__ import annotations

import argparse
import base64
import copy
import hashlib
import io
import json
import posixpath
import re
import sys
import zipfile
from importlib.metadata import PackageNotFoundError, version
from pathlib import Path
from typing import Any

REQUIRED_PYTHON_PPTX_VERSION = "1.0.2"

if sys.version_info < (3, 9):
    print(
        f"Python 3.9+ is required for --template; found {sys.version.split()[0]}",
        file=sys.stderr,
    )
    raise SystemExit(3)

try:
    installed_python_pptx_version: str | None = version("python-pptx")
except PackageNotFoundError:
    installed_python_pptx_version = None

if installed_python_pptx_version != REQUIRED_PYTHON_PPTX_VERSION:
    print(
        "python-pptx 1.0.2 is required for --template; "
        f"found {installed_python_pptx_version or 'not installed'}",
        file=sys.stderr,
    )
    raise SystemExit(3)

try:
    from lxml import etree
    from pptx import Presentation
    from pptx.chart.data import ChartData
    from pptx.dml.color import RGBColor
    from pptx.enum.chart import (
        XL_CHART_TYPE,
        XL_DATA_LABEL_POSITION,
        XL_LEGEND_POSITION,
    )
    from pptx.enum.shapes import MSO_SHAPE, PP_PLACEHOLDER
    from pptx.enum.text import MSO_ANCHOR, MSO_AUTO_SIZE, PP_ALIGN
    from pptx.oxml.xmlchemy import OxmlElement
    from pptx.util import Inches, Pt
except ImportError as error:
    print(
        "python-pptx 1.0.2 is required for --template; install it from the "
        f"AIX Artifactory PyPI mirror ({error})",
        file=sys.stderr,
    )
    raise SystemExit(3) from error


TEMPLATE_REGISTRY = json.loads((Path(__file__).parents[2] / "templates" / "dee.json").read_text())
KNOWN_TEMPLATE_SHA256 = {mode: info["sha256"] for mode, info in TEMPLATE_REGISTRY["powerpoint"].items()}
KNOWN_TEMPLATE_STRUCTURE = TEMPLATE_REGISTRY["powerpoint"]
CANVAS_EMU = (24_384_000, 13_716_000)
LATENT_PLACEHOLDERS = {
    PP_PLACEHOLDER.SLIDE_NUMBER,
    PP_PLACEHOLDER.FOOTER,
    PP_PLACEHOLDER.DATE,
}
LATENT_PLACEHOLDER_XML_TYPES = {"dt", "ftr", "sldNum"}
OFFICIAL_BULLET_MARGIN_EMU = 333_374
PRESENTATION_NS = "http://schemas.openxmlformats.org/presentationml/2006/main"
RELATIONSHIPS_SUFFIX = ".rels"


def parse_ooxml(payload: bytes) -> Any:
    parser = etree.XMLParser(
        load_dtd=False,
        no_network=True,
        resolve_entities=False,
    )
    return etree.fromstring(payload, parser=parser)


def presentation_canvas(payload: bytes) -> tuple[int, int] | None:
    root = parse_ooxml(payload)
    slide_size = root.find(f"{{{PRESENTATION_NS}}}sldSz")
    if slide_size is None:
        return None
    try:
        return int(slide_size.get("cx", "")), int(slide_size.get("cy", ""))
    except ValueError:
        return None


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--template", required=True)
    parser.add_argument("--output", required=True)
    parser.add_argument("--mode", choices=("light", "dark"), required=True)
    return parser.parse_args()


def px(value: float) -> Inches:
    return Inches(float(value) / 72.0)


def color(value: str) -> RGBColor:
    raw = value.removeprefix("#")
    if not re.fullmatch(r"[0-9A-Fa-f]{6}", raw):
        raise ValueError(f"expected #rrggbb color, got {value!r}")
    return RGBColor.from_string(raw.upper())


def template_digest(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as source:
        for chunk in iter(lambda: source.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def verify_template(path: Path, mode: str, required_layouts: set[str]) -> dict[str, Any]:
    if not path.is_file():
        raise ValueError(f"official template is not a regular file: {path}")
    digest = template_digest(path)
    expected = KNOWN_TEMPLATE_SHA256[mode]
    if digest != expected:
        raise ValueError(
            f"{mode} template SHA-256 is {digest}, expected the audited 2025 template {expected}"
        )

    with zipfile.ZipFile(path) as archive:
        structure = KNOWN_TEMPLATE_STRUCTURE[mode]
        size = presentation_canvas(archive.read("ppt/presentation.xml"))
        if size != CANVAS_EMU:
            raise ValueError(
                f"official template canvas is not {CANVAS_EMU[0]}x{CANVAS_EMU[1]} EMU"
            )
        master_parts = [
            name
            for name in archive.namelist()
            if re.fullmatch(r"ppt/slideMasters/slideMaster\d+\.xml", name)
        ]
        if len(master_parts) != structure["masters"]:
            raise ValueError(
                f"official {mode} template has {len(master_parts)} masters, "
                f"expected {structure['masters']}"
            )
        layout_names = set()
        layout_parts = []
        for name in archive.namelist():
            if not re.fullmatch(r"ppt/slideLayouts/slideLayout\d+\.xml", name):
                continue
            layout_parts.append(name)
            xml = archive.read(name).decode("utf-8", "replace")
            match = re.search(r"<p:cSld name=\"([^\"]*)\"", xml)
            if match:
                layout_names.add(
                    match.group(1)
                    .replace("&amp;", "&")
                    .replace("&quot;", '"')
                    .replace("&apos;", "'")
                    .replace("&lt;", "<")
                    .replace("&gt;", ">")
                )
        if len(layout_parts) != structure["layouts"] or len(layout_names) != structure["layouts"]:
            raise ValueError(
                f"official {mode} template has {len(layout_parts)} layout parts and "
                f"{len(layout_names)} unique layout names, expected {structure['layouts']}"
            )
        missing = sorted(required_layouts - layout_names)
        if missing:
            raise ValueError(f"official template is missing required layouts: {missing}")
        return {
            "sha256": digest,
            "masterCount": len(master_parts),
            "layoutCount": len(layout_names),
            "requiredLayouts": len(required_layouts),
        }


def remove_sample_slides(presentation: Any) -> None:
    slide_ids = presentation.slides._sldIdLst
    for slide_id in list(slide_ids):
        presentation.part.drop_rel(slide_id.rId)
        slide_ids.remove(slide_id)


def remove_cloned_placeholders(slide: Any) -> None:
    """Remove empty clones; populated copies retain the source placeholder XML."""
    elements = [placeholder._element for placeholder in slide.placeholders]
    for element in elements:
        element.getparent().remove(element)


def sample_text_placeholder(sample: Any, index: int) -> Any:
    if sample is None:
        return None
    return next((p for p in sample.placeholders if p.placeholder_format.idx == index and p.has_text_frame), None)


def placeholder_paragraph(paragraph: Any, run: Any, text: str) -> Any:
    """Copy the source paragraph and give it one copy of the source run holding `text`."""
    entry = copy.deepcopy(paragraph)
    new_run = copy.deepcopy(run) if run is not None else OxmlElement("a:r")
    stale_text = [child for child in new_run if child.tag.endswith("}t")]
    for child in stale_text:
        new_run.remove(child)
    value = OxmlElement("a:t")
    value.text = text
    new_run.append(value)
    end = entry.find("{http://schemas.openxmlformats.org/drawingml/2006/main}endParaRPr")
    entry.insert(list(entry).index(end) if end is not None else len(entry), new_run)
    return entry


def populate_placeholder(slide: Any, layout: Any, index: int, lines: list[str], name: str, sample: Any = None) -> Any:
    """Keep native geometry, inheritance, paragraph defaults and run styles.

    Repeating the first source paragraph keeps peer bullets at the same level;
    copying the sample's subsequent paragraphs would introduce nested bullets.
    Only text content and the slide-local shape id/name change.
    """
    source = sample_text_placeholder(sample, index)
    if source is None:
        source = layout.placeholders.get(index)
    if source is None or not source.has_text_frame:
        raise ValueError(f"{layout.name}:{index} is not a text placeholder")
    element = copy.deepcopy(source.element)
    element.nvSpPr.cNvPr.set("id", str(slide.shapes._next_shape_id))
    element.nvSpPr.cNvPr.set("name", name)
    text_body = element.txBody
    paragraph = copy.deepcopy(text_body.p_lst[0])
    run = next((copy.deepcopy(child) for child in paragraph if child.tag.endswith("}r")), None)
    inline_content = [child for child in paragraph if child.tag.rsplit("}", 1)[-1] in {"r", "br", "fld"}]
    for child in inline_content:
        paragraph.remove(child)
    for child in text_body.p_lst:
        text_body.remove(child)
    for text in lines:
        text_body.append(placeholder_paragraph(paragraph, run, text))
    slide.shapes._spTree.append(element)
    return slide.shapes[-1]


def populate_timeline(slide: Any, layout: Any, milestones: list[dict[str, str]], sample: Any = None) -> None:
    """Fill dates and descriptions around the single inherited timeline."""
    dates = sorted(
        (p for p in layout.placeholders if p.has_text_frame and p.text == "Date"),
        key=lambda p: p.left,
    )
    headers = sorted(
        (p for p in layout.placeholders if p.has_text_frame and p.text == "Timeline Header"),
        key=lambda p: p.left,
    )
    if len(dates) != len(milestones) or len(headers) != len(milestones):
        raise ValueError(f"{layout.name} does not match {len(milestones)} milestones")
    for index, (milestone, date, header) in enumerate(zip(milestones, dates, headers), 1):
        populate_placeholder(slide, layout, date.placeholder_format.idx,
                             [milestone["label"]], f"milestones-{index}-label", sample)
        if milestone.get("body"):
            populate_placeholder(slide, layout, header.placeholder_format.idx,
                                 milestone["body"].splitlines(), f"milestones-{index}-body", sample)


def clone_latent_placeholders(slide: Any, layout: Any, number: int) -> None:
    for placeholder in layout.placeholders:
        if placeholder.element.ph_type not in LATENT_PLACEHOLDERS:
            continue
        element = copy.deepcopy(placeholder.element)
        shape_id = slide.shapes._next_shape_id
        non_visual = element.find(
            ".//{http://schemas.openxmlformats.org/presentationml/2006/main}cNvPr"
        )
        if non_visual is not None:
            non_visual.set("id", str(shape_id))
        shape_properties = element.find(
            ".//{http://schemas.openxmlformats.org/presentationml/2006/main}spPr"
        )
        if shape_properties is None:
            shape_properties = element.spPr
        for transform in shape_properties.findall(
            "{http://schemas.openxmlformats.org/drawingml/2006/main}xfrm"
        ):
            shape_properties.remove(transform)
        if placeholder.element.ph_type == PP_PLACEHOLDER.SLIDE_NUMBER:
            for text in element.iter(
                "{http://schemas.openxmlformats.org/drawingml/2006/main}t"
            ):
                text.text = str(number)
        slide.shapes._spTree.append(element)


def set_fill(shape: Any, value: str, opacity: float = 1.0) -> None:
    shape.fill.solid()
    shape.fill.fore_color.rgb = color(value)
    if opacity >= 1:
        return
    solid_fill = shape.fill._xPr.solidFill
    srgb = solid_fill.find(
        "{http://schemas.openxmlformats.org/drawingml/2006/main}srgbClr"
    )
    if srgb is not None:
        alpha = OxmlElement("a:alpha")
        alpha.set("val", str(round(opacity * 100_000)))
        srgb.append(alpha)


def no_line(shape: Any) -> None:
    shape.line.fill.background()


def add_text(
    slide: Any,
    text: str,
    geometry: dict[str, float],
    *,
    name: str,
    font_face: str,
    font_size: float,
    font_color: str,
    align: str = "left",
    vertical: str = "top",
    line_spacing: float = 1.0,
    margins: tuple[float, float, float, float] = (0, 0, 0, 0),
) -> Any:
    shape = slide.shapes.add_textbox(
        px(geometry["x"]),
        px(geometry["y"]),
        px(geometry["w"]),
        px(geometry["h"]),
    )
    shape.name = name
    frame = shape.text_frame
    frame.clear()
    frame.word_wrap = True
    frame.auto_size = MSO_AUTO_SIZE.NONE
    frame.margin_top = px(margins[0])
    frame.margin_right = px(margins[1])
    frame.margin_bottom = px(margins[2])
    frame.margin_left = px(margins[3])
    frame.vertical_anchor = (
        MSO_ANCHOR.MIDDLE if vertical == "middle" else MSO_ANCHOR.TOP
    )
    lines = str(text).splitlines() or [""]
    for index, line in enumerate(lines):
        paragraph = frame.paragraphs[0] if index == 0 else frame.add_paragraph()
        paragraph.alignment = PP_ALIGN.CENTER if align == "center" else PP_ALIGN.LEFT
        paragraph.line_spacing = line_spacing
        run = paragraph.add_run()
        run.text = line
        run.font.name = font_face
        run.font.size = Pt(font_size)
        run.font.color.rgb = color(font_color)
    return shape


def add_bullet_list(
    slide: Any,
    items: list[Any],
    geometry: dict[str, float],
    *,
    name: str,
    font_face: str,
    font_size: float,
    font_color: str,
) -> Any:
    shape = slide.shapes.add_textbox(
        px(geometry["x"]),
        px(geometry["y"]),
        px(geometry["w"]),
        px(geometry["h"]),
    )
    shape.name = name
    frame = shape.text_frame
    frame.clear()
    frame.word_wrap = True
    frame.auto_size = MSO_AUTO_SIZE.NONE
    frame.margin_left = frame.margin_right = frame.margin_top = frame.margin_bottom = 0
    for index, item in enumerate(items):
        paragraph = frame.paragraphs[0] if index == 0 else frame.add_paragraph()
        paragraph.line_spacing = 1.3
        paragraph.space_after = Pt(font_size * 0.5)
        properties = paragraph._p.get_or_add_pPr()
        properties.set("marL", str(OFFICIAL_BULLET_MARGIN_EMU))
        properties.set("indent", str(-OFFICIAL_BULLET_MARGIN_EMU))
        bullet = OxmlElement("a:buChar")
        bullet.set("char", "•")
        properties.append(bullet)
        run = paragraph.add_run()
        run.text = str(item)
        run.font.name = font_face
        run.font.size = Pt(font_size)
        run.font.color.rgb = color(font_color)
    return shape


def text_line_spacing(name: str, spec: dict[str, Any]) -> float:
    if name == "value" or re.fullmatch(r"value\d", name):
        return 1.0
    size = spec["sizePx"]
    if size >= 96:
        return 1.05
    if size >= 54:
        return 1.1
    if name in {"dek", "takeaway", "attribution"} or name.startswith("caption"):
        return 1.3
    return 1.35


def chart_presentation(chart: dict[str, Any]) -> dict[str, Any]:
    polar = chart["type"] in {"pie", "doughnut"}
    if polar:
        return {
            "polar": True,
            "showLegend": True,
            "min": None,
            "max": None,
            "zoomed": False,
            "axisNote": None,
        }
    values = [value for series in chart["series"] for value in series["values"]]
    data_min = min(values)
    data_max = max(values)
    span = data_max - data_min
    zero_based = chart["type"] == "bar"
    padding = abs(data_max or 1) * 0.1 if span == 0 else span * 0.15
    minimum = min(0, data_min) if zero_based else data_min - padding
    maximum = max(0, data_max) if zero_based else data_max + padding
    zero_excluded = not zero_based and (minimum > 0 or maximum < 0)
    axis_note = None
    if zero_excluded:
        bound = minimum if minimum > 0 else maximum
        rendered = f"{bound:.2f}".rstrip("0").rstrip(".")
        axis_note = (
            f"axis starts at {rendered}"
            if minimum > 0
            else f"axis ends at {rendered}"
        )
    return {
        "polar": False,
        "showLegend": len(chart["series"]) > 1,
        "min": minimum,
        "max": maximum,
        "zoomed": zero_excluded,
        "axisNote": axis_note,
    }


def chart_inks(mode: dict[str, Any], background: str | None) -> tuple[str, str, str]:
    """Return the (ink, muted ink, rule) colors for a composed chart."""
    if background == "accent":
        return mode["accentInk"], mode["accentInk"], mode["accentInk"]
    return mode["ink"], mode["inkMuted"], mode["rule"]


def color_chart_series(chart: Any, polar: bool, series_colors: list[str]) -> None:
    for index, chart_series in enumerate(chart.series):
        if polar:
            for point_index, point in enumerate(chart_series.points):
                point_color = color(series_colors[point_index % len(series_colors)])
                point.format.fill.solid()
                point.format.fill.fore_color.rgb = point_color
                point.format.line.color.rgb = point_color
        else:
            series_color = color(series_colors[index % len(series_colors)])
            chart_series.format.fill.solid()
            chart_series.format.fill.fore_color.rgb = series_color
            chart_series.format.line.color.rgb = series_color


def style_chart_axes(chart: Any, presentation: dict[str, Any], body_font: str, chart_muted: str, chart_rule: str) -> None:
    chart.value_axis.minimum_scale = presentation["min"]
    chart.value_axis.maximum_scale = presentation["max"]
    chart.value_axis.has_major_gridlines = False
    chart.value_axis.tick_labels.font.name = body_font
    chart.value_axis.tick_labels.font.size = Pt(24)
    chart.value_axis.tick_labels.font.color.rgb = color(chart_muted)
    chart.value_axis.format.line.fill.background()
    chart.category_axis.tick_labels.font.name = body_font
    chart.category_axis.tick_labels.font.size = Pt(24)
    chart.category_axis.tick_labels.font.color.rgb = color(chart_muted)
    chart.category_axis.format.line.color.rgb = color(chart_rule)


def label_polar_chart(chart: Any, body_font: str, chart_ink: str) -> None:
    plot = chart.plots[0]
    plot.has_data_labels = True
    labels = plot.data_labels
    labels.show_percentage = True
    labels.show_value = False
    labels.position = XL_DATA_LABEL_POSITION.BEST_FIT
    labels.font.name = body_font
    labels.font.size = Pt(24)
    labels.font.color.rgb = color(chart_ink)


def add_chart(
    slide: Any,
    chart_value: dict[str, Any],
    geometry: dict[str, float],
    *,
    name: str,
    mode: dict[str, Any],
    background: str | None,
    series_colors: list[str],
    body_font: str,
) -> None:
    chart_types = {
        "bar": XL_CHART_TYPE.COLUMN_CLUSTERED,
        "line": XL_CHART_TYPE.LINE,
        "area": XL_CHART_TYPE.AREA,
        "pie": XL_CHART_TYPE.PIE,
        "doughnut": XL_CHART_TYPE.DOUGHNUT,
    }
    chart_type = chart_types[chart_value["type"]]
    presentation = chart_presentation(chart_value)
    note_height = 36 if presentation["zoomed"] else 0
    data = ChartData()
    data.categories = chart_value["categories"]
    for index, series in enumerate(chart_value["series"]):
        data.add_series(series.get("name") or f"Series {index + 1}", series["values"])
    frame = slide.shapes.add_chart(
        chart_type,
        px(geometry["x"]),
        px(geometry["y"]),
        px(geometry["w"]),
        px(geometry["h"] - note_height),
        data,
    )
    frame.name = name
    chart = frame.chart
    chart_ink, chart_muted, chart_rule = chart_inks(mode, background)
    chart.has_legend = presentation["showLegend"]
    if chart.has_legend:
        chart.legend.position = (
            XL_LEGEND_POSITION.RIGHT
            if presentation["polar"]
            else XL_LEGEND_POSITION.BOTTOM
        )
        chart.legend.font.name = body_font
        chart.legend.font.size = Pt(24)
        chart.legend.font.color.rgb = color(chart_ink)
    color_chart_series(chart, presentation["polar"], series_colors)
    if not presentation["polar"]:
        style_chart_axes(chart, presentation, body_font, chart_muted, chart_rule)
    else:
        label_polar_chart(chart, body_font, chart_ink)
    if presentation["zoomed"]:
        add_text(
            slide,
            presentation["axisNote"],
            {
                "x": geometry["x"],
                "y": geometry["y"] + geometry["h"] - note_height,
                "w": geometry["w"],
                "h": note_height,
            },
            name=f"{name}-axis-note",
            font_face=body_font,
            font_size=24,
            font_color=chart_muted,
        )


def add_picture(
    slide: Any,
    value: dict[str, Any] | str,
    geometry: dict[str, float],
    *,
    name: str,
) -> None:
    if isinstance(value, str):
        source = value
        alt = ""
        source_width = source_height = None
    else:
        source = value["src"]
        alt = value.get("alt", "")
        source_width = value.get("width")
        source_height = value.get("height")
    if not source.startswith("data:") or "," not in source:
        raise ValueError("template PPTX emitter requires prepared data-URI image input")
    header, encoded = source.split(",", 1)
    mime = header.removeprefix("data:").removesuffix(";base64").lower()
    if mime == "image/svg+xml":
        raise ValueError(
            "template PPTX emitter received SVG; the Node adapter must rasterize it first"
        )
    if mime not in {"image/png", "image/jpeg", "image/gif"}:
        raise ValueError(f"template PPTX emitter does not support image type {mime!r}")
    payload = io.BytesIO(base64.b64decode(encoded, validate=True))
    picture = slide.shapes.add_picture(
        payload,
        px(geometry["x"]),
        px(geometry["y"]),
        px(geometry["w"]),
        px(geometry["h"]),
    )
    picture.name = name
    picture._element.nvPicPr.cNvPr.set("descr", alt)
    if not source_width or not source_height:
        return
    source_ratio = float(source_width) / float(source_height)
    target_ratio = float(geometry["w"]) / float(geometry["h"])
    if source_ratio > target_ratio:
        crop = (1 - target_ratio / source_ratio) / 2
        picture.crop_left = crop
        picture.crop_right = crop
    elif source_ratio < target_ratio:
        crop = (1 - source_ratio / target_ratio) / 2
        picture.crop_top = crop
        picture.crop_bottom = crop


def slot_inks(mode: dict[str, Any], background: str | None, official_accent_layout: bool) -> tuple[str, str, str]:
    """Return the (ink, secondary ink, value ink) colors for a composed slot."""
    if official_accent_layout:
        return "#FFFFFF", "#FFFFFF", "#FFFFFF"
    if background == "accent":
        return mode["accentInk"], mode["accentInk"], mode["accentInk"]
    return mode["ink"], mode["inkSecondary"], mode["accent"]


def emit_on_image_text(
    slide: Any,
    name: str,
    value: Any,
    spec: dict[str, Any],
    geometry: dict[str, float],
    *,
    body_font: str,
    scrim: dict[str, Any],
) -> None:
    shape = slide.shapes.add_shape(
        MSO_SHAPE.ROUNDED_RECTANGLE,
        px(geometry["x"]),
        px(geometry["y"]),
        px(geometry["w"]),
        px(geometry["h"]),
    )
    shape.name = f"{name}-scrim"
    set_fill(shape, scrim["color"], float(scrim["opacity"]))
    no_line(shape)
    add_text(
        slide,
        str(value),
        geometry,
        name=name,
        font_face=body_font,
        font_size=spec["sizePx"],
        font_color="#FFFFFF",
        align="center" if spec.get("align") == "center" else "left",
        vertical="middle",
        margins=(16, 24, 16, 24),
    )


def emit_text_slot(
    slide: Any,
    name: str,
    value: Any,
    spec: dict[str, Any],
    geometry: dict[str, float],
    *,
    inks: tuple[str, str, str],
    display_font: str,
    body_font: str,
    scrim: dict[str, Any],
) -> None:
    ink, ink_secondary, value_ink = inks
    is_value = name == "value" or re.fullmatch(r"value\d", name)
    is_muted = (
        name in {"dek", "takeaway", "attribution"}
        or name.startswith("caption")
    )
    if spec.get("onImage"):
        emit_on_image_text(slide, name, value, spec, geometry, body_font=body_font, scrim=scrim)
        return
    if is_value:
        font_color = value_ink
    elif is_muted:
        font_color = ink_secondary
    else:
        font_color = ink
    add_text(
        slide,
        str(value),
        geometry,
        name=name,
        font_face=display_font
        if spec["sizePx"] >= 54 or is_value
        else body_font,
        font_size=spec["sizePx"],
        font_color=font_color,
        align="center" if spec.get("align") == "center" else "left",
        vertical="middle" if spec.get("align") == "center" else "top",
        line_spacing=text_line_spacing(name, spec),
    )


def emit_card_slot(
    slide: Any,
    name: str,
    value: Any,
    spec: dict[str, Any],
    geometry: dict[str, float],
    *,
    mode: dict[str, Any],
    display_font: str,
    body_font: str,
) -> None:
    card = slide.shapes.add_shape(
        MSO_SHAPE.ROUNDED_RECTANGLE,
        px(geometry["x"]),
        px(geometry["y"]),
        px(geometry["w"]),
        px(geometry["h"]),
    )
    card.name = name
    set_fill(card, mode["surface"])
    no_line(card)
    inner = {
        "x": geometry["x"] + 48,
        "y": geometry["y"] + 48,
        "w": geometry["w"] - 96,
        "h": spec["headingPx"] * 1.3,
    }
    add_text(
        slide,
        str(value["heading"]),
        inner,
        name=f"{name}-heading",
        font_face=display_font,
        font_size=spec["headingPx"],
        font_color=mode["ink"],
    )
    if value.get("body"):
        offset = spec["headingPx"] * 1.3 + 24
        add_text(
            slide,
            str(value["body"]),
            {
                "x": inner["x"],
                "y": inner["y"] + offset,
                "w": inner["w"],
                "h": geometry["h"] - 96 - offset,
            },
            name=f"{name}-body",
            font_face=body_font,
            font_size=spec["bodyPx"],
            font_color=mode["inkSecondary"],
            line_spacing=1.35,
        )


def emit_milestone_slot(
    slide: Any,
    name: str,
    value: Any,
    spec: dict[str, Any],
    *,
    mode: dict[str, Any],
    display_font: str,
    body_font: str,
) -> None:
    positions = spec["positions"][: len(value)]
    axis_y = positions[0]["y"] - 40
    axis = slide.shapes.add_shape(
        MSO_SHAPE.RECTANGLE,
        px(positions[0]["x"] + 12),
        px(axis_y),
        px(positions[-1]["x"] - positions[0]["x"] + 12),
        px(4),
    )
    axis.name = f"{name}-axis"
    set_fill(axis, mode["rule"])
    no_line(axis)
    for index, milestone in enumerate(value):
        position = positions[index]
        dot = slide.shapes.add_shape(
            MSO_SHAPE.OVAL,
            px(position["x"]),
            px(axis_y - 10),
            px(24),
            px(24),
        )
        dot.name = f"{name}-{index + 1}-dot"
        set_fill(dot, mode["accent"])
        no_line(dot)
        add_text(
            slide,
            str(milestone["label"]),
            {
                "x": position["x"],
                "y": position["y"],
                "w": position["w"],
                "h": spec["labelPx"] * 1.4,
            },
            name=f"{name}-{index + 1}-label",
            font_face=display_font,
            font_size=spec["labelPx"],
            font_color=mode["ink"],
        )
        if milestone.get("body"):
            add_text(
                slide,
                str(milestone["body"]),
                {
                    "x": position["x"],
                    "y": position["y"] + spec["labelPx"] * 1.4 + 12,
                    "w": position["w"],
                    "h": spec["bodyPx"] * 3,
                },
                name=f"{name}-{index + 1}-body",
                font_face=body_font,
                font_size=spec["bodyPx"],
                font_color=mode["inkSecondary"],
                line_spacing=1.25,
            )


def emit_slot(
    slide: Any,
    name: str,
    value: Any,
    spec: dict[str, Any],
    *,
    mode: dict[str, Any],
    background: str | None,
    display_font: str,
    body_font: str,
    series_colors: list[str],
    scrim: dict[str, Any],
    official_accent_layout: bool,
) -> None:
    geometry: dict[str, float] = {
        key: float(spec[key])
        for key in ("x", "y", "w", "h")
        if key in spec
    }
    inks = slot_inks(mode, background, official_accent_layout)
    kind = spec["kind"]
    if kind == "text":
        emit_text_slot(
            slide,
            name,
            value,
            spec,
            geometry,
            inks=inks,
            display_font=display_font,
            body_font=body_font,
            scrim=scrim,
        )
        return
    if kind == "text-list":
        add_bullet_list(
            slide,
            value,
            geometry,
            name=name,
            font_face=body_font,
            font_size=spec["sizePx"],
            font_color=inks[0],
        )
        return
    if kind == "card":
        emit_card_slot(
            slide,
            name,
            value,
            spec,
            geometry,
            mode=mode,
            display_font=display_font,
            body_font=body_font,
        )
        return
    if kind == "milestone-list":
        emit_milestone_slot(
            slide,
            name,
            value,
            spec,
            mode=mode,
            display_font=display_font,
            body_font=body_font,
        )
        return
    if kind == "image":
        add_picture(slide, value, geometry, name=name)
        return
    if kind == "chart":
        add_chart(
            slide,
            value,
            geometry,
            name=name,
            mode=mode,
            background=background,
            series_colors=series_colors,
            body_font=body_font,
        )
        return
    raise ValueError(f"unsupported template PPTX slot kind {kind!r}")


def relevant_template_parts(archive: zipfile.ZipFile) -> set[str]:
    names = set(archive.namelist())
    parts = {
        name
        for name in names
        if name.startswith(
            (
                "ppt/slideMasters/",
                "ppt/slideLayouts/",
                "ppt/theme/",
            )
        )
    }
    relationships = [name for name in parts if name.endswith(RELATIONSHIPS_SUFFIX)]
    for relationship in relationships:
        xml = archive.read(relationship).decode("utf-8", "replace")
        owner_directory = relationship.split("/_rels/", 1)[0]
        for target in re.findall(r'Target="([^"]+)"', xml):
            resolved = posixpath.normpath(posixpath.join(owner_directory, target))
            if resolved.startswith("ppt/media/") and resolved in names:
                parts.add(resolved)
    return parts


def sort_relationships(root: Any) -> None:
    children = sorted(root, key=lambda child: child.get("Id", ""))
    for child in children:
        root.remove(child)
    for child in children:
        root.append(child)


def template_part_equivalent(name: str, before: bytes, after: bytes) -> bool:
    if not (name.endswith(".xml") or name.endswith(RELATIONSHIPS_SUFFIX)):
        return before == after
    before_root = parse_ooxml(before)
    after_root = parse_ooxml(after)
    if name.endswith(RELATIONSHIPS_SUFFIX):
        for root in (before_root, after_root):
            sort_relationships(root)
    return etree.tostring(before_root, method="c14n") == etree.tostring(
        after_root, method="c14n"
    )


def audit_generated_slides(package: zipfile.ZipFile) -> tuple[int, list[str]]:
    """Count latent placeholders and list slides that reuse a shape ID."""
    latent_placeholders = 0
    duplicate_shape_ids = []
    for name in package.namelist():
        if not re.fullmatch(r"ppt/slides/slide\d+\.xml", name):
            continue
        root = parse_ooxml(package.read(name))
        shape_ids = [
            element.get("id")
            for element in root.iter(
                "{http://schemas.openxmlformats.org/presentationml/2006/main}cNvPr"
            )
        ]
        if len(shape_ids) != len(set(shape_ids)):
            duplicate_shape_ids.append(name)
        for placeholder in root.iter(
            "{http://schemas.openxmlformats.org/presentationml/2006/main}ph"
        ):
            placeholder_type = placeholder.get("type", "obj")
            if placeholder_type in LATENT_PLACEHOLDER_XML_TYPES:
                latent_placeholders += 1
    return latent_placeholders, duplicate_shape_ids


def prove_template_parts_preserved(source: Path, output: Path) -> dict[str, int]:
    with zipfile.ZipFile(source) as before, zipfile.ZipFile(output) as after:
        parts = relevant_template_parts(before)
        missing = sorted(parts - set(after.namelist()))
        changed = sorted(
            name
            for name in parts & set(after.namelist())
            if not template_part_equivalent(name, before.read(name), after.read(name))
        )
        if missing or changed:
            raise ValueError(
                f"official template package drifted (missing={missing[:5]}, changed={changed[:5]})"
            )
        media = [
            name
            for name in after.namelist()
            if name.startswith("ppt/media/") and not name.endswith("/")
        ]
        latent_placeholders, duplicate_shape_ids = audit_generated_slides(after)
        if duplicate_shape_ids:
            raise ValueError(
                f"generated slides contain duplicate shape IDs {duplicate_shape_ids[:5]}"
            )
        return {
            "preservedParts": len(parts),
            "totalMedia": len(media),
            "latentPlaceholders": latent_placeholders,
        }


def slide_source_layout(slide_value: dict[str, Any], layout_spec: dict[str, Any]) -> str:
    source_layout = layout_spec["sourceLayout"]
    if slide_value["layout"] == "timeline":
        return f"Timeline x{len(slide_value['milestones'])}"
    return source_layout


def slide_series_colors(mode: dict[str, Any], background: str | None, default_series_colors: list[str]) -> list[str]:
    series_colors = (
        mode.get("seriesOnAccent")
        if background == "accent"
        else default_series_colors
    )
    return series_colors or default_series_colors


def placeholder_index(spec: dict[str, Any], mode_name: str) -> int:
    index = spec["sourcePlaceholder"]
    if isinstance(index, dict):
        return index[mode_name]
    return index


def placeholder_lines(kind: str, value: Any) -> list[str]:
    if kind == "card":
        return [value["heading"], *value.get("body", "").splitlines()]
    if kind == "text-list":
        return value
    return str(value).splitlines()


def emit_slide_slots(
    slide: Any,
    layout: Any,
    layout_spec: dict[str, Any],
    slide_value: dict[str, Any],
    sample: Any,
    mode_name: str,
    slot_options: dict[str, Any],
) -> None:
    for name, spec in layout_spec["slots"].items():
        value = slide_value.get(name)
        if value is None or value == "":
            continue
        if "sourcePlaceholder" in spec:
            index = placeholder_index(spec, mode_name)
            populate_placeholder(slide, layout, index, placeholder_lines(spec["kind"], value), name, sample)
            continue
        if spec["kind"] == "milestone-list":
            populate_timeline(slide, layout, value, sample)
            continue
        emit_slot(slide, name, value, spec, **slot_options)


def set_slide_notes(slide: Any, notes: Any) -> None:
    # Reading notes_slide creates a notes part, so only touch it when notes exist.
    if not notes:
        return
    notes_frame = slide.notes_slide.notes_text_frame
    if notes_frame is not None:
        notes_frame.text = str(notes)


def build(request: dict[str, Any], template: Path, output: Path, mode_name: str) -> dict[str, Any]:
    deck = request["deck"]
    catalog = request["catalog"]
    theme = request["theme"]
    required_layouts = {
        layout["sourceLayout"] for layout in catalog["layouts"].values()
    }
    template_info = verify_template(template, mode_name, required_layouts)
    presentation = Presentation(str(template))
    samples: dict[str, Any] = {}
    for source_slide in presentation.slides:
        samples.setdefault(source_slide.slide_layout.name, source_slide)
    remove_sample_slides(presentation)
    layouts = {
        layout.name: layout
        for master in presentation.slide_masters
        for layout in master.slide_layouts
    }
    mode = theme["modes"][mode_name]
    display_font = theme.get("pptxFontDisplay") or theme.get("pptxFontFallback") or "Arial"
    body_font = theme.get("pptxFontBody") or theme.get("pptxFontFallback") or "Arial"
    default_series_colors = mode.get("series") or theme["series"]
    scrim = theme["onImageScrim"]

    for index, slide_value in enumerate(deck["slides"], 1):
        layout_spec = catalog["layouts"][slide_value["layout"]]
        source_layout = slide_source_layout(slide_value, layout_spec)
        layout = layouts[source_layout]
        if slide_value.get("background"):
            raise ValueError(
                "official templates do not support background overrides; select an approved "
                "native layout or use an explicit reconstructed build"
            )
        slide = presentation.slides.add_slide(layout)
        remove_cloned_placeholders(slide)
        background = slide_value.get("background") or layout_spec.get("background")
        official_accent_layout = (
            not slide_value.get("background")
            and layout_spec.get("background") == "accent"
        )
        slot_options = {
            "mode": mode,
            "background": background,
            "display_font": display_font,
            "body_font": body_font,
            "series_colors": slide_series_colors(mode, background, default_series_colors),
            "scrim": scrim,
            "official_accent_layout": official_accent_layout,
        }
        emit_slide_slots(slide, layout, layout_spec, slide_value, samples.get(source_layout), mode_name, slot_options)
        clone_latent_placeholders(slide, layout, index)
        set_slide_notes(slide, slide_value.get("notes"))

    presentation.core_properties.title = deck["title"]
    output.parent.mkdir(parents=True, exist_ok=True)
    presentation.save(str(output))
    preservation = prove_template_parts_preserved(template, output)
    return {
        **template_info,
        **preservation,
        "slides": len(deck["slides"]),
        "templateMode": mode_name,
    }


def main() -> int:
    args = parse_args()
    request = json.load(sys.stdin)
    result = build(
        request,
        Path(args.template).resolve(),
        Path(args.output).resolve(),
        args.mode,
    )
    print(json.dumps(result, separators=(",", ":")))
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except (KeyError, ValueError, OSError, zipfile.BadZipFile) as error:
        print(f"template PPTX emission failed: {error}", file=sys.stderr)
        raise SystemExit(2) from error
