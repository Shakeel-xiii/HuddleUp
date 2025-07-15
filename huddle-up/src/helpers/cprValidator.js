// Create a function that validate a cpr number which contain 9 numerec digits first two represent a year for example if born in 2014 then it's 14 and, the second 2's represent the month so if the person born in Febuary then its 02 last 5 are random! the function input's would be the cpr number as a string and bithdate as date.
import { checkCPRexist } from "../firebase/firestoreUsage";
export async function cprValidator(cpr, birthDate) {
  if (!cpr) return "CPR can't be empty.";
  if (cpr.length !== 9) return "CPR must be 9 characters long.";
  if (!/^\d+$/.test(cpr)) return "CPR must contain only digits.";
  const year = birthDate.getFullYear().toString().slice(-2);
  const month = (birthDate.getMonth() + 1).toString().padStart(2, "0");
  const expectedCpr = `${year}${month}${cpr.slice(4)}`;
  if (cpr !== expectedCpr) return "CPR doesn't match birthdate.";
  const exist = await checkCPRexist(cpr);
  if (exist) return "CPR Already exists";
  return "";
}
