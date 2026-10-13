export function isValidBirthdate(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const birthdate = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(birthdate.getTime()) && birthdate.toISOString().slice(0, 10) === value;
}

export function isAdultBirthdate(value: unknown): value is string {
  if (!isValidBirthdate(value)) return false;

  const birthdate = new Date(`${value}T00:00:00.000Z`);
  const now = new Date();
  let age = now.getUTCFullYear() - birthdate.getUTCFullYear();
  const birthdayHasPassed =
    now.getUTCMonth() > birthdate.getUTCMonth() ||
    (now.getUTCMonth() === birthdate.getUTCMonth() && now.getUTCDate() >= birthdate.getUTCDate());
  if (!birthdayHasPassed) age -= 1;

  return age >= 18;
}
