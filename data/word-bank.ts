/**
 * Word bank organized by category for puzzle generation
 * Each category has words of various lengths (4-7 letters)
 */

export interface WordEntry {
  word: string;
  length: number;
}

export interface CategoryWordBank {
  id: string;
  label: string;
  words: WordEntry[];
}

// Helper to create word entries
const w = (word: string): WordEntry => ({ word, length: word.length });

export const wordBank: CategoryWordBank[] = [
  {
    id: 'animals',
    label: 'Animals',
    words: [
      // 4 letters
      w('bear'), w('bird'), w('crab'), w('deer'), w('duck'), w('fish'), w('frog'), w('goat'),
      w('hawk'), w('lion'), w('moth'), w('seal'), w('toad'), w('wolf'), w('worm'),
      // 5 letters
      w('bison'), w('camel'), w('cobra'), w('eagle'), w('goose'), w('horse'), w('hyena'),
      w('koala'), w('lemur'), w('llama'), w('moose'), w('mouse'), w('otter'), w('panda'),
      w('shark'), w('sheep'), w('skunk'), w('sloth'), w('snail'), w('snake'), w('squid'),
      w('stork'), w('tiger'), w('whale'), w('zebra'),
      // 6 letters
      w('badger'), w('beaver'), w('cougar'), w('coyote'), w('donkey'), w('falcon'), w('ferret'),
      w('gerbil'), w('gopher'), w('iguana'), w('jackal'), w('jaguar'), w('lizard'), w('monkey'),
      w('ocelot'), w('osprey'), w('parrot'), w('pellet'), w('pigeon'), w('rabbit'), w('racoon'),
      w('salmon'), w('turtle'), w('walrus'), w('weasel'),
      // 7 letters
      w('buffalo'), w('cheetah'), w('chicken'), w('dolphin'), w('echidna'), w('gazelle'),
      w('giraffe'), w('gorilla'), w('hamster'), w('leopard'), w('lobster'), w('meerkat'),
      w('octopus'), w('panther'), w('peacock'), w('pelican'), w('penguin'), w('raccoon'),
      w('rooster'), w('seagull'), w('sparrow'), w('termite'), w('vulture'),
    ],
  },
  {
    id: 'clothing',
    label: 'Clothing',
    words: [
      // 4 letters
      w('belt'), w('boot'), w('cape'), w('coat'), w('gown'), w('hood'), w('jean'), w('mitt'),
      w('robe'), w('shoe'), w('sock'), w('suit'), w('vest'), w('wrap'),
      // 5 letters
      w('apron'), w('beret'), w('cloak'), w('dress'), w('glove'), w('jeans'), w('pants'),
      w('scarf'), w('shawl'), w('shirt'), w('short'), w('skirt'), w('slack'), w('tunic'),
      // 6 letters
      w('beanie'), w('bikini'), w('blouse'), w('bootie'), w('boxer'), w('briefs'), w('caftan'),
      w('corset'), w('fedora'), w('helmet'), w('hoodie'), w('jacket'), w('jersey'), w('kimono'),
      w('mitten'), w('outfit'), w('parka'), w('poncho'), w('sandal'), w('shorts'), w('slacks'),
      w('sleeve'), w('tights'), w('tuxedo'),
      // 7 letters
      w('bandana'), w('blanket'), w('blouses'), w('cardigan'), w('costume'), w('earmuff'),
      w('garment'), w('jumpers'), w('leather'), w('leotard'), w('muffler'), w('necktie'),
      w('overall'), w('pajamas'), w('raincoat'), w('sandals'), w('singlet'), w('slipper'),
      w('sneaker'), w('sweater'), w('thermal'), w('uniform'), w('wetsuit'),
    ],
  },
  {
    id: 'food',
    label: 'Foods',
    words: [
      // 4 letters
      w('apple'), w('bean'), w('beef'), w('beet'), w('cake'), w('chip'), w('clam'), w('corn'),
      w('crab'), w('dip'), w('duck'), w('egg'), w('figs'), w('fish'), w('ham'), w('kale'),
      w('lamb'), w('leek'), w('lime'), w('meat'), w('milk'), w('mint'), w('oats'), w('pear'),
      w('plum'), w('pork'), w('rice'), w('roll'), w('salt'), w('soup'), w('taco'), w('tofu'),
      // 5 letters
      w('apple'), w('bacon'), w('bagel'), w('berry'), w('bread'), w('candy'), w('cheese'),
      w('chips'), w('cocoa'), w('cream'), w('curry'), w('donut'), w('fruit'), w('grape'),
      w('gravy'), w('honey'), w('jelly'), w('juice'), w('lemon'), w('mango'), w('melon'),
      w('olive'), w('onion'), w('pasta'), w('peach'), w('pizza'), w('salad'), w('sauce'),
      w('steak'), w('sugar'), w('sushi'), w('toast'), w('wafer'), w('wheat'),
      // 6 letters
      w('almond'), w('banana'), w('biscut'), w('butter'), w('carrot'), w('cashew'), w('celery'),
      w('cereal'), w('cheese'), w('cherry'), w('cookie'), w('ginger'), w('hummus'), w('muffin'),
      w('noodle'), w('orange'), w('papaya'), w('peanut'), w('pepper'), w('pickle'), w('potato'),
      w('pretzel'), w('radish'), w('raisin'), w('salmon'), w('shrimp'), w('squash'), w('tomato'),
      w('turkey'), w('waffle'), w('walnut'), w('yogurt'),
      // 7 letters
      w('alfalfa'), w('apricot'), w('avocado'), w('biscuit'), w('burrito'), w('cabbage'),
      w('chicken'), w('coconut'), w('cracker'), w('cupcake'), w('custard'), w('lettuce'),
      w('lobster'), w('mustard'), w('oatmeal'), w('pancake'), w('parsley'), w('popcorn'),
      w('pretzel'), w('pumpkin'), w('sausage'), w('spinach'), w('truffle'), w('vanilla'),
    ],
  },
  {
    id: 'sports',
    label: 'Sports',
    words: [
      // 4 letters
      w('bike'), w('bowl'), w('dart'), w('dive'), w('golf'), w('polo'), w('race'), w('sail'),
      w('shot'), w('surf'), w('swim'), w('yoga'),
      // 5 letters
      w('box'), w('catch'), w('chess'), w('climb'), w('dance'), w('fence'), w('kayak'),
      w('rugby'), w('skate'), w('skiing'), w('squash'), w('tennis'), w('track'),
      // 6 letters
      w('archery'), w('boxing'), w('cardio'), w('diving'), w('fencer'), w('hockey'),
      w('karate'), w('rowing'), w('soccer'), w('sprint'), w('squash'),
      // 7 letters
      w('archery'), w('basebal'), w('bowling'), w('cricket'), w('curling'), w('cycling'),
      w('fencing'), w('fitness'), w('football'), w('javelin'), w('jogging'), w('lacross'),
      w('running'), w('sailing'), w('skating'), w('surfing'), w('walking'), w('workout'),
    ],
  },
  {
    id: 'colors',
    label: 'Colors',
    words: [
      // 4 letters
      w('aqua'), w('blue'), w('cyan'), w('gold'), w('gray'), w('grey'), w('jade'), w('lime'),
      w('mint'), w('navy'), w('onyx'), w('pink'), w('plum'), w('rose'), w('ruby'), w('rust'),
      w('sage'), w('teal'),
      // 5 letters
      w('amber'), w('azure'), w('beige'), w('black'), w('blush'), w('brown'), w('coral'),
      w('cream'), w('ebony'), w('green'), w('ivory'), w('khaki'), w('lemon'), w('lilac'),
      w('mauve'), w('ochre'), w('olive'), w('peach'), w('pearl'), w('taupe'), w('white'),
      // 6 letters
      w('almond'), w('auburn'), w('bronze'), w('canary'), w('cerise'), w('cherry'), w('cobalt'),
      w('copper'), w('golden'), w('indigo'), w('maroon'), w('orange'), w('orchid'), w('oyster'),
      w('purple'), w('salmon'), w('scarlet'), w('sienna'), w('silver'), w('tawney'), w('violet'),
      w('yellow'),
      // 7 letters
      w('apricot'), w('avocado'), w('biscuit'), w('crimson'), w('emerald'), w('fuchsia'),
      w('heather'), w('hot pink'), w('magenta'), w('mustard'), w('rhubarb'), w('saffron'),
      w('scarlet'), w('vanilla'),
    ],
  },
  {
    id: 'nature',
    label: 'Nature',
    words: [
      // 4 letters
      w('bark'), w('bush'), w('cave'), w('clay'), w('dune'), w('fern'), w('fire'), w('foam'),
      w('gale'), w('hill'), w('lake'), w('leaf'), w('mesa'), w('moon'), w('moss'), w('peak'),
      w('pond'), w('rain'), w('reef'), w('rock'), w('root'), w('sand'), w('snow'), w('soil'),
      w('star'), w('stem'), w('tide'), w('tree'), w('twig'), w('vine'), w('wave'), w('wind'),
      w('wood'),
      // 5 letters
      w('beach'), w('bluff'), w('brook'), w('cliff'), w('cloud'), w('coral'), w('creek'),
      w('delta'), w('field'), w('flame'), w('flora'), w('frost'), w('glade'), w('grass'),
      w('grove'), w('marsh'), w('ocean'), w('plant'), w('ridge'), w('river'), w('shore'),
      w('slope'), w('stone'), w('storm'), w('swamp'), w('trail'), w('water'),
      // 6 letters
      w('aurora'), w('branch'), w('breeze'), w('canyon'), w('cavern'), w('desert'), w('flower'),
      w('forest'), w('geyser'), w('glacier'), w('island'), w('jungle'), w('lagoon'), w('meadow'),
      w('pebble'), w('rapids'), w('ravine'), w('stream'), w('sunset'), w('timber'), w('tundra'),
      w('valley'), w('zephyr'),
      // 7 letters
      w('blossom'), w('boulder'), w('cascade'), w('climate'), w('current'), w('drought'),
      w('erosion'), w('estuary'), w('foliage'), w('habitat'), w('iceberg'), w('monsoon'),
      w('pasture'), w('prairie'), w('rainbow'), w('savanna'), w('terrain'), w('thunder'),
      w('tornado'), w('tropics'), w('tsunami'), w('volcano'), w('wetland'),
    ],
  },
  {
    id: 'music',
    label: 'Music',
    words: [
      // 4 letters
      w('band'), w('bass'), w('beat'), w('bell'), w('drum'), w('duet'), w('flute'), w('gong'),
      w('harp'), w('horn'), w('hymn'), w('jazz'), w('lute'), w('lyric'), w('note'), w('oboe'),
      w('opus'), w('riff'), w('rock'), w('solo'), w('song'), w('tone'), w('trio'), w('tuba'),
      w('tune'),
      // 5 letters
      w('banjo'), w('blues'), w('brass'), w('cello'), w('choir'), w('chord'), w('dance'),
      w('disco'), w('drums'), w('flute'), w('genre'), w('metal'), w('music'), w('organ'),
      w('piano'), w('pitch'), w('polka'), w('salsa'), w('scale'), w('tempo'), w('tenor'),
      w('track'), w('viola'), w('voice'), w('waltz'),
      // 6 letters
      w('anthem'), w('ballad'), w('chorus'), w('fiddle'), w('gospel'), w('guitar'), w('jingle'),
      w('karoke'), w('lyrist'), w('maraca'), w('melody'), w('record'), w('reggae'), w('rhythm'),
      w('singer'), w('stereo'), w('string'), w('treble'), w('ukulele'), w('violin'),
      // 7 letters
      w('bagpipe'), w('baroque'), w('bassoon'), w('beatbox'), w('boombox'), w('cellist'),
      w('clarinet'), w('concert'), w('country'), w('drummer'), w('harmony'), w('jukebox'),
      w('karaoke'), w('maestro'), w('marcher'), w('octaves'), w('pianist'), w('quartet'),
      w('recital'), w('trumpet'), w('ukulele'),
    ],
  },
  {
    id: 'tools',
    label: 'Tools',
    words: [
      // 4 letters
      w('awl'), w('axe'), w('bolt'), w('clam'), w('file'), w('fork'), w('gear'), w('hook'),
      w('jack'), w('nail'), w('pick'), w('pipe'), w('rake'), w('rasp'), w('saw'), w('vise'),
      // 5 letters
      w('anvil'), w('auger'), w('blade'), w('brace'), w('brush'), w('chisel'), w('clamp'),
      w('crane'), w('drill'), w('knife'), w('lathe'), w('level'), w('mallet'), w('plane'),
      w('plier'), w('punch'), w('razor'), w('ruler'), w('screw'), w('spade'), w('wedge'),
      w('winch'), w('wrench'),
      // 6 letters
      w('chisel'), w('cutter'), w('gasket'), w('grater'), w('graver'), w('hammer'), w('jigsaw'),
      w('ladder'), w('mallet'), w('needle'), w('pallet'), w('pliers'), w('pulley'), w('router'),
      w('sander'), w('shears'), w('shovel'), w('sickle'), w('socket'), w('trowel'), w('wrench'),
      // 7 letters
      w('blowtorch'), w('chainsaw'), w('chipper'), w('chopper'), w('crowbar'), w('grinder'),
      w('hacksaw'), w('hatchet'), w('machete'), w('plumber'), w('ratchet'), w('scraper'),
      w('spatula'), w('stapler'), w('toolbox'), w('trimmer'), w('wrecker'),
    ],
  },
  {
    id: 'vehicles',
    label: 'Vehicles',
    words: [
      // 4 letters
      w('auto'), w('bike'), w('boat'), w('cart'), w('jeep'), w('kart'), w('raft'), w('ship'),
      w('sled'), w('tank'), w('taxi'), w('tram'), w('truck'), w('van'),
      // 5 letters
      w('barge'), w('buggy'), w('canoe'), w('coach'), w('coupe'), w('ferry'), w('kayak'),
      w('moped'), w('plane'), w('sedan'), w('train'), w('truck'), w('wagon'), w('yacht'),
      // 6 letters
      w('camper'), w('biking'), w('dinghy'), w('engine'), w('glider'), w('hearse'), w('hotrod'),
      w('hybrid'), w('pickup'), w('rocket'), w('tanker'), w('tandem'), w('trolly'),
      // 7 letters
      w('airship'), w('bicycle'), w('caravan'), w('chariot'), w('cruiser'), w('gondola'),
      w('minivan'), w('scooter'), w('steamer'), w('tractor'), w('trailer'), w('trolley'),
      w('tugboat'),
    ],
  },
  {
    id: 'weather',
    label: 'Weather',
    words: [
      // 4 letters
      w('calm'), w('cold'), w('damp'), w('dew'), w('fair'), w('fog'), w('gale'), w('gust'),
      w('hail'), w('haze'), w('heat'), w('mild'), w('mist'), w('rain'), w('sleet'), w('smog'),
      w('snow'), w('warm'), w('wind'),
      // 5 letters
      w('balmy'), w('blaze'), w('brisk'), w('chilly'), w('clear'), w('cloud'), w('dewy'),
      w('draft'), w('flood'), w('foggy'), w('frost'), w('gusty'), w('humid'), w('misty'),
      w('muggy'), w('rainy'), w('sleet'), w('snowy'), w('storm'), w('sunny'), w('windy'),
      // 6 letters
      w('arctic'), w('breezy'), w('cloudy'), w('freeze'), w('frosty'), w('gloomy'), w('golden'),
      w('partly'), w('shower'), w('sleety'), w('stormy'), w('sultry'), w('warmth'),
      // 7 letters
      w('blowing'), w('climate'), w('cyclone'), w('drizzle'), w('drought'), w('flurries'),
      w('freezing'), w('monsoon'), w('rainbow'), w('showers'), w('sunbeam'), w('sunrise'),
      w('tempest'), w('thunder'), w('tornado'), w('twister'), w('weather'),
    ],
  },
  {
    id: 'places',
    label: 'Places',
    words: [
      // 4 letters
      w('bank'), w('barn'), w('cafe'), w('city'), w('dorm'), w('farm'), w('fort'), w('hall'),
      w('home'), w('jail'), w('lawn'), w('loft'), w('mall'), w('park'), w('pier'), w('rink'),
      w('room'), w('shop'), w('town'), w('yard'), w('zone'),
      // 5 letters
      w('arena'), w('beach'), w('cabin'), w('chapel'), w('court'), w('depot'), w('diner'),
      w('field'), w('hotel'), w('house'), w('lodge'), w('manor'), w('motel'), w('plaza'),
      w('ranch'), w('salon'), w('shack'), w('shore'), w('store'), w('tower'), w('villa'),
      // 6 letters
      w('arcade'), w('avenue'), w('bazaar'), w('bridge'), w('campus'), w('casino'), w('castle'),
      w('church'), w('colony'), w('corner'), w('garage'), w('garden'), w('grotto'), w('harbor'),
      w('island'), w('kennel'), w('lounge'), w('market'), w('museum'), w('office'), w('palace'),
      w('prison'), w('resort'), w('school'), w('stable'), w('suburb'), w('temple'), w('tunnel'),
      // 7 letters
      w('airport'), w('aquarium'), w('balcony'), w('brewery'), w('capitol'), w('chateau'),
      w('citadel'), w('college'), w('convent'), w('cottage'), w('country'), w('factory'),
      w('gallery'), w('habitat'), w('highway'), w('mansion'), w('quarter'), w('shelter'),
      w('stadium'), w('station'), w('theater'), w('village'),
    ],
  },
  {
    id: 'body',
    label: 'Body Parts',
    words: [
      // 4 letters
      w('back'), w('bone'), w('chin'), w('ears'), w('elbow'), w('eyes'), w('face'), w('foot'),
      w('hair'), w('hand'), w('head'), w('heel'), w('hips'), w('jaw'), w('knee'), w('legs'),
      w('lips'), w('lung'), w('nail'), w('neck'), w('nose'), w('palm'), w('ribs'), w('shin'),
      w('skin'), w('toes'), w('vein'),
      // 5 letters
      w('ankle'), w('brain'), w('cheek'), w('chest'), w('elbow'), w('heart'), w('liver'),
      w('mouth'), w('spine'), w('teeth'), w('thigh'), w('thumb'), w('tongue'), w('waist'),
      w('wrist'),
      // 6 letters
      w('armpit'), w('biceps'), w('finger'), w('kidney'), w('knuckle'), w('larynx'), w('muscle'),
      w('pelvis'), w('retina'), w('socket'), w('spleen'), w('temple'), w('tendon'), w('throat'),
      w('tissue'),
      // 7 letters
      w('abdomen'), w('bladder'), w('cochlea'), w('collarbone'), w('eardrum'), w('eyebrow'),
      w('eyelash'), w('forearm'), w('jawbone'), w('kneecap'), w('nostril'), w('ribcage'),
      w('shinbone'), w('stomach'), w('thyroid'), w('trachea'), w('triceps'),
    ],
  },
];

/**
 * Get words from a category filtered by length
 */
export function getWordsByLength(category: CategoryWordBank, length: number): string[] {
  return category.words
    .filter(w => w.length === length)
    .map(w => w.word);
}
