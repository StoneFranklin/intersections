/**
 * Word bank for Fenceposts puzzle generation
 * Each word is tagged with multiple categories it belongs to
 * This enables finding words at category intersections (e.g., "icicle" = Cold + Sharp)
 */

export interface TaggedWord {
  word: string;
  categories: string[];
}

export interface SemanticCategory {
  id: string;
  label: string;
}

// All available categories
export const categories: SemanticCategory[] = [
  { id: 'cold', label: 'Cold Things' },
  { id: 'hot', label: 'Hot Things' },
  { id: 'sharp', label: 'Sharp Things' },
  { id: 'soft', label: 'Soft Things' },
  { id: 'round', label: 'Round Things' },
  { id: 'red', label: 'Red Things' },
  { id: 'green', label: 'Green Things' },
  { id: 'blue', label: 'Blue Things' },
  { id: 'yellow', label: 'Yellow Things' },
  { id: 'water', label: 'Found in Water' },
  { id: 'sky', label: 'Found in Sky' },
  { id: 'metal', label: 'Made of Metal' },
  { id: 'wood', label: 'Made of Wood' },
  { id: 'sweet', label: 'Sweet Things' },
  { id: 'sour', label: 'Sour Things' },
  { id: 'loud', label: 'Loud Things' },
  { id: 'fast', label: 'Fast Things' },
  { id: 'slow', label: 'Slow Things' },
  { id: 'animal', label: 'Animals' },
  { id: 'food', label: 'Foods' },
  { id: 'tool', label: 'Tools' },
  { id: 'nature', label: 'Nature' },
  { id: 'kitchen', label: 'In a Kitchen' },
  { id: 'office', label: 'In an Office' },
  { id: 'sport', label: 'Sports' },
  { id: 'music', label: 'Music' },
  { id: 'clothing', label: 'Clothing' },
  { id: 'vehicle', label: 'Vehicles' },
  { id: 'small', label: 'Small Things' },
  { id: 'big', label: 'Big Things' },
];

