import abuseWords from "./abuseWords";

export default function detectAbuse(text) {

  const message = text.toLowerCase();
  const detectedWords = [];

  for (let word of abuseWords) {
    if (message.includes(word)) {
      detectedWords.push(word);
    }
  }

  return detectedWords;

}