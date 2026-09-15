// [Smoosic](https://github.com/AaronDavidNewman/Smoosic)
// ## Description:
// Boomwhacker-style note colors, used to color noteheads by pitch letter so
// young students can visually match what they see on the staff to the same
// colors used across the kids' ear-training mini-games (Do=red .. Si=pink).
import { PitchLetter } from './common';

const pitchColors: Record<PitchLetter, string> = {
  c: '#e53935', // Do
  d: '#fb8c00', // Re
  e: '#fdd835', // Mi
  f: '#43a047', // Fa
  g: '#1e88e5', // Sol
  a: '#8e24aa', // La
  b: '#ec407a'  // Si
};

export function colorForPitch(letter: PitchLetter): string {
  return pitchColors[letter] ?? '';
}
