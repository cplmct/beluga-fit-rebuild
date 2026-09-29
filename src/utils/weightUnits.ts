/** Weight is stored in kilograms; only convert it for display. */
export const KG_TO_LBS = 2.20462;

export function kgToDisplayWeight(weightKg: number, unit: string): number {
  return unit === 'lbs'
    ? Math.round(weightKg * KG_TO_LBS * 10) / 10
    : weightKg;
}

/** Keep the number paired with its input unit until the user edits it. */
export function profileWeightForUnit(
  input: string,
  inputUnit: string,
  displayUnit: string,
): string {
  if (input === '' || inputUnit === displayUnit) return input;
  const value = Number(input);
  if (!Number.isFinite(value)) return input;
  return inputUnit === 'lbs'
    ? String(Math.round(value * 0.453592 * 100) / 100)
    : String(kgToDisplayWeight(value, displayUnit));
}

export function profileWeightToKg(input: string, inputUnit: string): number | null {
  return input === ''
    ? null
    : parseFloat(input) * (inputUnit === 'lbs' ? 0.453592 : 1);
}