// Words tagged with their categories
export const taggedWords: TaggedWord[] = [
  // Cold + Sharp
  { word: 'icicle', categories: ['cold', 'sharp', 'water', 'nature'] },
  { word: 'glacier', categories: ['cold', 'water', 'nature', 'big', 'slow'] },
  { word: 'iceberg', categories: ['cold', 'water', 'nature', 'big'] },
  { word: 'sleet', categories: ['cold', 'water', 'nature', 'sky'] },
  { word: 'frost', categories: ['cold', 'nature', 'water'] },
  { word: 'hail', categories: ['cold', 'round', 'nature', 'sky'] },
  
  // Cold + Soft
  { word: 'snow', categories: ['cold', 'soft', 'nature', 'water'] },
  { word: 'slush', categories: ['cold', 'soft', 'water'] },
  { word: 'igloo', categories: ['cold', 'round'] },
  
  // Cold + Animal
  { word: 'penguin', categories: ['cold', 'animal', 'water'] },
  { word: 'walrus', categories: ['cold', 'animal', 'water', 'big'] },
  { word: 'seal', categories: ['cold', 'animal', 'water'] },
  { word: 'polar', categories: ['cold', 'animal', 'big'] },
  { word: 'husky', categories: ['cold', 'animal', 'fast'] },
  
  // Cold + Food
  { word: 'sorbet', categories: ['cold', 'food', 'sweet'] },
  { word: 'gelato', categories: ['cold', 'food', 'sweet'] },
  { word: 'popsicle', categories: ['cold', 'food', 'sweet'] },
  { word: 'frozen', categories: ['cold', 'food'] },
  { word: 'sherbet', categories: ['cold', 'food', 'sweet'] },
  
  // Hot + Sharp
  { word: 'ember', categories: ['hot', 'red', 'nature'] },
  { word: 'spark', categories: ['hot', 'fast', 'small'] },
  { word: 'flame', categories: ['hot', 'red', 'nature'] },
  { word: 'flare', categories: ['hot', 'red', 'sky'] },
  
  // Hot + Food
  { word: 'pepper', categories: ['hot', 'food', 'red', 'green'] },
  { word: 'wasabi', categories: ['hot', 'food', 'green'] },
  { word: 'salsa', categories: ['hot', 'food', 'red'] },
  { word: 'curry', categories: ['hot', 'food', 'yellow'] },
  { word: 'chili', categories: ['hot', 'food', 'red'] },
  { word: 'ginger', categories: ['hot', 'food', 'nature'] },
  { word: 'mustard', categories: ['hot', 'food', 'yellow'] },
  { word: 'sriracha', categories: ['hot', 'food', 'red'] },
  
  // Hot + Nature
  { word: 'lava', categories: ['hot', 'nature', 'red'] },
  { word: 'magma', categories: ['hot', 'nature', 'red'] },
  { word: 'volcano', categories: ['hot', 'nature', 'big'] },
  { word: 'geyser', categories: ['hot', 'water', 'nature'] },
  { word: 'desert', categories: ['hot', 'nature', 'big'] },
  { word: 'sauna', categories: ['hot', 'water'] },
  
  // Sharp + Metal
  { word: 'knife', categories: ['sharp', 'metal', 'kitchen', 'tool'] },
  { word: 'blade', categories: ['sharp', 'metal', 'tool'] },
  { word: 'razor', categories: ['sharp', 'metal', 'tool', 'small'] },
  { word: 'needle', categories: ['sharp', 'metal', 'small', 'tool'] },
  { word: 'scalpel', categories: ['sharp', 'metal', 'tool', 'small'] },
  { word: 'sword', categories: ['sharp', 'metal', 'big'] },
  { word: 'dagger', categories: ['sharp', 'metal', 'small'] },
  { word: 'arrow', categories: ['sharp', 'wood', 'fast', 'sport'] },
  { word: 'spear', categories: ['sharp', 'wood', 'big', 'tool'] },
  { word: 'thorn', categories: ['sharp', 'nature', 'small'] },
  { word: 'cactus', categories: ['sharp', 'nature', 'green', 'hot'] },
  { word: 'fang', categories: ['sharp', 'animal', 'small'] },
  { word: 'claw', categories: ['sharp', 'animal'] },
  { word: 'talon', categories: ['sharp', 'animal'] },
  { word: 'quill', categories: ['sharp', 'animal', 'small'] },
  { word: 'fork', categories: ['sharp', 'metal', 'kitchen'] },
  { word: 'scissors', categories: ['sharp', 'metal', 'tool', 'office'] },
  { word: 'saw', categories: ['sharp', 'metal', 'tool', 'loud'] },
  
  // Soft + Clothing
  { word: 'velvet', categories: ['soft', 'clothing'] },
  { word: 'fleece', categories: ['soft', 'clothing', 'animal'] },
  { word: 'cotton', categories: ['soft', 'clothing', 'nature'] },
  { word: 'silk', categories: ['soft', 'clothing', 'animal'] },
  { word: 'cashmere', categories: ['soft', 'clothing', 'animal'] },
  { word: 'satin', categories: ['soft', 'clothing'] },
  { word: 'wool', categories: ['soft', 'clothing', 'animal'] },
  { word: 'linen', categories: ['soft', 'clothing', 'nature'] },
  { word: 'pillow', categories: ['soft', 'small'] },
  { word: 'blanket', categories: ['soft', 'big'] },
  { word: 'feather', categories: ['soft', 'animal', 'small', 'sky'] },
  { word: 'fur', categories: ['soft', 'animal'] },
  { word: 'plush', categories: ['soft', 'small'] },
  { word: 'teddy', categories: ['soft', 'small', 'animal'] },
  { word: 'cushion', categories: ['soft', 'small'] },
  { word: 'suede', categories: ['soft', 'clothing', 'animal'] },
  
  // Round things
  { word: 'ball', categories: ['round', 'sport'] },
  { word: 'globe', categories: ['round', 'big'] },
  { word: 'wheel', categories: ['round', 'vehicle', 'metal'] },
  { word: 'coin', categories: ['round', 'metal', 'small'] },
  { word: 'button', categories: ['round', 'small', 'clothing'] },
  { word: 'pearl', categories: ['round', 'water', 'small'] },
  { word: 'marble', categories: ['round', 'small'] },
  { word: 'donut', categories: ['round', 'food', 'sweet'] },
  { word: 'bagel', categories: ['round', 'food'] },
  { word: 'pizza', categories: ['round', 'food', 'hot'] },
  { word: 'orange', categories: ['round', 'food', 'sweet', 'sour'] },
  { word: 'apple', categories: ['round', 'food', 'sweet', 'red', 'green'] },
  { word: 'melon', categories: ['round', 'food', 'sweet', 'green', 'big'] },
  { word: 'grape', categories: ['round', 'food', 'sweet', 'small', 'green'] },
  { word: 'cherry', categories: ['round', 'food', 'sweet', 'red', 'small'] },
  { word: 'plum', categories: ['round', 'food', 'sweet'] },
  { word: 'peach', categories: ['round', 'food', 'sweet', 'soft'] },
  { word: 'moon', categories: ['round', 'sky', 'big', 'nature'] },
  { word: 'sun', categories: ['round', 'hot', 'sky', 'big', 'yellow'] },
  { word: 'planet', categories: ['round', 'sky', 'big'] },
  { word: 'bubble', categories: ['round', 'water', 'small'] },
  { word: 'balloon', categories: ['round', 'sky', 'soft'] },
  { word: 'tire', categories: ['round', 'vehicle', 'big'] },
  { word: 'ring', categories: ['round', 'metal', 'small'] },
  { word: 'hoop', categories: ['round', 'sport'] },
  { word: 'clock', categories: ['round', 'office', 'small'] },
  { word: 'drum', categories: ['round', 'music', 'loud'] },
  { word: 'gong', categories: ['round', 'music', 'metal', 'loud'] },
  
  // Red things
  { word: 'tomato', categories: ['red', 'food', 'round', 'nature'] },
  { word: 'rose', categories: ['red', 'nature', 'soft'] },
  { word: 'blood', categories: ['red', 'animal'] },
  { word: 'ruby', categories: ['red', 'small'] },
  { word: 'lobster', categories: ['red', 'animal', 'water', 'food'] },
  { word: 'cardinal', categories: ['red', 'animal', 'sky', 'small'] },
  { word: 'brick', categories: ['red', 'small'] },
  { word: 'sunset', categories: ['red', 'sky', 'nature', 'big'] },
  { word: 'lipstick', categories: ['red', 'small'] },
  { word: 'ladybug', categories: ['red', 'animal', 'small', 'sky'] },
  { word: 'firetruck', categories: ['red', 'vehicle', 'big', 'loud'] },
  { word: 'strawberry', categories: ['red', 'food', 'sweet', 'small'] },
  { word: 'radish', categories: ['red', 'food', 'small'] },
  { word: 'beet', categories: ['red', 'food'] },
  { word: 'ketchup', categories: ['red', 'food', 'sweet'] },
  
  // Green things
  { word: 'grass', categories: ['green', 'nature', 'soft'] },
  { word: 'leaf', categories: ['green', 'nature', 'small'] },
  { word: 'frog', categories: ['green', 'animal', 'water', 'small'] },
  { word: 'lime', categories: ['green', 'food', 'sour', 'round'] },
  { word: 'pickle', categories: ['green', 'food', 'sour'] },
  { word: 'peas', categories: ['green', 'food', 'round', 'small'] },
  { word: 'broccoli', categories: ['green', 'food', 'nature'] },
  { word: 'spinach', categories: ['green', 'food', 'nature', 'soft'] },
  { word: 'kale', categories: ['green', 'food', 'nature'] },
  { word: 'avocado', categories: ['green', 'food', 'soft'] },
  { word: 'celery', categories: ['green', 'food', 'nature'] },
  { word: 'moss', categories: ['green', 'nature', 'soft'] },
  { word: 'emerald', categories: ['green', 'small'] },
  { word: 'turtle', categories: ['green', 'animal', 'water', 'slow'] },
  { word: 'lizard', categories: ['green', 'animal', 'small'] },
  { word: 'parrot', categories: ['green', 'animal', 'sky', 'loud'] },
  { word: 'alligator', categories: ['green', 'animal', 'water', 'big'] },
  { word: 'kiwi', categories: ['green', 'food', 'sweet', 'soft', 'small'] },
  
  // Blue things
  { word: 'ocean', categories: ['blue', 'water', 'nature', 'big'] },
  { word: 'sky', categories: ['blue', 'nature', 'big'] },
  { word: 'whale', categories: ['blue', 'animal', 'water', 'big'] },
  { word: 'blueberry', categories: ['blue', 'food', 'sweet', 'small', 'round'] },
  { word: 'sapphire', categories: ['blue', 'small'] },
  { word: 'jeans', categories: ['blue', 'clothing'] },
  { word: 'jay', categories: ['blue', 'animal', 'sky', 'small', 'loud'] },
  { word: 'wave', categories: ['blue', 'water', 'nature'] },
  { word: 'lake', categories: ['blue', 'water', 'nature', 'big'] },
  { word: 'pool', categories: ['blue', 'water', 'cold'] },
  { word: 'iceberg', categories: ['blue', 'cold', 'water', 'big'] },
  
  // Yellow things
  { word: 'banana', categories: ['yellow', 'food', 'sweet', 'soft'] },
  { word: 'lemon', categories: ['yellow', 'food', 'sour', 'round'] },
  { word: 'corn', categories: ['yellow', 'food', 'sweet'] },
  { word: 'cheese', categories: ['yellow', 'food', 'soft'] },
  { word: 'honey', categories: ['yellow', 'food', 'sweet', 'soft'] },
  { word: 'butter', categories: ['yellow', 'food', 'soft', 'kitchen'] },
  { word: 'taxi', categories: ['yellow', 'vehicle', 'fast'] },
  { word: 'canary', categories: ['yellow', 'animal', 'sky', 'small', 'music'] },
  { word: 'daisy', categories: ['yellow', 'nature', 'small', 'soft'] },
  { word: 'gold', categories: ['yellow', 'metal', 'small'] },
  { word: 'lightning', categories: ['yellow', 'sky', 'fast', 'loud', 'nature'] },
  { word: 'pineapple', categories: ['yellow', 'food', 'sweet', 'sour', 'sharp'] },
  { word: 'sunflower', categories: ['yellow', 'nature', 'big'] },
  { word: 'duckling', categories: ['yellow', 'animal', 'water', 'small', 'soft'] },
  { word: 'bee', categories: ['yellow', 'animal', 'small', 'sky', 'loud'] },
  
  // Water things
  { word: 'fish', categories: ['water', 'animal', 'food'] },
  { word: 'shark', categories: ['water', 'animal', 'big', 'fast', 'sharp'] },
  { word: 'dolphin', categories: ['water', 'animal', 'fast', 'big'] },
  { word: 'jellyfish', categories: ['water', 'animal', 'soft'] },
  { word: 'crab', categories: ['water', 'animal', 'food', 'red'] },
  { word: 'shrimp', categories: ['water', 'animal', 'food', 'small'] },
  { word: 'oyster', categories: ['water', 'animal', 'food'] },
  { word: 'clam', categories: ['water', 'animal', 'food'] },
  { word: 'squid', categories: ['water', 'animal', 'food', 'soft'] },
  { word: 'octopus', categories: ['water', 'animal', 'soft', 'big'] },
  { word: 'eel', categories: ['water', 'animal'] },
  { word: 'anchor', categories: ['water', 'metal', 'big'] },
  { word: 'boat', categories: ['water', 'vehicle', 'big', 'wood'] },
  { word: 'ship', categories: ['water', 'vehicle', 'big', 'metal'] },
  { word: 'kayak', categories: ['water', 'vehicle', 'sport', 'small'] },
  { word: 'canoe', categories: ['water', 'vehicle', 'wood', 'sport'] },
  { word: 'raft', categories: ['water', 'vehicle', 'slow'] },
  { word: 'submarine', categories: ['water', 'vehicle', 'metal', 'big', 'slow'] },
  { word: 'coral', categories: ['water', 'nature', 'red'] },
  { word: 'seaweed', categories: ['water', 'nature', 'green', 'food'] },
  { word: 'diver', categories: ['water', 'sport'] },
  { word: 'swimmer', categories: ['water', 'sport', 'fast'] },
  { word: 'surfer', categories: ['water', 'sport', 'fast'] },
  
  // Sky things
  { word: 'cloud', categories: ['sky', 'soft', 'nature', 'big'] },
  { word: 'bird', categories: ['sky', 'animal', 'fast'] },
  { word: 'eagle', categories: ['sky', 'animal', 'big', 'fast'] },
  { word: 'hawk', categories: ['sky', 'animal', 'fast'] },
  { word: 'owl', categories: ['sky', 'animal'] },
  { word: 'sparrow', categories: ['sky', 'animal', 'small'] },
  { word: 'crow', categories: ['sky', 'animal', 'loud'] },
  { word: 'raven', categories: ['sky', 'animal', 'loud'] },
  { word: 'airplane', categories: ['sky', 'vehicle', 'metal', 'fast', 'loud', 'big'] },
  { word: 'jet', categories: ['sky', 'vehicle', 'metal', 'fast', 'loud'] },
  { word: 'helicopter', categories: ['sky', 'vehicle', 'metal', 'loud'] },
  { word: 'rocket', categories: ['sky', 'vehicle', 'metal', 'fast', 'loud', 'hot'] },
  { word: 'kite', categories: ['sky', 'small'] },
  { word: 'drone', categories: ['sky', 'small', 'metal', 'fast'] },
  { word: 'rainbow', categories: ['sky', 'nature', 'big'] },
  { word: 'comet', categories: ['sky', 'fast', 'nature', 'big'] },
  { word: 'star', categories: ['sky', 'nature', 'hot', 'big'] },
  { word: 'meteor', categories: ['sky', 'fast', 'hot', 'nature'] },
  { word: 'butterfly', categories: ['sky', 'animal', 'small', 'soft'] },
  { word: 'dragonfly', categories: ['sky', 'animal', 'small', 'fast'] },
  { word: 'firefly', categories: ['sky', 'animal', 'small', 'yellow'] },
  
  // Metal things
  { word: 'hammer', categories: ['metal', 'tool', 'loud'] },
  { word: 'wrench', categories: ['metal', 'tool'] },
  { word: 'bolt', categories: ['metal', 'small', 'tool'] },
  { word: 'screw', categories: ['metal', 'small', 'tool', 'sharp'] },
  { word: 'nail', categories: ['metal', 'small', 'tool', 'sharp'] },
  { word: 'chain', categories: ['metal'] },
  { word: 'fence', categories: ['metal', 'big'] },
  { word: 'car', categories: ['metal', 'vehicle', 'fast'] },
  { word: 'train', categories: ['metal', 'vehicle', 'fast', 'loud', 'big'] },
  { word: 'bike', categories: ['metal', 'vehicle', 'fast', 'sport'] },
  { word: 'pan', categories: ['metal', 'kitchen'] },
  { word: 'pot', categories: ['metal', 'kitchen'] },
  { word: 'spoon', categories: ['metal', 'kitchen', 'round'] },
  { word: 'can', categories: ['metal', 'kitchen', 'round'] },
  { word: 'key', categories: ['metal', 'small'] },
  { word: 'lock', categories: ['metal', 'small'] },
  { word: 'bell', categories: ['metal', 'music', 'loud', 'round'] },
  { word: 'trumpet', categories: ['metal', 'music', 'loud'] },
  { word: 'cymbal', categories: ['metal', 'music', 'loud', 'round'] },
  { word: 'guitar', categories: ['metal', 'music', 'wood'] },
  
  // Wood things
  { word: 'tree', categories: ['wood', 'nature', 'big', 'green'] },
  { word: 'log', categories: ['wood', 'nature', 'big'] },
  { word: 'branch', categories: ['wood', 'nature'] },
  { word: 'stick', categories: ['wood', 'nature', 'small'] },
  { word: 'bat', categories: ['wood', 'sport'] },
  { word: 'desk', categories: ['wood', 'office', 'big'] },
  { word: 'chair', categories: ['wood', 'office'] },
  { word: 'table', categories: ['wood', 'kitchen', 'big'] },
  { word: 'door', categories: ['wood', 'big'] },
  { word: 'floor', categories: ['wood', 'big'] },
  { word: 'barrel', categories: ['wood', 'round', 'big'] },
  { word: 'crate', categories: ['wood', 'big'] },
  { word: 'cabinet', categories: ['wood', 'kitchen', 'big'] },
  { word: 'violin', categories: ['wood', 'music'] },
  { word: 'cello', categories: ['wood', 'music', 'big'] },
  { word: 'flute', categories: ['wood', 'music'] },
  { word: 'pencil', categories: ['wood', 'office', 'small', 'sharp'] },
  { word: 'ruler', categories: ['wood', 'office', 'small'] },
  { word: 'bookshelf', categories: ['wood', 'office', 'big'] },
  
  // Sweet things
  { word: 'candy', categories: ['sweet', 'food', 'small'] },
  { word: 'cake', categories: ['sweet', 'food', 'soft'] },
  { word: 'cookie', categories: ['sweet', 'food', 'round', 'small'] },
  { word: 'pie', categories: ['sweet', 'food', 'round'] },
  { word: 'cupcake', categories: ['sweet', 'food', 'small', 'soft'] },
  { word: 'brownie', categories: ['sweet', 'food', 'soft'] },
  { word: 'muffin', categories: ['sweet', 'food', 'soft', 'round'] },
  { word: 'waffle', categories: ['sweet', 'food', 'soft'] },
  { word: 'pancake', categories: ['sweet', 'food', 'soft', 'round'] },
  { word: 'syrup', categories: ['sweet', 'food', 'soft'] },
  { word: 'caramel', categories: ['sweet', 'food', 'soft', 'yellow'] },
  { word: 'fudge', categories: ['sweet', 'food', 'soft'] },
  { word: 'pudding', categories: ['sweet', 'food', 'soft'] },
  { word: 'nectar', categories: ['sweet', 'food', 'nature'] },
  
  // Sour things
  { word: 'vinegar', categories: ['sour', 'food', 'kitchen'] },
  { word: 'grapefruit', categories: ['sour', 'food', 'round', 'yellow'] },
  { word: 'cranberry', categories: ['sour', 'food', 'red', 'small'] },
  { word: 'tamarind', categories: ['sour', 'food'] },
  { word: 'yogurt', categories: ['sour', 'food', 'soft'] },
  { word: 'sourdough', categories: ['sour', 'food', 'soft'] },
  { word: 'rhubarb', categories: ['sour', 'food', 'red', 'nature'] },
  
  // Loud things
  { word: 'thunder', categories: ['loud', 'nature', 'sky'] },
  { word: 'siren', categories: ['loud', 'metal'] },
  { word: 'alarm', categories: ['loud', 'office', 'metal'] },
  { word: 'horn', categories: ['loud', 'vehicle', 'metal'] },
  { word: 'whistle', categories: ['loud', 'metal', 'small'] },
  { word: 'roar', categories: ['loud', 'animal'] },
  { word: 'crash', categories: ['loud', 'metal'] },
  { word: 'bang', categories: ['loud'] },
  { word: 'boom', categories: ['loud', 'big'] },
  { word: 'clap', categories: ['loud'] },
  
  // Fast things
  { word: 'cheetah', categories: ['fast', 'animal', 'yellow'] },
  { word: 'falcon', categories: ['fast', 'animal', 'sky'] },
  { word: 'bullet', categories: ['fast', 'metal', 'small', 'sharp'] },
  { word: 'laser', categories: ['fast', 'hot', 'red'] },
  { word: 'racecar', categories: ['fast', 'vehicle', 'metal', 'loud'] },
  { word: 'speedboat', categories: ['fast', 'vehicle', 'water', 'loud'] },
  { word: 'sprint', categories: ['fast', 'sport'] },
  { word: 'flash', categories: ['fast', 'sky'] },
  { word: 'gazelle', categories: ['fast', 'animal'] },
  { word: 'hare', categories: ['fast', 'animal', 'small'] },
  { word: 'roadrunner', categories: ['fast', 'animal', 'small'] },
  
  // Slow things
  { word: 'snail', categories: ['slow', 'animal', 'small', 'soft'] },
  { word: 'sloth', categories: ['slow', 'animal', 'soft'] },
  { word: 'tortoise', categories: ['slow', 'animal', 'green'] },
  { word: 'slug', categories: ['slow', 'animal', 'small', 'soft'] },
  { word: 'caterpillar', categories: ['slow', 'animal', 'small', 'soft', 'green'] },
  { word: 'worm', categories: ['slow', 'animal', 'small', 'soft'] },
  { word: 'manatee', categories: ['slow', 'animal', 'water', 'big'] },
  { word: 'barge', categories: ['slow', 'vehicle', 'water', 'big'] },
  
  // Office things
  { word: 'stapler', categories: ['office', 'metal', 'small'] },
  { word: 'printer', categories: ['office', 'loud', 'big'] },
  { word: 'computer', categories: ['office', 'metal', 'big'] },
  { word: 'keyboard', categories: ['office', 'loud'] },
  { word: 'monitor', categories: ['office', 'big'] },
  { word: 'paper', categories: ['office', 'small', 'soft'] },
  { word: 'folder', categories: ['office', 'small'] },
  { word: 'binder', categories: ['office'] },
  { word: 'eraser', categories: ['office', 'small', 'soft'] },
  { word: 'marker', categories: ['office', 'small'] },
  
  // Kitchen things
  { word: 'oven', categories: ['kitchen', 'hot', 'metal', 'big'] },
  { word: 'stove', categories: ['kitchen', 'hot', 'metal'] },
  { word: 'toaster', categories: ['kitchen', 'hot', 'metal', 'small'] },
  { word: 'blender', categories: ['kitchen', 'loud', 'metal'] },
  { word: 'mixer', categories: ['kitchen', 'loud', 'metal'] },
  { word: 'fridge', categories: ['kitchen', 'cold', 'metal', 'big'] },
  { word: 'freezer', categories: ['kitchen', 'cold', 'metal', 'big'] },
  { word: 'sink', categories: ['kitchen', 'water', 'metal'] },
  { word: 'kettle', categories: ['kitchen', 'hot', 'metal'] },
  { word: 'microwave', categories: ['kitchen', 'hot', 'metal'] },
  { word: 'plate', categories: ['kitchen', 'round'] },
  { word: 'bowl', categories: ['kitchen', 'round'] },
  { word: 'cup', categories: ['kitchen', 'round', 'small'] },
  { word: 'mug', categories: ['kitchen', 'round', 'hot'] },
  
  // Animals (general)
  { word: 'lion', categories: ['animal', 'big', 'yellow', 'loud'] },
  { word: 'tiger', categories: ['animal', 'big', 'fast'] },
  { word: 'elephant', categories: ['animal', 'big', 'slow'] },
  { word: 'giraffe', categories: ['animal', 'big', 'yellow'] },
  { word: 'zebra', categories: ['animal', 'fast'] },
  { word: 'monkey', categories: ['animal', 'small', 'fast', 'loud'] },
  { word: 'gorilla', categories: ['animal', 'big'] },
  { word: 'panda', categories: ['animal', 'big', 'soft'] },
  { word: 'koala', categories: ['animal', 'small', 'soft'] },
  { word: 'kangaroo', categories: ['animal', 'big', 'fast'] },
  { word: 'rabbit', categories: ['animal', 'small', 'fast', 'soft'] },
  { word: 'hamster', categories: ['animal', 'small', 'soft'] },
  { word: 'mouse', categories: ['animal', 'small', 'fast'] },
  { word: 'rat', categories: ['animal', 'small'] },
  { word: 'cat', categories: ['animal', 'small', 'soft'] },
  { word: 'dog', categories: ['animal', 'soft', 'loud'] },
  { word: 'horse', categories: ['animal', 'big', 'fast'] },
  { word: 'cow', categories: ['animal', 'big', 'slow'] },
  { word: 'pig', categories: ['animal', 'soft'] },
  { word: 'sheep', categories: ['animal', 'soft'] },
  { word: 'goat', categories: ['animal'] },
  { word: 'deer', categories: ['animal', 'fast'] },
  { word: 'bear', categories: ['animal', 'big'] },
  { word: 'wolf', categories: ['animal', 'fast', 'loud'] },
  { word: 'fox', categories: ['animal', 'fast', 'red'] },
  { word: 'snake', categories: ['animal', 'slow'] },
  { word: 'spider', categories: ['animal', 'small'] },
  { word: 'ant', categories: ['animal', 'small'] },
  
  // Sports
  { word: 'soccer', categories: ['sport', 'round'] },
  { word: 'football', categories: ['sport', 'big'] },
  { word: 'basketball', categories: ['sport', 'round', 'big'] },
  { word: 'baseball', categories: ['sport', 'round', 'small'] },
  { word: 'tennis', categories: ['sport', 'fast'] },
  { word: 'golf', categories: ['sport', 'small'] },
  { word: 'hockey', categories: ['sport', 'cold', 'fast'] },
  { word: 'skiing', categories: ['sport', 'cold', 'fast'] },
  { word: 'skating', categories: ['sport', 'cold', 'fast'] },
  { word: 'boxing', categories: ['sport', 'loud'] },
  { word: 'wrestling', categories: ['sport', 'loud'] },
  { word: 'running', categories: ['sport', 'fast'] },
  { word: 'jumping', categories: ['sport'] },
  { word: 'climbing', categories: ['sport', 'slow'] },
  { word: 'yoga', categories: ['sport', 'slow', 'soft'] },
  { word: 'archery', categories: ['sport', 'sharp'] },
  { word: 'fencing', categories: ['sport', 'sharp', 'fast'] },
  
  // Vehicles
  { word: 'truck', categories: ['vehicle', 'big', 'loud'] },
  { word: 'bus', categories: ['vehicle', 'big', 'slow'] },
  { word: 'motorcycle', categories: ['vehicle', 'fast', 'loud'] },
  { word: 'scooter', categories: ['vehicle', 'small'] },
  { word: 'skateboard', categories: ['vehicle', 'small', 'wood'] },
  { word: 'wagon', categories: ['vehicle', 'wood', 'slow'] },
  { word: 'sled', categories: ['vehicle', 'cold', 'fast', 'wood'] },
  { word: 'ambulance', categories: ['vehicle', 'loud', 'fast'] },
  { word: 'tractor', categories: ['vehicle', 'slow', 'big', 'loud'] },
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
