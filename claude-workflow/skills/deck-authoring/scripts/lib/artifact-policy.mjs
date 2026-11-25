const FALLBACK_FINGERPRINTS = [/Arial/i, /Helvetica/i, /Times(New)?Roman/i, /Courier/i];

export function checkPdfFonts(fonts, intendedFamilies) {
  const wanted = intendedFamilies.map((family) => family.replace(/\s+/g, '').toLowerCase());
  const findings = [];
  for (const font of fonts) {
    const bare = font
      .replace(/^[A-Z]{6}\+/, '')
      .replace(/[-,].*$/, '')
      .replace(/\s+/g, '')
      .toLowerCase();
    if (wanted.some((family) => bare.includes(family) || family.includes(bare))) {
      continue;
    }
    if (FALLBACK_FINGERPRINTS.some((fingerprint) => fingerprint.test(bare))) {
      findings.push({
        rule: 'pdf-font-substituted',
        severity: 'high',
        detail: `PDF embeds ${font}, which is not an intended family (${intendedFamilies.join(', ')}); the renderer substituted it`,
      });
    }
  }
  return findings;
}
