// Create a function that format the name so that every first char be Upper Space for example hamza abdulla must return Hamza Abdulla and so on
export function formatName(name) {
  if (!name) return "";
  return name
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}
