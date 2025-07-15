// Create a function that validate the phone number which should be 8 digits and start with 6 or 3.
import { checkPhoneExist } from "../firebase/firestoreUsage";
export async function phoneValidator(phone) {
  if (!phone) return "Phone number can't be empty.";
  if (phone.length !== 8) return "Phone number must be 8 characters long.";
  if (!/^[36]\d+$/.test(phone)) return "Phone number must start with 6 or 3.";
  const exist = await checkPhoneExist(phone);
  if (exist) return "Phone Number already exists";
  return "";
}
