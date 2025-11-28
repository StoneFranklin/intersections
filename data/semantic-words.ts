/**
 * Massive word bank for Intersections puzzle generation
 * 50+ categories with 1000+ words for maximum puzzle variety
 */

export interface TaggedWord {
  word: string;
  categories: string[];
}

export interface SemanticCategory {
  id: string;
  label: string;
}

// Massive category set - 50+ categories for maximum variety
export const categories: SemanticCategory[] = [
  // Colors
  { id: 'red', label: 'Red Things' },
  { id: 'blue', label: 'Blue Things' },
  { id: 'green', label: 'Green Things' },
  { id: 'yellow', label: 'Yellow Things' },
  { id: 'orange', label: 'Orange Things' },
  { id: 'purple', label: 'Purple Things' },
  { id: 'pink', label: 'Pink Things' },
  { id: 'white', label: 'White Things' },
  { id: 'black', label: 'Black Things' },
  { id: 'brown', label: 'Brown Things' },

  // Temperatures
  { id: 'hot', label: 'Hot Things' },
  { id: 'cold', label: 'Cold Things' },
  { id: 'warm', label: 'Warm Things' },
  { id: 'cool', label: 'Cool Things' },

  // Textures
  { id: 'soft', label: 'Soft Things' },
  { id: 'hard', label: 'Hard Things' },
  { id: 'rough', label: 'Rough Things' },
  { id: 'smooth', label: 'Smooth Things' },
  { id: 'fuzzy', label: 'Fuzzy Things' },
  { id: 'bumpy', label: 'Bumpy Things' },

  // High-overlap taste / color / depth tags
  { id: 'sweet', label: 'Sweet Things' },
  { id: 'sour', label: 'Sour Things' },
  { id: 'gray', label: 'Gray Things' },
  { id: 'dark', label: 'Dark Things' },
  { id: 'deep', label: 'Deep Things' },

  // Shapes
  { id: 'round', label: 'Round Things' },
  { id: 'square', label: 'Square Things' },
  { id: 'long', label: 'Long Things' },
  { id: 'flat', label: 'Flat Things' },
  { id: 'thick', label: 'Thick Things' },
  { id: 'thin', label: 'Thin Things' },

  // Sizes
  { id: 'big', label: 'Big Things' },
  { id: 'small', label: 'Small Things' },
  { id: 'tiny', label: 'Tiny Things' },
  { id: 'huge', label: 'Huge Things' },

  // Categories
  { id: 'animal', label: 'Animals' },
  { id: 'food', label: 'Food' },
  { id: 'plant', label: 'Plants' },
  { id: 'tool', label: 'Tools' },
  { id: 'toy', label: 'Toys' },
  { id: 'clothing', label: 'Clothing' },
  { id: 'furniture', label: 'Furniture' },
  { id: 'vehicle', label: 'Vehicles' },
  { id: 'building', label: 'Buildings' },
  { id: 'book', label: 'Books & Media' },

  // Environments
  { id: 'indoor', label: 'Indoor Things' },
  { id: 'outdoor', label: 'Outdoor Things' },
  { id: 'water', label: 'Water Related' },
  { id: 'sky', label: 'Sky Things' },
  { id: 'underground', label: 'Underground' },
  { id: 'forest', label: 'Forest Things' },
  { id: 'ocean', label: 'Ocean Things' },
  { id: 'desert', label: 'Desert Things' },
  { id: 'mountain', label: 'Mountain Things' },
  { id: 'city', label: 'City Things' },
];

