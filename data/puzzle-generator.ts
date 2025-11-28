import { Difficulty, Puzzle, Word } from '@/types/game';

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
 * Shuffle with a seeded random
 */
function seededShuffle<T>(array: T[], random: () => number): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// Fixed puzzle data for each difficulty - simulates database content
const FIXED_EASY_PUZZLE = {
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
    // Row 0 (food): apple, strawberry, cherry, tomato
    { text: 'apple', row: 0, col: 0 }, // food + red
    { text: 'grape', row: 0, col: 1 }, // food + small  
    { text: 'peach', row: 0, col: 2 }, // food + soft
    { text: 'orange', row: 0, col: 3 }, // food + round
    
    // Row 1 (animal): cardinal, hamster, rabbit, ball python
    { text: 'cardinal', row: 1, col: 0 }, // animal + red
    { text: 'mouse', row: 1, col: 1 }, // animal + small
    { text: 'kitten', row: 1, col: 2 }, // animal + soft  
    { text: 'panda', row: 1, col: 3 }, // animal + round
    
    // Row 2 (plant): rose, moss, fern, sunflower  
    { text: 'rose', row: 2, col: 0 }, // plant + red
    { text: 'moss', row: 2, col: 1 }, // plant + small
    { text: 'fern', row: 2, col: 2 }, // plant + soft
    { text: 'lily', row: 2, col: 3 }, // plant + round
    
    // Row 3 (toy): fire truck, marble, teddy bear, ball
    { text: 'truck', row: 3, col: 0 }, // toy + red
    { text: 'marble', row: 3, col: 1 }, // toy + small
    { text: 'doll', row: 3, col: 2 }, // toy + soft
    { text: 'ball', row: 3, col: 3 }, // toy + round
  ]
};

const FIXED_MEDIUM_PUZZLE = {
  rowCategories: [
    { id: 'food', label: 'Food' },
    { id: 'animal', label: 'Animals' },
    { id: 'plant', label: 'Plants' },
    { id: 'toy', label: 'Toys' }
  ],
  colCategories: [
    { id: 'small', label: 'Small Things' },
    { id: 'red', label: 'Red Things' },
    { id: 'soft', label: 'Soft Things' },
    { id: 'outdoor', label: 'Outdoor Things' }
  ],
  rightCategories: [
    { id: 'sweet', label: 'Sweet Things' },
    { id: 'fuzzy', label: 'Fuzzy Things' },
    { id: 'green', label: 'Green Things' },
    { id: 'round', label: 'Round Things' }
  ],
  words: [
    // Row 0 (food + sweet): cherry, strawberry, peach, apple
    { text: 'cherry', row: 0, col: 0 }, // food + small + sweet
    { text: 'strawberry', row: 0, col: 1 }, // food + red + sweet
    { text: 'peach', row: 0, col: 2 }, // food + soft + sweet
    { text: 'apple', row: 0, col: 3 }, // food + outdoor + sweet
    
    // Row 1 (animal + fuzzy): hamster, fox, rabbit, squirrel
    { text: 'hamster', row: 1, col: 0 }, // animal + small + fuzzy
    { text: 'fox', row: 1, col: 1 }, // animal + red + fuzzy  
    { text: 'rabbit', row: 1, col: 2 }, // animal + soft + fuzzy
    { text: 'squirrel', row: 1, col: 3 }, // animal + outdoor + fuzzy
    
    // Row 2 (plant + green): moss, rose, fern, tree
    { text: 'moss', row: 2, col: 0 }, // plant + small + green
    { text: 'rose', row: 2, col: 1 }, // plant + red + green (leaves)
    { text: 'fern', row: 2, col: 2 }, // plant + soft + green
    { text: 'tree', row: 2, col: 3 }, // plant + outdoor + green
    
    // Row 3 (toy + round): marble, ball, yo-yo, frisbee
    { text: 'marble', row: 3, col: 0 }, // toy + small + round
    { text: 'ball', row: 3, col: 1 }, // toy + red + round (red ball)
    { text: 'yo-yo', row: 3, col: 2 }, // toy + soft + round (soft grip)
    { text: 'frisbee', row: 3, col: 3 }, // toy + outdoor + round
  ]
};

