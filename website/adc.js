// Ideal quantizer only: no analog tolerance, timing, noise, or lux calibration.
export const REFERENCE = 2.5;
export const THRESHOLDS = Array.from({length:7}, (_, i) => (i + 1) * REFERENCE / 8);
export const SEGMENTS = ['abcdef','bc','abdeg','abcdg','bcfg','acdfg','acdefg','abc'];
export function quantize(voltage) {
  const value = Math.max(0, Math.min(REFERENCE, Number(voltage) || 0));
  const level = THRESHOLDS.filter(threshold => value >= threshold).length;
  return {voltage:value, level, binary:level.toString(2).padStart(3,'0'), crossed:THRESHOLDS.map(t=>value>=t), segments:SEGMENTS[level]};
}
