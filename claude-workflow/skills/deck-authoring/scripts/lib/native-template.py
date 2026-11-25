#!/usr/bin/env python3
"""Inspect/copy native source slides, retaining tables, diagrams and mockups."""
from __future__ import annotations

import copy
import importlib.util
import json
import re
import sys
from pathlib import Path

spec = importlib.util.spec_from_file_location("template", Path(__file__).with_name("emit-template-pptx.py"))
if spec is None or spec.loader is None:
    raise RuntimeError("native PowerPoint adapter could not load its bundled template module")
template = importlib.util.module_from_spec(spec)
spec.loader.exec_module(template)
from pptx import Presentation
from pptx.chart.data import ChartData
from pptx.enum.shapes import MSO_SHAPE_TYPE
from pptx.opc.constants import RELATIONSHIP_TYPE as RT
from pptx.parts.slide import SlidePart

NATIVE_EDIT_FIELDS = {"text": ["text", "find"], "table-cell": ["row", "column", "text", "find"],
                      "image": ["image"], "chart": ["categories", "series"], "delete": []}


def fields(value, allowed, where):
    if not isinstance(value, dict) or set(value) - set(allowed):
        raise ValueError(f"{where}: expected object with fields {allowed}")


def shapes(items):
    for shape in items:
        yield shape
        if shape.shape_type == MSO_SHAPE_TYPE.GROUP:
            yield from shapes(shape.shapes)


def inspect_object(shape):
    item = {"objectId": str(shape.shape_id), "name": shape.name,
            "geometryPt": [value / 12700 for value in (shape.left, shape.top, shape.width, shape.height)]}
    if shape.has_text_frame:
        item.update(kind="text", text=shape.text)
    elif shape.has_table:
        item.update(kind="table", cells=[[cell.text for cell in row.cells] for row in shape.table.rows])
    elif shape.has_chart:
        item.update(kind="chart", chartType=str(shape.chart.chart_type))
    elif shape.shape_type == MSO_SHAPE_TYPE.PICTURE:
        item.update(kind="image")
    else:
        item.update(kind="decoration")
    return item


def slide_title(slide):
    return next((s.text for s in shapes(slide.shapes) if s.has_text_frame and s.text.strip()), "")


def inspect(presentation, sha, slide_number=None):
    result = []
    if slide_number is not None and not 1 <= slide_number <= len(presentation.slides):
        raise ValueError("slide must be a one-based source index")
    for index, slide in enumerate(presentation.slides, 1):
        if slide_number is not None and index != slide_number:
            continue
        objects = [inspect_object(shape) for shape in shapes(slide.shapes)]
        result.append({"sourceSlide": index, "layout": slide.slide_layout.name,
                       "title": slide_title(slide),
                       **({"objects": objects} if slide_number is not None else {})})
    return {"template": {"sha256": sha}, "slides": result}


def replace_run_span(runs, start, end, text):
    """Replace characters [start, end) of the joined run text, keeping each run's style."""
    offset = 0
    inserted = False
    for run in runs:
        value = run.text
        stop = offset + len(value)
        if stop > start and offset < end:
            run.text = value[:max(0, start - offset)] + (text if not inserted else "") + value[max(0, end - offset):]
            inserted = True
        offset = stop


def replace_found_text(frame, text, find):
    if not isinstance(find, str) or not find or frame.text.count(find) != 1 or "\n" in find:
        raise ValueError("find must match exactly once within one native paragraph")
    # Keep unaffected runs, including their individual emphasis and links.
    for paragraph in frame.paragraphs:
        raw = "".join(run.text for run in paragraph.runs)
        if find not in raw:
            continue
        start = raw.index(find)
        replace_run_span(paragraph.runs, start, start + len(find), text)
        return
    raise ValueError("find spans a native line break; edit each styled paragraph separately")


def styled_paragraph(original, line):
    """Copy `original` with its runs replaced by one run holding `line` in the first run's style."""
    paragraph = copy.deepcopy(original)
    runs = [child for child in paragraph if child.tag.endswith("}r")]
    style = copy.deepcopy(runs[0].rPr) if runs and runs[0].rPr is not None else None
    inline_content = [child for child in paragraph if child.tag.rsplit("}", 1)[-1] in {"r", "br", "fld"}]
    for child in inline_content:
        paragraph.remove(child)
    run = template.OxmlElement("a:r")
    if style is not None:
        run.append(style)
    value = template.OxmlElement("a:t")
    value.text = line
    run.append(value)
    end = paragraph.find("{http://schemas.openxmlformats.org/drawingml/2006/main}endParaRPr")
    paragraph.insert(list(paragraph).index(end) if end is not None else len(paragraph), run)
    return paragraph


def replace_text(frame, text, find=None):
    if not isinstance(text, str) or len(text) > 10000 or "\0" in text:
        raise ValueError("text must contain at most 10000 characters without NUL")
    if find is not None:
        replace_found_text(frame, text, find)
        return
    # For whole-object replacement, repeat the first source paragraph's style.
    # Richly styled content should use find to retain the other run styles.
    original = copy.deepcopy(frame._txBody.p_lst[0])
    for paragraph in frame._txBody.p_lst:
        frame._txBody.remove(paragraph)
    for line in text.split("\n"):
        frame._txBody.append(styled_paragraph(original, line))


