import { checkEmailExist } from "../firebase/firestoreUsage";
export async function emailValidator(email) {
  const re = /\S+@\S+\.\S+/;
  if (!email) return "Email can't be empty.";
  if (!re.test(email)) return "Ooops! We need a valid email address.";
  const exist = await checkEmailExist(email);
  if (exist) return "Email already exists";
  return "";
}
