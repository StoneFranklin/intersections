import { Puzzle, Word } from '@/types/game';

/**
 * Seeded random number generator for consistent daily puzzles
 */
function seededRandom(seed: number): () => number {
  return function() {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
}

/**
 * Shuffle array with seeded random
 */
function seededShuffle<T>(array: T[], random: () => number): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// Fixed daily puzzle data - simulates database content
const DAILY_PUZZLE = {
  rowCategories: [
    { id: 'food', label: 'Food' },
    { id: 'animal', label: 'Animals' },
    { id: 'plant', label: 'Plants' },
    { id: 'toy', label: 'Toys' }
  ],
  colCategories: [
    { id: 'red', label: 'Red Things' },
    { id: 'small', label: 'Small Things' },
    { id: 'soft', label: 'Soft Things' },
    { id: 'round', label: 'Round Things' }
  ],
  words: [
    // Row 0 (food)
    { text: 'apple', row: 0, col: 0 }, // food + red
    { text: 'grape', row: 0, col: 1 }, // food + small  
    { text: 'peach', row: 0, col: 2 }, // food + soft
    { text: 'orange', row: 0, col: 3 }, // food + round
    
    // Row 1 (animal)
    { text: 'cardinal', row: 1, col: 0 }, // animal + red
    { text: 'mouse', row: 1, col: 1 }, // animal + small
    { text: 'kitten', row: 1, col: 2 }, // animal + soft  
    { text: 'panda', row: 1, col: 3 }, // animal + round
    
    // Row 2 (plant)
    { text: 'rose', row: 2, col: 0 }, // plant + red
    { text: 'moss', row: 2, col: 1 }, // plant + small
    { text: 'fern', row: 2, col: 2 }, // plant + soft
    { text: 'lily', row: 2, col: 3 }, // plant + round
    
    // Row 3 (toy)
    { text: 'truck', row: 3, col: 0 }, // toy + red
    { text: 'marble', row: 3, col: 1 }, // toy + small
    { text: 'doll', row: 3, col: 2 }, // toy + soft
    { text: 'ball', row: 3, col: 3 }, // toy + round
  ]
};

// Practice puzzles for random play
const PRACTICE_PUZZLES = [
  {
    rowCategories: [
      { id: 'vehicle', label: 'Vehicles' },
      { id: 'clothing', label: 'Clothing' },
      { id: 'furniture', label: 'Furniture' },
      { id: 'tool', label: 'Tools' }
    ],
    colCategories: [
      { id: 'metal', label: 'Metal Things' },
      { id: 'wooden', label: 'Wooden Things' },
      { id: 'big', label: 'Big Things' },
      { id: 'old', label: 'Old Things' }
    ],
    words: [
      { text: 'train', row: 0, col: 0 },
      { text: 'wagon', row: 0, col: 1 },
      { text: 'bus', row: 0, col: 2 },
      { text: 'carriage', row: 0, col: 3 },
      { text: 'buckle', row: 1, col: 0 },
      { text: 'clogs', row: 1, col: 1 },
      { text: 'coat', row: 1, col: 2 },
      { text: 'corset', row: 1, col: 3 },
      { text: 'bedframe', row: 2, col: 0 },
      { text: 'dresser', row: 2, col: 1 },
      { text: 'wardrobe', row: 2, col: 2 },
      { text: 'armoire', row: 2, col: 3 },
      { text: 'wrench', row: 3, col: 0 },
      { text: 'mallet', row: 3, col: 1 },
      { text: 'ladder', row: 3, col: 2 },
      { text: 'anvil', row: 3, col: 3 },
    ]
  },
  {
    rowCategories: [
      { id: 'drink', label: 'Drinks' },
      { id: 'sport', label: 'Sports' },
      { id: 'instrument', label: 'Instruments' },
      { id: 'weather', label: 'Weather' }
    ],
    colCategories: [
      { id: 'hot', label: 'Hot Things' },
      { id: 'cold', label: 'Cold Things' },
      { id: 'fast', label: 'Fast Things' },
      { id: 'loud', label: 'Loud Things' }
    ],
    words: [
      { text: 'coffee', row: 0, col: 0 },
      { text: 'smoothie', row: 0, col: 1 },
      { text: 'espresso', row: 0, col: 2 },
      { text: 'champagne', row: 0, col: 3 },
      { text: 'boxing', row: 1, col: 0 },
      { text: 'hockey', row: 1, col: 1 },
      { text: 'sprinting', row: 1, col: 2 },
      { text: 'football', row: 1, col: 3 },
      { text: 'trumpet', row: 2, col: 0 },
      { text: 'cello', row: 2, col: 1 },
      { text: 'violin', row: 2, col: 2 },
      { text: 'drums', row: 2, col: 3 },
      { text: 'heatwave', row: 3, col: 0 },
      { text: 'blizzard', row: 3, col: 1 },
      { text: 'tornado', row: 3, col: 2 },
      { text: 'thunder', row: 3, col: 3 },
    ]
  },
  {
    rowCategories: [
      { id: 'fruit', label: 'Fruits' },
      { id: 'vegetable', label: 'Vegetables' },
      { id: 'dessert', label: 'Desserts' },
      { id: 'meat', label: 'Meats' }
    ],
    colCategories: [
      { id: 'green', label: 'Green Things' },
      { id: 'sweet', label: 'Sweet Things' },
      { id: 'crunchy', label: 'Crunchy Things' },
      { id: 'tropical', label: 'Tropical Things' }
    ],
    words: [
      { text: 'kiwi', row: 0, col: 0 },
      { text: 'mango', row: 0, col: 1 },
      { text: 'apple', row: 0, col: 2 },
      { text: 'papaya', row: 0, col: 3 },
      { text: 'broccoli', row: 1, col: 0 },
      { text: 'corn', row: 1, col: 1 },
      { text: 'celery', row: 1, col: 2 },
      { text: 'coconut', row: 1, col: 3 },
      { text: 'pistachio', row: 2, col: 0 },
      { text: 'caramel', row: 2, col: 1 },
      { text: 'brittle', row: 2, col: 2 },
      { text: 'sorbet', row: 2, col: 3 },
      { text: 'pesto', row: 3, col: 0 },
      { text: 'honey ham', row: 3, col: 1 },
      { text: 'bacon', row: 3, col: 2 },
      { text: 'jerk', row: 3, col: 3 },
    ]
  }
];

/**
 * Convert puzzle data to Puzzle type
 */
function createPuzzle(data: typeof DAILY_PUZZLE, id: string): Puzzle {
  const words: Word[] = data.words.map((w) => ({
    id: `w-${w.row}-${w.col}-${w.text}`,
    text: w.text,
    correctRowId: data.rowCategories[w.row].id,
    correctColId: data.colCategories[w.col].id,
  }));

  return {
    id,
    title: 'Intersections',
    difficulty: 'easy',
    rowCategories: data.rowCategories,
    colCategories: data.colCategories,
    words,
  };
}

/**
 * Get today's date as a seed number
 */
function getDateSeed(date: Date = new Date()): number {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return year * 10000 + month * 100 + day;
}

/**
 * Generate a random practice puzzle
 */
export function generatePuzzle(): Puzzle {
  const randomIndex = Math.floor(Math.random() * PRACTICE_PUZZLES.length);
  return createPuzzle(PRACTICE_PUZZLES[randomIndex], `puzzle-practice-${Date.now()}`);
}

/**
 * Generate today's daily puzzle
 */
export function generateDailyPuzzle(): Puzzle {
  const dateSeed = getDateSeed();
  return createPuzzle(DAILY_PUZZLE, `puzzle-daily-${dateSeed}`);
}
