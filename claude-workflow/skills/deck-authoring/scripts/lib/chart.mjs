export const MAX_CHART_VALUE_MAGNITUDE = Number.MAX_SAFE_INTEGER;

export function chartValueIsSafe(value) {
  return Number.isFinite(value) && Math.abs(value) <= MAX_CHART_VALUE_MAGNITUDE;
}

export function chartPresentation(chart) {
  const values = chart.series.flatMap((series) => series.values);
  if (!values.every(chartValueIsSafe)) {
    throw new Error(`chart values must be finite and within ±${MAX_CHART_VALUE_MAGNITUDE}`);
  }

  const polar = chart.type === 'pie' || chart.type === 'doughnut';
  if (polar) {
    return {
      polar,
      showLegend: true,
      min: null,
      max: null,
      zoomed: false,
    };
  }

  const dataMin = Math.min(...values);
  const dataMax = Math.max(...values);
  const dataSpan = dataMax - dataMin;
  const zeroBased = chart.type === 'bar';
  const padding = dataSpan === 0 ? Math.abs(dataMax || 1) * 0.1 : dataSpan * 0.15;
  const min = zeroBased ? Math.min(0, dataMin) : dataMin - padding;
  const max = zeroBased ? Math.max(0, dataMax) : dataMax + padding;
  const zeroExcluded = !zeroBased && (min > 0 || max < 0);
  let axisNote = null;
  if (zeroExcluded) {
    axisNote = min > 0 ? `axis starts at ${formatBound(min)}` : `axis ends at ${formatBound(max)}`;
  }

  return {
    polar,
    showLegend: chart.series.length > 1,
    min,
    max,
    zoomed: zeroExcluded,
    axisNote,
  };
}

function formatBound(value) {
  return String(+value.toFixed(2));
}