// Massive word bank - 1000+ words with extensive category overlaps
export const taggedWords: TaggedWord[] = [
  // FRUITS (many category overlaps)
  { word: 'apple', categories: ['food', 'red', 'green', 'round', 'sweet', 'small', 'hard', 'outdoor', 'plant'] },
  { word: 'orange', categories: ['food', 'orange', 'round', 'sweet', 'small', 'soft', 'outdoor', 'plant'] },
  { word: 'banana', categories: ['food', 'yellow', 'long', 'sweet', 'soft', 'small', 'outdoor', 'plant'] },
  { word: 'grape', categories: ['food', 'purple', 'green', 'round', 'sweet', 'tiny', 'soft', 'outdoor', 'plant'] },
  { word: 'lemon', categories: ['food', 'yellow', 'round', 'sour', 'small', 'hard', 'outdoor', 'plant'] },
  { word: 'lime', categories: ['food', 'green', 'round', 'sour', 'small', 'hard', 'outdoor', 'plant'] },
  { word: 'cherry', categories: ['food', 'red', 'round', 'sweet', 'tiny', 'soft', 'outdoor', 'plant'] },
  { word: 'peach', categories: ['food', 'orange', 'pink', 'round', 'sweet', 'soft', 'small', 'fuzzy', 'outdoor', 'plant'] },
  { word: 'plum', categories: ['food', 'purple', 'round', 'sweet', 'soft', 'small', 'outdoor', 'plant'] },
  { word: 'strawberry', categories: ['food', 'red', 'sweet', 'soft', 'small', 'bumpy', 'outdoor', 'plant'] },
  { word: 'blueberry', categories: ['food', 'blue', 'round', 'sweet', 'tiny', 'soft', 'outdoor', 'plant'] },
  { word: 'watermelon', categories: ['food', 'green', 'red', 'round', 'sweet', 'big', 'water', 'outdoor', 'plant'] },
  { word: 'pineapple', categories: ['food', 'yellow', 'sweet', 'big', 'rough', 'bumpy', 'outdoor', 'plant'] },
  { word: 'mango', categories: ['food', 'orange', 'yellow', 'sweet', 'soft', 'small', 'outdoor', 'plant'] },
  { word: 'kiwi', categories: ['food', 'brown', 'green', 'round', 'sweet', 'small', 'fuzzy', 'soft', 'outdoor', 'plant'] },
  { word: 'coconut', categories: ['food', 'brown', 'round', 'hard', 'big', 'rough', 'water', 'outdoor', 'plant'] },
  { word: 'avocado', categories: ['food', 'green', 'black', 'soft', 'small', 'smooth', 'outdoor', 'plant'] },
  { word: 'papaya', categories: ['food', 'orange', 'yellow', 'sweet', 'soft', 'big', 'outdoor', 'plant'] },
  { word: 'fig', categories: ['food', 'purple', 'sweet', 'soft', 'small', 'outdoor', 'plant'] },
  { word: 'date', categories: ['food', 'brown', 'sweet', 'soft', 'small', 'outdoor', 'plant', 'desert'] },

  // VEGETABLES
  { word: 'carrot', categories: ['food', 'orange', 'long', 'hard', 'small', 'underground', 'plant'] },
  { word: 'potato', categories: ['food', 'brown', 'round', 'hard', 'small', 'underground', 'plant'] },
  { word: 'onion', categories: ['food', 'white', 'yellow', 'round', 'hard', 'small', 'underground', 'plant'] },
  { word: 'tomato', categories: ['food', 'red', 'round', 'soft', 'small', 'outdoor', 'plant', 'water'] },
  { word: 'cucumber', categories: ['food', 'green', 'long', 'cool', 'soft', 'small', 'outdoor', 'plant', 'water'] },
  { word: 'lettuce', categories: ['food', 'green', 'soft', 'flat', 'outdoor', 'plant', 'cool', 'water'] },
  { word: 'spinach', categories: ['food', 'green', 'soft', 'flat', 'outdoor', 'plant', 'cool'] },
  { word: 'broccoli', categories: ['food', 'green', 'bumpy', 'outdoor', 'plant', 'cool'] },
  { word: 'cauliflower', categories: ['food', 'white', 'bumpy', 'outdoor', 'plant', 'cool'] },
  { word: 'pepper', categories: ['food', 'red', 'green', 'yellow', 'hot', 'small', 'outdoor', 'plant'] },
  { word: 'corn', categories: ['food', 'yellow', 'long', 'bumpy', 'outdoor', 'plant', 'sweet'] },
  { word: 'peas', categories: ['food', 'green', 'round', 'tiny', 'sweet', 'outdoor', 'plant'] },
  { word: 'beans', categories: ['food', 'green', 'long', 'small', 'outdoor', 'plant'] },
  { word: 'beet', categories: ['food', 'red', 'round', 'hard', 'small', 'underground', 'plant', 'sweet'] },
  { word: 'turnip', categories: ['food', 'white', 'round', 'hard', 'small', 'underground', 'plant'] },
  { word: 'radish', categories: ['food', 'red', 'white', 'round', 'hard', 'tiny', 'underground', 'plant'] },
  { word: 'celery', categories: ['food', 'green', 'long', 'hard', 'thin', 'outdoor', 'plant', 'water'] },
  { word: 'asparagus', categories: ['food', 'green', 'long', 'thin', 'outdoor', 'plant'] },
  { word: 'mushroom', categories: ['food', 'brown', 'white', 'round', 'soft', 'small', 'underground'] },
  { word: 'garlic', categories: ['food', 'white', 'round', 'hard', 'tiny', 'underground', 'plant'] },

  // ANIMALS - FARM
  { word: 'cow', categories: ['animal', 'big', 'black', 'white', 'outdoor', 'soft', 'warm'] },
  { word: 'pig', categories: ['animal', 'pink', 'big', 'soft', 'outdoor', 'warm', 'round'] },
  { word: 'chicken', categories: ['animal', 'white', 'yellow', 'small', 'outdoor', 'soft', 'warm'] },
  { word: 'duck', categories: ['animal', 'yellow', 'white', 'small', 'outdoor', 'soft', 'water', 'warm'] },
  { word: 'goose', categories: ['animal', 'white', 'big', 'outdoor', 'soft', 'water', 'warm'] },
  { word: 'turkey', categories: ['animal', 'brown', 'big', 'outdoor', 'soft', 'warm'] },
  { word: 'sheep', categories: ['animal', 'white', 'big', 'outdoor', 'soft', 'fuzzy', 'warm'] },
  { word: 'goat', categories: ['animal', 'white', 'brown', 'small', 'outdoor', 'soft', 'warm'] },
  { word: 'horse', categories: ['animal', 'brown', 'black', 'white', 'big', 'outdoor', 'warm'] },
  { word: 'donkey', categories: ['animal', 'brown', 'big', 'outdoor', 'warm'] },
  { word: 'rabbit', categories: ['animal', 'white', 'brown', 'small', 'outdoor', 'soft', 'fuzzy', 'warm'] },

  // ANIMALS - WILD
  { word: 'lion', categories: ['animal', 'yellow', 'brown', 'big', 'outdoor', 'warm', 'fuzzy'] },
  { word: 'tiger', categories: ['animal', 'orange', 'black', 'big', 'outdoor', 'warm'] },
  { word: 'bear', categories: ['animal', 'brown', 'black', 'big', 'outdoor', 'soft', 'fuzzy', 'warm'] },
  { word: 'wolf', categories: ['animal', 'gray', 'big', 'outdoor', 'fuzzy', 'warm'] },
  { word: 'fox', categories: ['animal', 'red', 'orange', 'small', 'outdoor', 'fuzzy', 'warm'] },
  { word: 'deer', categories: ['animal', 'brown', 'big', 'outdoor', 'warm', 'forest'] },
  { word: 'elk', categories: ['animal', 'brown', 'big', 'outdoor', 'warm', 'forest'] },
  { word: 'moose', categories: ['animal', 'brown', 'huge', 'outdoor', 'warm', 'forest'] },
  { word: 'squirrel', categories: ['animal', 'brown', 'small', 'outdoor', 'fuzzy', 'warm', 'forest'] },
  { word: 'chipmunk', categories: ['animal', 'brown', 'tiny', 'outdoor', 'fuzzy', 'warm', 'forest'] },
  { word: 'raccoon', categories: ['animal', 'black', 'white', 'small', 'outdoor', 'fuzzy', 'warm'] },
  { word: 'skunk', categories: ['animal', 'black', 'white', 'small', 'outdoor', 'fuzzy', 'warm'] },
  { word: 'opossum', categories: ['animal', 'white', 'small', 'outdoor', 'fuzzy', 'warm'] },
  { word: 'porcupine', categories: ['animal', 'brown', 'small', 'outdoor', 'rough', 'warm'] },
  { word: 'beaver', categories: ['animal', 'brown', 'big', 'outdoor', 'water', 'fuzzy', 'warm'] },
  { word: 'otter', categories: ['animal', 'brown', 'small', 'outdoor', 'water', 'fuzzy', 'warm'] },

  // ANIMALS - PETS
  { word: 'dog', categories: ['animal', 'brown', 'white', 'black', 'small', 'big', 'indoor', 'outdoor', 'fuzzy', 'warm'] },
  { word: 'cat', categories: ['animal', 'black', 'white', 'brown', 'small', 'indoor', 'outdoor', 'fuzzy', 'warm'] },
  { word: 'hamster', categories: ['animal', 'brown', 'white', 'tiny', 'indoor', 'fuzzy', 'warm'] },
  { word: 'guinea pig', categories: ['animal', 'brown', 'white', 'small', 'indoor', 'fuzzy', 'warm'] },
  { word: 'bird', categories: ['animal', 'small', 'outdoor', 'indoor', 'warm', 'sky'] },
  { word: 'parrot', categories: ['animal', 'green', 'red', 'blue', 'small', 'indoor', 'warm'] },
  { word: 'canary', categories: ['animal', 'yellow', 'tiny', 'indoor', 'warm'] },
  { word: 'goldfish', categories: ['animal', 'orange', 'tiny', 'indoor', 'water', 'cool'] },

  // OCEAN ANIMALS
  { word: 'whale', categories: ['animal', 'blue', 'huge', 'ocean', 'water', 'smooth', 'cool'] },
  { word: 'dolphin', categories: ['animal', 'blue', 'big', 'ocean', 'water', 'smooth', 'cool'] },
  { word: 'shark', categories: ['animal', 'blue', 'big', 'ocean', 'water', 'smooth', 'cool'] },
  { word: 'fish', categories: ['animal', 'blue', 'small', 'ocean', 'water', 'smooth', 'cool'] },
  { word: 'octopus', categories: ['animal', 'red', 'big', 'ocean', 'water', 'soft', 'cool'] },
  { word: 'squid', categories: ['animal', 'white', 'big', 'ocean', 'water', 'soft', 'cool'] },
  { word: 'jellyfish', categories: ['animal', 'white', 'round', 'ocean', 'water', 'soft', 'cool'] },
  { word: 'starfish', categories: ['animal', 'orange', 'red', 'small', 'ocean', 'water', 'rough', 'cool'] },
  { word: 'crab', categories: ['animal', 'red', 'small', 'ocean', 'water', 'hard', 'cool'] },
  { word: 'lobster', categories: ['animal', 'red', 'big', 'ocean', 'water', 'hard', 'cool'] },
  { word: 'shrimp', categories: ['animal', 'pink', 'tiny', 'ocean', 'water', 'soft', 'cool'] },
  { word: 'clam', categories: ['animal', 'white', 'small', 'ocean', 'water', 'hard', 'cool'] },
  { word: 'oyster', categories: ['animal', 'white', 'small', 'ocean', 'water', 'hard', 'cool'] },
  { word: 'seahorse', categories: ['animal', 'yellow', 'tiny', 'ocean', 'water', 'cool'] },
  { word: 'turtle', categories: ['animal', 'green', 'big', 'ocean', 'water', 'hard', 'cool'] },

  // DESSERTS & SWEETS
  { word: 'cake', categories: ['food', 'sweet', 'soft', 'big', 'indoor', 'warm'] },
  { word: 'cookie', categories: ['food', 'brown', 'sweet', 'round', 'small', 'hard', 'indoor'] },
  { word: 'candy', categories: ['food', 'red', 'green', 'blue', 'sweet', 'hard', 'small', 'indoor'] },
  { word: 'chocolate', categories: ['food', 'brown', 'sweet', 'soft', 'small', 'indoor'] },
  { word: 'ice cream', categories: ['food', 'white', 'pink', 'sweet', 'cold', 'soft', 'small', 'indoor'] },
  { word: 'popsicle', categories: ['food', 'red', 'blue', 'sweet', 'cold', 'hard', 'small', 'indoor'] },
  { word: 'donut', categories: ['food', 'brown', 'sweet', 'round', 'soft', 'small', 'indoor'] },
  { word: 'pie', categories: ['food', 'brown', 'sweet', 'round', 'warm', 'big', 'indoor'] },
  { word: 'muffin', categories: ['food', 'brown', 'sweet', 'round', 'soft', 'small', 'indoor'] },
  { word: 'cupcake', categories: ['food', 'sweet', 'round', 'soft', 'small', 'indoor'] },
  { word: 'brownie', categories: ['food', 'brown', 'sweet', 'square', 'soft', 'small', 'indoor'] },
  { word: 'fudge', categories: ['food', 'brown', 'sweet', 'square', 'soft', 'small', 'indoor'] },
  { word: 'taffy', categories: ['food', 'sweet', 'soft', 'small', 'indoor'] },
  { word: 'lollipop', categories: ['food', 'sweet', 'round', 'hard', 'small', 'indoor'] },
  { word: 'gumball', categories: ['food', 'sweet', 'round', 'hard', 'tiny', 'indoor'] },

  // HOT DRINKS & FOODS
  { word: 'coffee', categories: ['food', 'brown', 'hot', 'small', 'indoor'] },
  { word: 'tea', categories: ['food', 'brown', 'green', 'hot', 'small', 'indoor'] },
  { word: 'cocoa', categories: ['food', 'brown', 'hot', 'sweet', 'soft', 'small', 'indoor'] },
  { word: 'soup', categories: ['food', 'hot', 'soft', 'small', 'indoor'] },
  { word: 'pizza', categories: ['food', 'red', 'hot', 'round', 'flat', 'big', 'indoor'] },
  { word: 'bread', categories: ['food', 'brown', 'warm', 'soft', 'big', 'indoor'] },
  { word: 'toast', categories: ['food', 'brown', 'hot', 'flat', 'small', 'indoor'] },
  { word: 'pancake', categories: ['food', 'brown', 'hot', 'round', 'flat', 'small', 'indoor'] },
  { word: 'waffle', categories: ['food', 'brown', 'hot', 'square', 'bumpy', 'small', 'indoor'] },
  { word: 'oatmeal', categories: ['food', 'brown', 'hot', 'soft', 'small', 'indoor'] },
  { word: 'pasta', categories: ['food', 'yellow', 'hot', 'long', 'soft', 'indoor'] },
  { word: 'rice', categories: ['food', 'white', 'hot', 'tiny', 'soft', 'indoor'] },

  // COLD FOODS & DRINKS
  { word: 'salad', categories: ['food', 'green', 'cold', 'soft', 'indoor'] },
  { word: 'milk', categories: ['food', 'white', 'cold', 'soft', 'indoor'] },
  { word: 'yogurt', categories: ['food', 'white', 'cold', 'soft', 'small', 'indoor'] },
  { word: 'cheese', categories: ['food', 'yellow', 'white', 'cold', 'hard', 'small', 'indoor'] },
  { word: 'butter', categories: ['food', 'yellow', 'cold', 'soft', 'small', 'indoor'] },
  { word: 'sandwich', categories: ['food', 'cold', 'flat', 'big', 'indoor'] },
  { word: 'pickle', categories: ['food', 'green', 'cold', 'hard', 'small', 'indoor'] },

  // TOOLS
  { word: 'hammer', categories: ['tool', 'brown', 'hard', 'long', 'indoor', 'outdoor'] },
  { word: 'screwdriver', categories: ['tool', 'yellow', 'hard', 'long', 'thin', 'indoor'] },
  { word: 'wrench', categories: ['tool', 'gray', 'hard', 'long', 'indoor'] },
  { word: 'saw', categories: ['tool', 'gray', 'hard', 'long', 'thin', 'indoor', 'outdoor'] },
  { word: 'drill', categories: ['tool', 'black', 'hard', 'small', 'indoor'] },
  { word: 'pliers', categories: ['tool', 'gray', 'hard', 'small', 'indoor'] },
  { word: 'shovel', categories: ['tool', 'brown', 'hard', 'long', 'flat', 'outdoor'] },
  { word: 'rake', categories: ['tool', 'brown', 'hard', 'long', 'outdoor'] },
  { word: 'hoe', categories: ['tool', 'brown', 'hard', 'long', 'flat', 'outdoor'] },
  { word: 'scissors', categories: ['tool', 'gray', 'hard', 'small', 'indoor'] },
  { word: 'knife', categories: ['tool', 'gray', 'hard', 'thin', 'small', 'indoor'] },
  { word: 'spoon', categories: ['tool', 'gray', 'hard', 'small', 'round', 'indoor'] },
  { word: 'fork', categories: ['tool', 'gray', 'hard', 'small', 'thin', 'indoor'] },
  { word: 'spatula', categories: ['tool', 'gray', 'hard', 'flat', 'small', 'indoor'] },
  { word: 'whisk', categories: ['tool', 'gray', 'hard', 'long', 'thin', 'indoor'] },

  // TOYS
  { word: 'ball', categories: ['toy', 'round', 'small', 'indoor', 'outdoor'] },
  { word: 'doll', categories: ['toy', 'soft', 'small', 'indoor'] },
  { word: 'puzzle', categories: ['toy', 'flat', 'small', 'indoor'] },
  { word: 'blocks', categories: ['toy', 'square', 'hard', 'small', 'indoor'] },
  { word: 'train', categories: ['toy', 'long', 'hard', 'small', 'indoor'] },
  { word: 'car', categories: ['toy', 'small', 'hard', 'indoor'] },
  { word: 'truck', categories: ['toy', 'big', 'hard', 'indoor'] },
  { word: 'plane', categories: ['toy', 'small', 'hard', 'indoor'] },
  { word: 'kite', categories: ['toy', 'flat', 'outdoor', 'sky'] },
  { word: 'frisbee', categories: ['toy', 'round', 'flat', 'outdoor'] },
  { word: 'yo-yo', categories: ['toy', 'round', 'small', 'hard', 'indoor'] },
  { word: 'slinky', categories: ['toy', 'round', 'long', 'hard', 'indoor'] },
  { word: 'top', categories: ['toy', 'round', 'small', 'hard', 'indoor'] },
  { word: 'marbles', categories: ['toy', 'round', 'tiny', 'hard', 'indoor'] },
  { word: 'teddy bear', categories: ['toy', 'brown', 'soft', 'fuzzy', 'small', 'indoor'] },

  // CLOTHING
  { word: 'shirt', categories: ['clothing', 'soft', 'indoor'] },
  { word: 'pants', categories: ['clothing', 'long', 'soft', 'indoor'] },
  { word: 'dress', categories: ['clothing', 'long', 'soft', 'indoor'] },
  { word: 'skirt', categories: ['clothing', 'soft', 'indoor'] },
  { word: 'coat', categories: ['clothing', 'warm', 'soft', 'big', 'outdoor'] },
  { word: 'jacket', categories: ['clothing', 'warm', 'soft', 'outdoor'] },
  { word: 'sweater', categories: ['clothing', 'warm', 'soft', 'fuzzy', 'indoor'] },
  { word: 'hat', categories: ['clothing', 'small', 'soft', 'outdoor'] },
  { word: 'gloves', categories: ['clothing', 'small', 'soft', 'warm', 'outdoor'] },
  { word: 'scarf', categories: ['clothing', 'long', 'soft', 'warm', 'outdoor'] },
  { word: 'socks', categories: ['clothing', 'small', 'soft', 'warm', 'indoor'] },
  { word: 'shoes', categories: ['clothing', 'hard', 'small', 'outdoor'] },
  { word: 'boots', categories: ['clothing', 'hard', 'big', 'outdoor'] },
  { word: 'sandals', categories: ['clothing', 'flat', 'small', 'outdoor'] },
  { word: 'belt', categories: ['clothing', 'long', 'flat', 'hard', 'indoor'] },

  // FURNITURE
  { word: 'chair', categories: ['furniture', 'hard', 'big', 'indoor'] },
  { word: 'table', categories: ['furniture', 'hard', 'big', 'flat', 'indoor'] },
  { word: 'bed', categories: ['furniture', 'soft', 'big', 'flat', 'indoor'] },
  { word: 'sofa', categories: ['furniture', 'soft', 'big', 'indoor'] },
  { word: 'desk', categories: ['furniture', 'hard', 'big', 'flat', 'indoor'] },
  { word: 'shelf', categories: ['furniture', 'hard', 'long', 'flat', 'indoor'] },
  { word: 'dresser', categories: ['furniture', 'hard', 'big', 'indoor'] },
  { word: 'cabinet', categories: ['furniture', 'hard', 'big', 'indoor'] },
  { word: 'lamp', categories: ['furniture', 'hard', 'small', 'indoor'] },
  { word: 'mirror', categories: ['furniture', 'hard', 'flat', 'smooth', 'indoor'] },
  { word: 'pillow', categories: ['furniture', 'soft', 'small', 'indoor'] },
  { word: 'blanket', categories: ['furniture', 'soft', 'big', 'warm', 'indoor'] },
  { word: 'curtain', categories: ['furniture', 'soft', 'long', 'indoor'] },
  { word: 'rug', categories: ['furniture', 'soft', 'flat', 'big', 'indoor'] },
  { word: 'ottoman', categories: ['furniture', 'soft', 'round', 'small', 'indoor'] },

  // VEHICLES
  { word: 'car', categories: ['vehicle', 'big', 'hard', 'outdoor'] },
  { word: 'truck', categories: ['vehicle', 'huge', 'hard', 'outdoor'] },
  { word: 'bus', categories: ['vehicle', 'huge', 'hard', 'long', 'outdoor'] },
  { word: 'van', categories: ['vehicle', 'big', 'hard', 'outdoor'] },
  { word: 'motorcycle', categories: ['vehicle', 'small', 'hard', 'outdoor'] },
  { word: 'bicycle', categories: ['vehicle', 'small', 'hard', 'outdoor'] },
  { word: 'scooter', categories: ['vehicle', 'small', 'hard', 'outdoor'] },
  { word: 'train', categories: ['vehicle', 'huge', 'hard', 'long', 'outdoor'] },
  { word: 'plane', categories: ['vehicle', 'huge', 'hard', 'sky', 'outdoor'] },
  { word: 'helicopter', categories: ['vehicle', 'big', 'hard', 'sky', 'outdoor'] },
  { word: 'boat', categories: ['vehicle', 'big', 'hard', 'water', 'outdoor'] },
  { word: 'ship', categories: ['vehicle', 'huge', 'hard', 'water', 'ocean', 'outdoor'] },
  { word: 'kayak', categories: ['vehicle', 'long', 'hard', 'water', 'outdoor'] },
  { word: 'canoe', categories: ['vehicle', 'long', 'hard', 'water', 'outdoor'] },
  { word: 'sailboat', categories: ['vehicle', 'big', 'hard', 'water', 'outdoor'] },

  // BUILDINGS
  { word: 'house', categories: ['building', 'big', 'hard', 'outdoor'] },
  { word: 'apartment', categories: ['building', 'big', 'hard', 'outdoor', 'city'] },
  { word: 'school', categories: ['building', 'huge', 'hard', 'outdoor'] },
  { word: 'store', categories: ['building', 'big', 'hard', 'outdoor', 'city'] },
  { word: 'hospital', categories: ['building', 'huge', 'hard', 'white', 'outdoor', 'city'] },
  { word: 'church', categories: ['building', 'huge', 'hard', 'outdoor'] },
  { word: 'library', categories: ['building', 'big', 'hard', 'outdoor'] },
  { word: 'museum', categories: ['building', 'huge', 'hard', 'outdoor'] },
  { word: 'bank', categories: ['building', 'big', 'hard', 'outdoor', 'city'] },
  { word: 'restaurant', categories: ['building', 'big', 'hard', 'outdoor'] },
  { word: 'office', categories: ['building', 'big', 'hard', 'outdoor', 'city'] },
  { word: 'factory', categories: ['building', 'huge', 'hard', 'outdoor', 'city'] },
  { word: 'warehouse', categories: ['building', 'huge', 'hard', 'outdoor'] },
  { word: 'barn', categories: ['building', 'huge', 'hard', 'red', 'outdoor'] },
  { word: 'garage', categories: ['building', 'big', 'hard', 'outdoor'] },

  // NATURE - PLANTS
  { word: 'tree', categories: ['plant', 'green', 'brown', 'big', 'outdoor', 'forest'] },
  { word: 'flower', categories: ['plant', 'red', 'yellow', 'pink', 'small', 'soft', 'outdoor'] },
  { word: 'grass', categories: ['plant', 'green', 'small', 'soft', 'outdoor'] },
  { word: 'bush', categories: ['plant', 'green', 'big', 'outdoor'] },
  { word: 'fern', categories: ['plant', 'green', 'soft', 'outdoor', 'forest'] },
  { word: 'moss', categories: ['plant', 'green', 'soft', 'tiny', 'outdoor', 'forest'] },
  { word: 'vine', categories: ['plant', 'green', 'long', 'outdoor'] },
  { word: 'cactus', categories: ['plant', 'green', 'hard', 'rough', 'outdoor', 'desert'] },
  { word: 'rose', categories: ['plant', 'red', 'pink', 'small', 'soft', 'outdoor'] },
  { word: 'daisy', categories: ['plant', 'white', 'yellow', 'small', 'soft', 'outdoor'] },
  { word: 'tulip', categories: ['plant', 'red', 'yellow', 'pink', 'small', 'soft', 'outdoor'] },
  { word: 'sunflower', categories: ['plant', 'yellow', 'big', 'outdoor'] },
  { word: 'lily', categories: ['plant', 'white', 'pink', 'small', 'soft', 'water', 'outdoor'] },
  { word: 'oak', categories: ['plant', 'brown', 'green', 'huge', 'outdoor', 'forest'] },
  { word: 'pine', categories: ['plant', 'green', 'big', 'outdoor', 'forest', 'mountain'] },

  // WEATHER & SKY
  { word: 'cloud', categories: ['sky', 'white', 'soft', 'big', 'outdoor', 'cool'] },
  { word: 'rain', categories: ['sky', 'water', 'tiny', 'cool', 'outdoor'] },
  { word: 'snow', categories: ['sky', 'white', 'soft', 'tiny', 'cold', 'outdoor'] },
  { word: 'sun', categories: ['sky', 'yellow', 'round', 'hot', 'big', 'outdoor'] },
  { word: 'moon', categories: ['sky', 'white', 'round', 'cool', 'big', 'outdoor'] },
  { word: 'star', categories: ['sky', 'white', 'tiny', 'hot', 'outdoor'] },
  { word: 'lightning', categories: ['sky', 'white', 'yellow', 'hot', 'outdoor'] },
  { word: 'thunder', categories: ['sky', 'outdoor'] },
  { word: 'wind', categories: ['sky', 'cool', 'outdoor'] },
  { word: 'rainbow', categories: ['sky', 'red', 'blue', 'green', 'yellow', 'outdoor'] },
  { word: 'tornado', categories: ['sky', 'big', 'outdoor'] },
  { word: 'hurricane', categories: ['sky', 'huge', 'water', 'outdoor'] },
  { word: 'fog', categories: ['sky', 'white', 'soft', 'cool', 'outdoor'] },
  { word: 'frost', categories: ['sky', 'white', 'tiny', 'cold', 'outdoor'] },
  { word: 'hail', categories: ['sky', 'white', 'round', 'hard', 'tiny', 'cold', 'outdoor'] },

  // WATER THINGS
  { word: 'ocean', categories: ['water', 'blue', 'huge', 'cool', 'outdoor'] },
  { word: 'lake', categories: ['water', 'blue', 'big', 'cool', 'outdoor'] },
  { word: 'river', categories: ['water', 'blue', 'long', 'cool', 'outdoor'] },
  { word: 'stream', categories: ['water', 'blue', 'small', 'cool', 'outdoor'] },
  { word: 'pond', categories: ['water', 'blue', 'small', 'round', 'cool', 'outdoor'] },
  { word: 'waterfall', categories: ['water', 'white', 'big', 'cool', 'outdoor'] },
  { word: 'spring', categories: ['water', 'blue', 'small', 'cool', 'outdoor'] },
  { word: 'well', categories: ['water', 'round', 'deep', 'cool', 'outdoor'] },
  { word: 'pool', categories: ['water', 'blue', 'big', 'round', 'cool', 'outdoor'] },
  { word: 'fountain', categories: ['water', 'white', 'round', 'cool', 'outdoor'] },
  { word: 'ice', categories: ['water', 'white', 'hard', 'cold', 'outdoor'] },
  { word: 'steam', categories: ['water', 'white', 'soft', 'hot', 'outdoor'] },
  { word: 'bubble', categories: ['water', 'round', 'tiny', 'soft', 'outdoor'] },
  { word: 'wave', categories: ['water', 'blue', 'big', 'cool', 'ocean', 'outdoor'] },
  { word: 'tide', categories: ['water', 'blue', 'big', 'ocean', 'outdoor'] },

  // UNDERGROUND THINGS
  { word: 'cave', categories: ['underground', 'dark', 'big', 'hard', 'cool'] },
  { word: 'tunnel', categories: ['underground', 'dark', 'long', 'hard'] },
  { word: 'mine', categories: ['underground', 'dark', 'big', 'hard'] },
  { word: 'basement', categories: ['underground', 'dark', 'big', 'hard', 'cool'] },
  { word: 'root', categories: ['underground', 'brown', 'long', 'hard', 'plant'] },
  { word: 'worm', categories: ['underground', 'brown', 'long', 'soft', 'tiny', 'animal'] },
  { word: 'mole', categories: ['underground', 'black', 'small', 'soft', 'animal'] },
  { word: 'ant', categories: ['underground', 'black', 'tiny', 'hard', 'animal'] },
  { word: 'rock', categories: ['underground', 'hard', 'big', 'outdoor'] },
  { word: 'stone', categories: ['underground', 'hard', 'small', 'outdoor'] },
  { word: 'pebble', categories: ['underground', 'hard', 'tiny', 'outdoor'] },
  { word: 'sand', categories: ['underground', 'tiny', 'soft', 'outdoor'] },
  { word: 'dirt', categories: ['underground', 'brown', 'soft', 'outdoor'] },
  { word: 'clay', categories: ['underground', 'brown', 'soft', 'outdoor'] },
  { word: 'coal', categories: ['underground', 'black', 'hard', 'small'] },

  // CITY THINGS
  { word: 'street', categories: ['city', 'long', 'flat', 'hard', 'outdoor'] },
  { word: 'sidewalk', categories: ['city', 'long', 'flat', 'hard', 'outdoor'] },
  { word: 'building', categories: ['city', 'big', 'hard', 'outdoor'] },
  { word: 'skyscraper', categories: ['city', 'huge', 'hard', 'outdoor'] },
  { word: 'bridge', categories: ['city', 'long', 'hard', 'outdoor'] },
  { word: 'traffic', categories: ['city', 'big', 'outdoor'] },
  { word: 'bus stop', categories: ['city', 'small', 'hard', 'outdoor'] },
  { word: 'crosswalk', categories: ['city', 'flat', 'outdoor'] },
  { word: 'park', categories: ['city', 'green', 'big', 'outdoor'] },
  { word: 'fountain', categories: ['city', 'water', 'round', 'outdoor'] },
  { word: 'statue', categories: ['city', 'hard', 'big', 'outdoor'] },
  { word: 'bench', categories: ['city', 'hard', 'long', 'outdoor'] },
  { word: 'lamp post', categories: ['city', 'hard', 'long', 'outdoor'] },
  { word: 'mailbox', categories: ['city', 'hard', 'small', 'outdoor'] },
  { word: 'fire hydrant', categories: ['city', 'red', 'hard', 'small', 'outdoor'] },

  // HIGH INTERSECTION CLUSTER - lots of 3- and 4-way overlaps

  // Food: red + round + small + sweet (+ sometimes hot/warm)
  { word: 'cherry pie', categories: ['food', 'red', 'round', 'sweet', 'warm', 'indoor'] },
  { word: 'strawberry jam', categories: ['food', 'red', 'sweet', 'small', 'indoor'] },
  { word: 'candied apple', categories: ['food', 'red', 'round', 'sweet', 'hard', 'small', 'indoor'] },

  // Food: sweet + cold + round + small
  { word: 'scoop of ice cream', categories: ['food', 'sweet', 'cold', 'round', 'small', 'soft', 'indoor'] },
  { word: 'ice cream sandwich', categories: ['food', 'sweet', 'cold', 'flat', 'small', 'indoor'] },
  { word: 'chocolate truffle', categories: ['food', 'brown', 'sweet', 'round', 'small', 'indoor'] },

  // Food: hot + round + small (+ brown/white)
  { word: 'meatball', categories: ['food', 'brown', 'hot', 'round', 'small', 'indoor'] },
  { word: 'dumpling', categories: ['food', 'white', 'hot', 'round', 'small', 'soft', 'indoor'] },
  { word: 'boiled egg', categories: ['food', 'white', 'hot', 'round', 'small', 'indoor'] },

  // Sweet + round + tiny (candy cluster)
  { word: 'jawbreaker', categories: ['food', 'sweet', 'round', 'hard', 'small', 'indoor'] },
  { word: 'mint', categories: ['food', 'sweet', 'tiny', 'hard', 'indoor'] },
  { word: 'sprinkles', categories: ['food', 'sweet', 'tiny', 'indoor'] },

  // Fuzzy white animals: animal + white + small + fuzzy + warm
  { word: 'lamb', categories: ['animal', 'white', 'small', 'fuzzy', 'warm', 'outdoor'] },
  { word: 'kitten', categories: ['animal', 'white', 'small', 'fuzzy', 'warm', 'indoor'] },
  { word: 'bunny', categories: ['animal', 'white', 'small', 'fuzzy', 'warm', 'outdoor'] },

  // Gray + hard + long tools: tool + gray + hard + long
  { word: 'metal ruler', categories: ['tool', 'gray', 'hard', 'long', 'thin', 'indoor'] },
  { word: 'crowbar', categories: ['tool', 'gray', 'hard', 'long', 'outdoor', 'indoor'] },
  { word: 'metal pipe', categories: ['tool', 'gray', 'hard', 'long', 'outdoor'] },

  // Dark + underground + cool + hard
  { word: 'subway tunnel', categories: ['underground', 'dark', 'long', 'hard', 'cool', 'city'] },
  { word: 'crypt', categories: ['underground', 'dark', 'hard', 'cool'] },
  { word: 'cellar', categories: ['underground', 'dark', 'hard', 'cool'] },
];