def clone_related(part, package):
    """Charts/workbooks must be independent when a source slide repeats."""
    pattern = re.sub(r"\d+(?=\.[^.]+$)", "%d", str(part.partname))
    if "%d" not in pattern:
        raise ValueError(f"unsupported mutable native part {part.partname}")
    duplicate = type(part).load(package.next_partname(pattern), part.content_type, package, part.blob)
    if hasattr(part, "rels"):
        copy_relationships(part, duplicate, package)
    return duplicate


def relationship_target(relationship, package):
    if relationship.is_external:
        return relationship.target_ref
    value = relationship.target_part
    if relationship.reltype in {RT.CHART, RT.PACKAGE}:
        return clone_related(value, package)
    return value


def remap_relationship_ids(root, mapping):
    for element in root.iter():
        for attr, value in element.attrib.items():
            if attr.startswith("{http://schemas.openxmlformats.org/officeDocument/2006/relationships}") and value in mapping:
                element.set(attr, mapping[value])


def copy_relationships(source, target, package):
    mapping = {}
    for relationship in source.rels.values():
        if relationship.reltype == RT.NOTES_SLIDE:
            continue
        value = relationship_target(relationship, package)
        mapping[relationship.rId] = target.relate_to(value, relationship.reltype, relationship.is_external)
    if hasattr(target, "_element"):
        remap_relationship_ids(target._element, mapping)


def validate_plan(plan, sha):
    fields(plan, ["title", "template", "slides"], "plan")
    fields(plan.get("template"), ["sha256"], "template")
    if plan["template"].get("sha256") != sha:
        raise ValueError("source hash differs from the inspected native template")
    if not isinstance(plan.get("title"), str) or not 1 <= len(plan["title"].strip()) <= 200:
        raise ValueError("title must contain 1–200 characters")
    if not isinstance(plan.get("slides"), list) or not 1 <= len(plan["slides"]) <= 200:
        raise ValueError("plan requires 1–200 slides")


def validate_slide_plan(slide_plan, source_count):
    fields(slide_plan, ["sourceSlide", "edits", "notes"], "slide")
    number = slide_plan.get("sourceSlide")
    if type(number) is not int or not 1 <= number <= source_count:
        raise ValueError("sourceSlide must be a one-based source slide index")
    edits = slide_plan.get("edits")
    if not isinstance(edits, list) or len(edits) > 500:
        raise ValueError("edits must be an array of at most 500 edits")
    return number, edits


def append_source_slide(presentation, original):
    package = presentation.part.package
    part = SlidePart(package.next_partname("/ppt/slides/slide%d.xml"), original.part.content_type,
                     package, copy.deepcopy(original._element))
    copy_relationships(original.part, part, package)
    relationship = presentation.part.relate_to(part, RT.SLIDE)
    presentation.slides._sldIdLst.add_sldId(relationship)
    return part.slide


def number_slide_fields(slide, number):
    for field in slide._element.iter("{http://schemas.openxmlformats.org/drawingml/2006/main}fld"):
        if field.get("type") == "slidenum":
            for value in field.iter("{http://schemas.openxmlformats.org/drawingml/2006/main}t"):
                value.text = str(number)


def validate_edit(edit, objects, deleted, touched):
    """Return (shape, kind, key) for a well-formed edit of a live object on the slide."""
    if not isinstance(edit, dict) or edit.get("kind") not in NATIVE_EDIT_FIELDS:
        raise ValueError("unsupported native edit kind")
    kind = edit["kind"]
    fields(edit, ["kind", "objectId", *NATIVE_EDIT_FIELDS[kind]], "edit")
    shape = objects.get(edit.get("objectId"))
    if shape is None:
        raise ValueError("objectId is absent from the selected source slide")
    if kind != "delete" and edit["objectId"] in deleted:
        raise ValueError("cannot edit a deleted object")
    key = (edit["objectId"], edit.get("row"), edit.get("column"))
    if key in touched and (not isinstance(touched[key].get("find"), str) or not isinstance(edit.get("find"), str)):
        raise ValueError("repeated native text edits must use targeted find replacements")
    return shape, kind, key


def delete_object(shape, edits):
    if shape.shape_type == MSO_SHAPE_TYPE.GROUP:
        descendants = {str(child.shape_id) for child in shapes(shape.shapes)}
        if any(isinstance(other, dict) and other.get("objectId") in descendants for other in edits):
            raise ValueError("cannot edit a descendant of a deleted group")
    shape._element.getparent().remove(shape._element)


def replace_table_cell(shape, edit):
    row, column = edit.get("row"), edit.get("column")
    if type(row) is not int or type(column) is not int or not 0 <= row < len(shape.table.rows) or not 0 <= column < len(shape.table.columns):
        raise ValueError("table cell is outside the native table")
    replace_text(shape.table.cell(row, column).text_frame, edit.get("text"), edit.get("find"))
    return shape.table.cell(row, column).text_frame


