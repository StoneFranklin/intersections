import { BANNED_WORDS } from './bannedWords';

const MIN_LENGTH = 3;
const MAX_LENGTH = 20;
const ALLOWED_CHARS = /^[A-Za-z0-9 _.-]+$/;
const EMOJI_PATTERN =
  /[\u200D\uFE0E\uFE0F]|\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|\uD83E[\uDD00-\uDFFF]/;

const LEET_MAP: Record<string, string> = {
  '0': 'o',
  '1': 'i',
  '3': 'e',
  '4': 'a',
  '5': 's',
  '7': 't',
  '@': 'a',
  '$': 's',
  '!': 'i',
};

export function normalizeDisplayName(input: string): string {
  return input.normalize('NFKC').trim().replace(/\s+/g, ' ');
}

function normalizeForComparison(input: string): string {
  const lower = input.toLowerCase();
  const mapped = lower
    .split('')
    .map(char => LEET_MAP[char] || char)
    .join('');
  return mapped.replace(/[^a-z0-9]/g, '');
}

const BANNED_NORMALIZED = BANNED_WORDS
  .map(word => normalizeForComparison(word))
  .filter(word => word.length >= 3);

export function validateDisplayName(input: string): { ok: boolean; normalized: string; error?: string } {
  const normalized = normalizeDisplayName(input);

  if (!normalized) {
    return { ok: false, normalized, error: 'Display name cannot be empty.' };
  }

  if (normalized.length < MIN_LENGTH || normalized.length > MAX_LENGTH) {
    return { ok: false, normalized, error: `Use ${MIN_LENGTH}-${MAX_LENGTH} characters.` };
  }

  if (EMOJI_PATTERN.test(normalized)) {
    return { ok: false, normalized, error: 'Emojis are not allowed in display names.' };
  }

  if (!ALLOWED_CHARS.test(normalized)) {
    return { ok: false, normalized, error: 'Only letters, numbers, spaces, and _ . - are allowed.' };
  }

  const comparison = normalizeForComparison(normalized);
  for (const fragment of BANNED_NORMALIZED) {
    if (comparison.includes(fragment)) {
      return { ok: false, normalized, error: 'Please choose a different display name.' };
    }
  }

  return { ok: true, normalized };
}