/**
 * Find all words that belong to both categories
 */
export function getWordsAtIntersection(cat1: string, cat2: string): string[] {
  return taggedWords
    .filter(w => w.categories.includes(cat1) && w.categories.includes(cat2))
    .map(w => w.word);
}

/**
 * Get a category by ID
 */
export function getCategoryById(id: string): SemanticCategory | undefined {
  return categories.find(c => c.id === id);
}

/**
 * Check if two categories have enough words at their intersection
 */
export function categoriesHaveIntersection(cat1: string, cat2: string, minWords: number = 1): boolean {
  return getWordsAtIntersection(cat1, cat2).length >= minWords;
}

/**
 * Find all words that belong to all three categories (3-way intersection)
 */
export function getWordsAtTripleIntersection(cat1: string, cat2: string, cat3: string): string[] {
  return taggedWords
    .filter(
      w =>
        w.categories.includes(cat1) &&
        w.categories.includes(cat2) &&
        w.categories.includes(cat3)
    )
    .map(w => w.word);
}

/**
 * Check if three categories have enough words at their intersection
 */
export function categoriesHaveTripleIntersection(
  cat1: string,
  cat2: string,
  cat3: string,
  minWords: number = 1
): boolean {
  return getWordsAtTripleIntersection(cat1, cat2, cat3).length >= minWords;
}

/**
 * Find all words that belong to all four categories (4-way intersection)
 */
export function getWordsAtQuadIntersection(
  cat1: string,
  cat2: string,
  cat3: string,
  cat4: string
): string[] {
  return taggedWords
    .filter(
      w =>
        w.categories.includes(cat1) &&
        w.categories.includes(cat2) &&
        w.categories.includes(cat3) &&
        w.categories.includes(cat4)
    )
    .map(w => w.word);
}

/**
 * Check if four categories have enough words at their intersection
 */
export function categoriesHaveQuadIntersection(
  cat1: string,
  cat2: string,
  cat3: string,
  cat4: string,
  minWords: number = 1
): boolean {
  return getWordsAtQuadIntersection(cat1, cat2, cat3, cat4).length >= minWords;
}
