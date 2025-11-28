import { Puzzle } from '@/types/game';

/**
 * Sample puzzle from the spec:
 * - Rows: word lengths (4, 5, 6, 7 letters)
 * - Columns: semantic categories (Animals, Clothing, Things that fly, Hot things)
 */
export const samplePuzzle: Puzzle = {
  id: 'puzzle-1',
  title: 'Animals, Clothes & More',
  rowCategories: [
    { id: 'len-4', label: '4 Letters' },
    { id: 'len-5', label: '5 Letters' },
    { id: 'len-6', label: '6 Letters' },
    { id: 'len-7', label: '7 Letters' },
  ],
  colCategories: [
    { id: 'animals', label: 'Animals' },
    { id: 'clothing', label: 'Clothing' },
    { id: 'fly', label: 'Things That Fly' },
    { id: 'hot', label: 'Hot Things' },
  ],
  words: [
    // 4-letter words
    { id: 'w-lion', text: 'lion', correctRowId: 'len-4', correctColId: 'animals' },
    { id: 'w-sock', text: 'sock', correctRowId: 'len-4', correctColId: 'clothing' },
    { id: 'w-moth', text: 'moth', correctRowId: 'len-4', correctColId: 'fly' },
    { id: 'w-lava', text: 'lava', correctRowId: 'len-4', correctColId: 'hot' },
    
    // 5-letter words
    { id: 'w-zebra', text: 'zebra', correctRowId: 'len-5', correctColId: 'animals' },
    { id: 'w-shirt', text: 'shirt', correctRowId: 'len-5', correctColId: 'clothing' },
    { id: 'w-eagle', text: 'eagle', correctRowId: 'len-5', correctColId: 'fly' },
    { id: 'w-chili', text: 'chili', correctRowId: 'len-5', correctColId: 'hot' },
    
    // 6-letter words
    { id: 'w-rabbit', text: 'rabbit', correctRowId: 'len-6', correctColId: 'animals' },
    { id: 'w-jacket', text: 'jacket', correctRowId: 'len-6', correctColId: 'clothing' },
    { id: 'w-rocket', text: 'rocket', correctRowId: 'len-6', correctColId: 'fly' },
    { id: 'w-summer', text: 'summer', correctRowId: 'len-6', correctColId: 'hot' },
    
    // 7-letter words
    { id: 'w-giraffe', text: 'giraffe', correctRowId: 'len-7', correctColId: 'animals' },
    { id: 'w-sweater', text: 'sweater', correctRowId: 'len-7', correctColId: 'clothing' },
    { id: 'w-sparrow', text: 'sparrow', correctRowId: 'len-7', correctColId: 'fly' },
    { id: 'w-firepit', text: 'firepit', correctRowId: 'len-7', correctColId: 'hot' },
  ],
};

/**
 * Get a shuffled copy of puzzle words for the word tray
 */
export function shuffleWords(puzzle: Puzzle): typeof puzzle.words {
  const shuffled = [...puzzle.words];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export const allPuzzles: Puzzle[] = [samplePuzzle];
