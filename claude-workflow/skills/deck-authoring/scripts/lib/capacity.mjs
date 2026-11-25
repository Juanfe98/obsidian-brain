const SEED_WORDS =
  ('lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore '
    + 'magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo '
    + 'consequat duis aute irure reprehenderit voluptate velit esse cillum').split(' ');

// This must exceed any plausible text capacity on the 1920x1080 canvas. The
// caller fails closed if a future layout still fits the entire probe.
export const CAPACITY_PROBE_WORD_LIMIT = 4096;

export function capacityProbeText(wordLimit = CAPACITY_PROBE_WORD_LIMIT) {
  if (!Number.isInteger(wordLimit) || wordLimit < 1) {
    throw new Error(`capacity probe word limit must be a positive integer (got ${wordLimit})`);
  }
  return Array.from(
    { length: wordLimit },
    (_, index) => SEED_WORDS[index % SEED_WORDS.length],
  ).join(' ');
}