def replace_picture(slide, shape, image):
    template.add_picture(slide, image, dict(zip(("x", "y", "w", "h"),
        [value / 12700 for value in (shape.left, shape.top, shape.width, shape.height)])), name=shape.name)
    new = slide.shapes[-1]
    # Keep the frame, rotation, effects and group position; cover-fit
    # the new media using its own aspect ratio.
    shape._element.blipFill.blip.rEmbed = new._element.blipFill.blip.rEmbed
    # A bare data-URI string carries no alt text, as in template.add_picture.
    shape._element.nvPicPr.cNvPr.set("descr", image.get("alt", "") if isinstance(image, dict) else "")
    for attr in ("crop_left", "crop_right", "crop_top", "crop_bottom"):
        setattr(shape, attr, getattr(new, attr))
    new._element.getparent().remove(new._element)


def is_bounded_chart_value(value):
    # NaN fails every comparison, so this bound also rejects it.
    return type(value) in (int, float) and abs(value) <= 1e12


def replace_chart_data(shape, edit):
    categories, series = edit.get("categories"), edit.get("series")
    if not isinstance(categories, list) or not 1 <= len(categories) <= 100 or not all(isinstance(c, str) and len(c) <= 200 for c in categories):
        raise ValueError("chart requires 1–100 string categories")
    if not isinstance(series, list) or len(series) != len(shape.chart.series):
        raise ValueError("retain the source chart series count to preserve its color mapping")
    data = ChartData()
    data.categories = categories
    for entry in series:
        fields(entry, ["name", "values"], "series")
        values = entry.get("values")
        if not isinstance(entry.get("name"), str) or not isinstance(values, list) or len(values) != len(categories) or not all(is_bounded_chart_value(v) for v in values):
            raise ValueError("chart series require a name and finite, bounded values matching categories")
        data.add_series(entry["name"], values)
    shape.chart.replace_data(data)


def apply_edit(slide, shape, kind, edit, edits):
    """Apply one validated edit; return the edited text frame, if any."""
    if kind == "delete":
        delete_object(shape, edits)
        return None
    if kind == "text" and shape.has_text_frame:
        replace_text(shape.text_frame, edit.get("text"), edit.get("find"))
        return shape.text_frame
    if kind == "table-cell" and shape.has_table:
        return replace_table_cell(shape, edit)
    if kind == "image" and shape.shape_type == MSO_SHAPE_TYPE.PICTURE:
        replace_picture(slide, shape, edit["image"])
        return None
    if kind == "chart" and shape.has_chart:
        replace_chart_data(shape, edit)
        return None
    raise ValueError(f"{kind} edit is incompatible with native object {edit['objectId']}")


def apply_edits(slide, edits):
    """Apply a slide's edits in order; return the edited text frames keyed by target."""
    objects = {str(shape.shape_id): shape for shape in shapes(slide.shapes)}
    frames = {}
    touched = {}
    deleted = {edit.get("objectId") for edit in edits if isinstance(edit, dict) and edit.get("kind") == "delete" and isinstance(edit.get("objectId"), str)}
    for edit in edits:
        shape, kind, key = validate_edit(edit, objects, deleted, touched)
        touched[key] = edit
        frame = apply_edit(slide, shape, kind, edit, edits)
        if frame is not None:
            frames[key] = frame
    return frames


def set_notes(slide, slide_plan):
    if "notes" not in slide_plan:
        return
    if not isinstance(slide_plan["notes"], str) or len(slide_plan["notes"]) > 10000:
        raise ValueError("notes must be a string of at most 10000 characters")
    slide.notes_slide.notes_text_frame.text = slide_plan["notes"]


def compose(presentation, plan, sha):
    validate_plan(plan, sha)
    originals = list(presentation.slides)
    old_ids = list(presentation.slides._sldIdLst)
    required = []
    for slide_plan in plan["slides"]:
        number, edits = validate_slide_plan(slide_plan, len(originals))
        slide = append_source_slide(presentation, originals[number - 1])
        number_slide_fields(slide, len(required) + 1)
        frames = apply_edits(slide, edits)
        set_notes(slide, slide_plan)
        required.append([frame.text for frame in frames.values() if frame.text.strip()])
    for old in old_ids:
        presentation.part.drop_rel(old.rId)
        presentation.slides._sldIdLst.remove(old)
    presentation.core_properties.title = plan["title"]
    return required

def main():
    request = json.load(sys.stdin)
    path = Path(request["templatePath"])
    info = template.verify_template(path, request["mode"], set())
    presentation = Presentation(str(path))
    if request["operation"] == "inspect":
        return inspect(presentation, info["sha256"], request.get("slide"))
    required = compose(presentation, request["plan"], info["sha256"])
    output = Path(request["outPath"])
    presentation.save(str(output))
    return {**info, **template.prove_template_parts_preserved(path, output),
            "slides": len(presentation.slides), "requiredTextBySlide": required}


if __name__ == "__main__":
    try:
        print(json.dumps(main()))
    except (ValueError, KeyError, TypeError, OSError) as error:
        print(f"native template: {error}", file=sys.stderr)
        raise SystemExit(2) from error