const FIXED_HARD_PUZZLE = {
  rowCategories: [
    { id: 'food', label: 'Food' },
    { id: 'animal', label: 'Animals' },
    { id: 'plant', label: 'Plants' },
    { id: 'toy', label: 'Toys' }
  ],
  colCategories: [
    { id: 'small', label: 'Small Things' },
    { id: 'red', label: 'Red Things' },
    { id: 'soft', label: 'Soft Things' },
    { id: 'outdoor', label: 'Outdoor Things' }
  ],
  rightCategories: [
    { id: 'sweet', label: 'Sweet Things' },
    { id: 'fuzzy', label: 'Fuzzy Things' },
    { id: 'green', label: 'Green Things' },
    { id: 'round', label: 'Round Things' }
  ],
  bottomCategories: [
    { id: 'water', label: 'Water Related' },
    { id: 'indoor', label: 'Indoor Things' },
    { id: 'big', label: 'Big Things' },
    { id: 'hard', label: 'Hard Things' }
  ],
  words: [
    // Row 0 (food + sweet): cherry, apple, peach, watermelon
    { text: 'cherry', row: 0, col: 0 }, // food + small + sweet + water
    { text: 'apple', row: 0, col: 1 }, // food + red + sweet + indoor
    { text: 'peach', row: 0, col: 2 }, // food + soft + sweet + big
    { text: 'coconut', row: 0, col: 3 }, // food + outdoor + sweet + hard
    
    // Row 1 (animal + fuzzy): hamster, fox, rabbit, bear
    { text: 'hamster', row: 1, col: 0 }, // animal + small + fuzzy + water
    { text: 'fox', row: 1, col: 1 }, // animal + red + fuzzy + indoor
    { text: 'rabbit', row: 1, col: 2 }, // animal + soft + fuzzy + big
    { text: 'bear', row: 1, col: 3 }, // animal + outdoor + fuzzy + hard
    
    // Row 2 (plant + green): moss, rose, fern, tree
    { text: 'moss', row: 2, col: 0 }, // plant + small + green + water
    { text: 'rose', row: 2, col: 1 }, // plant + red + green + indoor
    { text: 'fern', row: 2, col: 2 }, // plant + soft + green + big
    { text: 'oak', row: 2, col: 3 }, // plant + outdoor + green + hard
    
    // Row 3 (toy + round): marble, ball, yo-yo, frisbee
    { text: 'marble', row: 3, col: 0 }, // toy + small + round + water (glass marble)
    { text: 'ball', row: 3, col: 1 }, // toy + red + round + indoor
    { text: 'balloon', row: 3, col: 2 }, // toy + soft + round + big
    { text: 'tire', row: 3, col: 3 }, // toy + outdoor + round + hard (tire swing)
  ]
};

/**
 * Generate an Easy puzzle (2-way intersections)
 */
function generateEasyPuzzle(random: () => number): Puzzle | null {
  const puzzle = FIXED_EASY_PUZZLE;
  const words: Word[] = [];
  
  for (const wordData of puzzle.words) {
    words.push({
      id: `w-${wordData.row}-${wordData.col}-${wordData.text}`,
      text: wordData.text,
      correctRowId: puzzle.rowCategories[wordData.row].id,
      correctColId: puzzle.colCategories[wordData.col].id,
    });
  }
  
  return {
    id: `puzzle-easy-${Date.now()}`,
    title: 'Easy',
    difficulty: 'easy',
    rowCategories: puzzle.rowCategories,
    colCategories: puzzle.colCategories,
    words,
  };
}

/**
 * Generate a Medium puzzle (3-way intersections)
 */
