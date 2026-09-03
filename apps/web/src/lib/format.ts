export function formatNumber(value: number, precision = 5) {
  if (!Number.isFinite(value)) return String(value);
  if (Math.abs(value) < 1e-10) return "0";
  return Number(value.toFixed(precision)).toString();
}
