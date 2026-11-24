import test from "node:test";
import assert from "node:assert/strict";
import { formatName } from "../src/helpers/formatName.js";
import { nameValidator } from "../src/helpers/nameValidator.js";
import { passwordValidator } from "../src/helpers/passwordValidator.js";
import { validateWhatsAppGroupLink } from "../src/helpers/waValidator.js";

test("name validation rejects empty and whitespace-only input", () => {
  assert.equal(nameValidator(""), "Name can't be empty.");
  assert.equal(nameValidator("   "), "Name can't be empty.");
  assert.equal(nameValidator("Ada Lovelace"), "");
});

test("password validation enforces the current minimum length", () => {
  assert.equal(passwordValidator(""), "Password can't be empty.");
  assert.equal(passwordValidator("12345"), "Password must be at least 6 characters long.");
  assert.equal(passwordValidator("123456"), "");
});

test("WhatsApp group links must use the supported invite URL format", () => {
  assert.equal(validateWhatsAppGroupLink(""), "Link can't be empty.");
  assert.equal(
    validateWhatsAppGroupLink("http://chat.whatsapp.com/example"),
    "Invalid WhatsApp group link."
  );
  assert.equal(
    validateWhatsAppGroupLink("https://chat.whatsapp.com/invite_code-1"),
    ""
  );
});

test("name formatting capitalizes each word", () => {
  assert.equal(formatName("aDA loVELACE"), "Ada Lovelace");
  assert.equal(formatName(""), "");
});