function generateMediumPuzzle(random: () => number): Puzzle | null {
  const puzzle = FIXED_MEDIUM_PUZZLE;
  const words: Word[] = [];
  
  for (const wordData of puzzle.words) {
    words.push({
      id: `w-${wordData.row}-${wordData.col}-${wordData.text}`,
      text: wordData.text,
      correctRowId: puzzle.rowCategories[wordData.row].id,
      correctColId: puzzle.colCategories[wordData.col].id,
      correctRightId: puzzle.rightCategories[wordData.row].id,
    });
  }
  
  return {
    id: `puzzle-medium-${Date.now()}`,
    title: 'Medium',
    difficulty: 'medium',
    rowCategories: puzzle.rowCategories,
    colCategories: puzzle.colCategories,
    rightCategories: puzzle.rightCategories,
    words,
  };
}

/**
 * Generate a Hard puzzle (4-way intersections)
 */
function generateHardPuzzle(random: () => number): Puzzle | null {
  const puzzle = FIXED_HARD_PUZZLE;
  const words: Word[] = [];
  
  for (const wordData of puzzle.words) {
    words.push({
      id: `w-${wordData.row}-${wordData.col}-${wordData.text}`,
      text: wordData.text,
      correctRowId: puzzle.rowCategories[wordData.row].id,
      correctColId: puzzle.colCategories[wordData.col].id,
      correctRightId: puzzle.rightCategories[wordData.row].id,
      correctBottomId: puzzle.bottomCategories[wordData.col].id,
    });
  }
  
  return {
    id: `puzzle-hard-${Date.now()}`,
    title: 'Hard',
    difficulty: 'hard',
    rowCategories: puzzle.rowCategories,
    colCategories: puzzle.colCategories,
    rightCategories: puzzle.rightCategories,
    bottomCategories: puzzle.bottomCategories,
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
 * Generate a puzzle for a specific difficulty
 */
export function generatePuzzle(difficulty: Difficulty = 'easy'): Puzzle {
  const random = seededRandom(Date.now());
  
  let puzzle: Puzzle | null = null;
  let attempts = 0;
  const maxAttempts = 10;
  
  while (!puzzle && attempts < maxAttempts) {
    attempts++;
    if (difficulty === 'easy') {
      puzzle = generateEasyPuzzle(random);
    } else if (difficulty === 'medium') {
      puzzle = generateMediumPuzzle(random);
    } else {
      puzzle = generateHardPuzzle(random);
    }
  }
  
  if (!puzzle) {
    console.warn(`Could not generate ${difficulty} puzzle, falling back to easy`);
    return generatePuzzle('easy');
  }
  
  return puzzle;
}

/**
 * Generate today's daily puzzle for a specific difficulty
 */
export function generateDailyPuzzle(difficulty: Difficulty): Puzzle {
  const dateSeed = getDateSeed();
  // Add offset for each difficulty to get different puzzles
  const difficultyOffset = difficulty === 'easy' ? 0 : difficulty === 'medium' ? 1000 : 2000;
  const random = seededRandom(dateSeed + difficultyOffset);
  
  let puzzle: Puzzle | null = null;
  let attempts = 0;
  const maxAttempts = 20;
  
  while (!puzzle && attempts < maxAttempts) {
    attempts++;
    if (difficulty === 'easy') {
      puzzle = generateEasyPuzzle(random);
    } else if (difficulty === 'medium') {
      puzzle = generateMediumPuzzle(random);
    } else {
      puzzle = generateHardPuzzle(random);
    }
  }
  
  if (!puzzle) {
    console.warn(`Could not generate daily ${difficulty} puzzle, falling back to easy`);
    const fallbackRandom = seededRandom(dateSeed);
    puzzle = generateEasyPuzzle(fallbackRandom);
    if (!puzzle) {
      // Ultimate fallback
      return generatePuzzle('easy');
    }
  }
  
  return puzzle;
}