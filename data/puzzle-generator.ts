import { Category, Puzzle, Word } from '@/types/game';
import {
    categories,
    getWordsAtIntersection,
    SemanticCategory,
} from './semantic-words';

/**
 * Shuffle an array using Fisher-Yates algorithm
 */
function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Pick n random items from an array
 */
function pickRandom<T>(array: T[], n: number): T[] {
  return shuffle(array).slice(0, n);
}

/**
 * Find valid category combinations that have words at all intersections
 */
function findValidCategoryPairs(
  maxAttempts: number = 100
): { rowCats: SemanticCategory[]; colCats: SemanticCategory[] } | null {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const shuffledCats = shuffle(categories);
    
    // Pick 4 categories for rows and 4 different ones for columns
    const rowCandidates = shuffledCats.slice(0, 4);
    const colCandidates = shuffledCats.slice(4, 8);
    
    // Check that all intersections have at least one word
    let valid = true;
    for (const rowCat of rowCandidates) {
      for (const colCat of colCandidates) {
        const words = getWordsAtIntersection(rowCat.id, colCat.id);
        if (words.length === 0) {
          valid = false;
          break;
        }
      }
      if (!valid) break;
    }
    
    if (valid) {
      return { rowCats: rowCandidates, colCats: colCandidates };
    }
  }
  
  return null;
}

/**
 * Generate a random 4x4 puzzle with semantic categories for both rows and columns
 */
export function generatePuzzle(): Puzzle {
  // Find valid category combinations
  const catPair = findValidCategoryPairs();
  
  if (!catPair) {
    // Very unlikely, but retry
    console.warn('Could not find valid categories, retrying...');
    return generatePuzzle();
  }
  
  const puzzle = tryGeneratePuzzle(catPair.rowCats, catPair.colCats);
  
  if (!puzzle) {
    // Retry with new categories
    return generatePuzzle();
  }
  
  return puzzle;
}

function tryGeneratePuzzle(
  rowCats: SemanticCategory[],
  colCats: SemanticCategory[]
): Puzzle | null {
  const words: Word[] = [];
  const usedWords = new Set<string>();
  
  // For each cell (row x column), pick a word at the intersection
  for (let rowIdx = 0; rowIdx < rowCats.length; rowIdx++) {
    const rowCat = rowCats[rowIdx];
    
    for (let colIdx = 0; colIdx < colCats.length; colIdx++) {
      const colCat = colCats[colIdx];
      
      // Get words that belong to both categories
      const availableWords = getWordsAtIntersection(rowCat.id, colCat.id)
        .filter(w => !usedWords.has(w));
      
      if (availableWords.length === 0) {
        // Can't complete puzzle
        return null;
      }
      
      const word = pickRandom(availableWords, 1)[0];
      usedWords.add(word);
      
      words.push({
        id: `w-${word}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        text: word,
        correctRowId: rowCat.id,
        correctColId: colCat.id,
      });
    }
  }
  
  // Build row categories
  const rowCategories: Category[] = rowCats.map(cat => ({
    id: cat.id,
    label: cat.label,
  }));
  
  // Build column categories
  const colCategories: Category[] = colCats.map(cat => ({
    id: cat.id,
    label: cat.label,
  }));
  
  // Create title from some categories
  const allCats = [...rowCats, ...colCats];
  const title = pickRandom(allCats, 2)
    .map(c => c.label.replace(' Things', '').replace('Found in ', '').replace('Made of ', ''))
    .join(' & ');
  
  return {
    id: `puzzle-${Date.now()}`,
    title,
    rowCategories,
    colCategories,
    words,
  };
}

