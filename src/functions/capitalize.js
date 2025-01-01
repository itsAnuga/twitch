export default function capitalize(word) {
  return String(word).charAt(0).toUpperCase() + String(word).slice(1);
}
