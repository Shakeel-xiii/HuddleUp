// CReate a whatsapp group link validator regex function
export function validateWhatsAppGroupLink(link) {
  if (!link) return "Link can't be empty.";
  const regex = /^https:\/\/chat\.whatsapp\.com\/[a-zA-Z0-9_-]+$/;
  if (!regex.test(link)) return "Invalid WhatsApp group link.";
  return "";
}
