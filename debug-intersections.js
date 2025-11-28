import {
    categories,
    getWordsAtIntersection,
    getWordsAtQuadIntersection,
    getWordsAtTripleIntersection,
} from './data/semantic-words';

console.log('=== TESTING CATEGORY INTERSECTIONS ===');

// Test some common category combinations
console.log('\n--- 2-Way Intersections (Easy Mode) ---');
console.log('red + food:', getWordsAtIntersection('red', 'food'));
console.log('small + animal:', getWordsAtIntersection('small', 'animal'));
console.log('soft + toy:', getWordsAtIntersection('soft', 'toy'));
console.log('outdoor + plant:', getWordsAtIntersection('outdoor', 'plant'));

console.log('\n--- 3-Way Intersections (Medium Mode) ---');
console.log('red + food + small:', getWordsAtTripleIntersection('red', 'food', 'small'));
console.log('animal + small + soft:', getWordsAtTripleIntersection('animal', 'small', 'soft'));
console.log('outdoor + plant + green:', getWordsAtTripleIntersection('outdoor', 'plant', 'green'));
console.log('water + animal + small:', getWordsAtTripleIntersection('water', 'animal', 'small'));

console.log('\n--- 4-Way Intersections (Hard Mode) ---');
console.log('red + food + small + soft:', getWordsAtQuadIntersection('red', 'food', 'small', 'soft'));
console.log('animal + small + soft + outdoor:', getWordsAtQuadIntersection('animal', 'small', 'soft', 'outdoor'));
console.log('outdoor + plant + green + big:', getWordsAtQuadIntersection('outdoor', 'plant', 'green', 'big'));
console.log('water + animal + small + cool:', getWordsAtQuadIntersection('water', 'animal', 'small', 'cool'));

console.log('\n--- Category Count ---');
console.log('Total categories:', categories.length);

// Test the new expanded categories
console.log('\n--- New Categories Test ---');
const newCats = ['fuzzy', 'bumpy', 'rough', 'smooth', 'warm', 'cool'];
for (const cat of newCats) {
  const found = categories.find(c => c.id === cat);
  console.log(`${cat}:`, found ? 'EXISTS' : 'MISSING');
}