/** Weight is stored in kilograms; only convert it for display. */
export const KG_TO_LBS = 2.20462;

function roundDisplayWeight(value: number, places: number): number {
  return Number(value.toFixed(places));
}

export function kgToDisplayWeight(weightKg: number, unit: string): number {
  return unit === 'lbs'
    ? Math.round(weightKg * KG_TO_LBS * 10) / 10
    : roundDisplayWeight(weightKg, 2);
}

/** Keep the number paired with its input unit until the user edits it. */
export function profileWeightForUnit(
  input: string,
  inputUnit: string,
  displayUnit: string,
): string {
  if (input === '') return input;
  const value = Number(input);
  if (!Number.isFinite(value)) return input;
  if (inputUnit === displayUnit) {
    // Keep in-progress edits such as "95." or "95.0" intact.
    return inputUnit === 'kg' && (input === String(value) || /^-?\d+\.\d{2,}$/.test(input))
      ? String(kgToDisplayWeight(value, 'kg'))
      : input;
  }
  return inputUnit === 'lbs'
    ? String(kgToDisplayWeight(value * 0.453592, 'kg'))
    : String(kgToDisplayWeight(value, displayUnit));
}

export function profileWeightToKg(input: string, inputUnit: string): number | null {
  return input === ''
    ? null
    : parseFloat(input) * (inputUnit === 'lbs' ? 0.453592 : 1);
}
