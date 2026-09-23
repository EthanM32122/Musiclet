const ASSET_BASE = "https://raw.githubusercontent.com/EthanM32122/Bazaar-Pack21/main/artifacts/api-server/public/content";

function blookImg(n) {
  return ASSET_BASE + "/blooks/" + encodeURIComponent(n) + ".webp";
}

function packImg(n) {
  return ASSET_BASE + "/packs/" + encodeURIComponent(n) + ".webp";
}

const CATALOG = {
  startTokens: 500,
  rarities: {
    "Common": { color: "#ffffff", exp: 0 },
    "Uncommon": { color: "#29e629", exp: 5 },
    "Rare": { color: "#0000ff", exp: 10 },
    "Epic": { color: "#8000ff", exp: 25 },
    "Legendary": { color: "#ffaf0f", exp: 100 },
    "Chroma": { color: "#00ccff", exp: 1000 },
    "Mystical": { color: "#843af2", exp: 2500 }
  },
  packs: [
    { name: "Medieval", price: 25, color1: "#d9b36c", color2: "#4a2c12", blooks: ["Elf", "Fairy", "Slime Monster", "Witch", "Wizard", "Dragon", "Jester", "Queen", "Unicorn", "King", "Phantom King"], img: packImg("Medieval") },
    { name: "Breakfast", price: 25, color1: "#ffcf5c", color2: "#8a4a12", blooks: ["Breakfast Combo", "Cereal", "Milk", "Orange Juice", "Toast", "Yogurt", "Pancakes", "Waffle", "French Toast", "Chocolate Milk", "Bacon and Eggs", "Rainbow Waffles"], img: packImg("Breakfast") },
    { name: "Space", price: 25, color1: "#8a7fff", color2: "#12103a", blooks: ["Earth", "Alien", "Meteor", "Stars", "Planet", "UFO", "Spaceship", "Astronaut", "Rainbow Astronaut"], img: packImg("Space") },
    { name: "Spooky", price: 25, color1: "#b45cff", color2: "#3a1052", blooks: ["Frankenstein", "Pumpkin", "Swamp Monster", "Vampire", "Caramel Apple", "Mummy", "Zombie", "Werewolf", "Ghost", "Spooky Ghost"], img: packImg("Spooky") },
    { name: "Aquatic", price: 25, color1: "#5fc9ff", color2: "#0b3a6a", blooks: ["Old Boot", "Clownfish", "Crab", "Frog", "Jellyfish", "Blobfish", "Octopus", "Pufferfish", "Narwhal", "Dolphin", "Baby Shark", "Megalodon", "Golden Blobfish"], img: packImg("Aquatic") },
    { name: "Bot", price: 25, color1: "#b0b8c4", color2: "#2e3440", blooks: ["Angry Bot", "Happy Bot", "Lil Bot", "Lovely Bot", "Buddy Bot", "Watson", "Brainy Bot", "Mega Bot"], img: packImg("Bot") },
    { name: "Dino", price: 25, color1: "#a8d977", color2: "#2f5d2a", blooks: ["Amber", "Dino Egg", "Dino Fossil", "Stegosaurus", "Brontosaurus", "Velociraptor", "Triceratops", "Tyrannosaurus Rex"], img: packImg("Dino") },
    { name: "Wonderland", price: 25, color1: "#ff9fd0", color2: "#5a1240", blooks: ["Two of Spades", "Alice", "Drink Me", "Eat Me", "Queen of Hearts", "Cheshire Cat", "Dormouse", "White Rabbit", "Caterpillar", "Mad Hatter", "King of Hearts"], img: packImg("Wonderland") },
    { name: "Safari", price: 25, color1: "#ffd27f", color2: "#6a3a0f", blooks: ["Flamingo", "Panda", "Sloth", "Tenrec", "Zebra", "Elephant", "Lemur", "Peacock", "Chameleon", "Lion", "Rainbow Panda"], img: packImg("Safari") },
    { name: "Ice Monster", price: 25, color1: "#7fd8ff", color2: "#1a4b7a", blooks: ["Ice Bat", "Ice Bug", "Ice Elemental", "Rock Monster", "Dink", "Donk", "Bush Monster", "Yeti", "Ice Slime", "Frozen Fossil", "Ice Crab"], img: packImg("Ice Monster") },
    { name: "Outback", price: 25, color1: "#ff9e6b", color2: "#7a2f12", blooks: ["Dingo", "Echidna", "Koala", "Kookaburra", "Joey", "Kangaroo", "Platypus", "Crocodile", "Sugar Glider", "Teal Platypus"], img: packImg("Outback") },
    { name: "Lunch", price: 25, color1: "#ffd45c", color2: "#b3541e", blooks: ["Bananas", "Watermelon", "Cheese", "Doughnut", "Taco", "Bao", "Sushi", "Cheeseburger", "Sandwich", "Half a Sandwich"], img: packImg("Lunch") },
    { name: "Blizzard", price: 25, color1: "#9fd8ff", color2: "#123a6a", blooks: ["Holiday Gift", "Holiday Wreath", "Hot Chocolate", "Snow Globe", "Stocking", "Gingerbread House", "Gingerbread Man", "Reindeer", "Snowman", "Santa Claus"], img: packImg("Blizzard") },
    { name: "Autumn", price: 25, color1: "#ffb35c", color2: "#6a2f0f", blooks: ["Black Bear", "Pumpkin Pie", "Chipmunk", "Cornucopia", "Autumn Cat", "Pumpkin Puppy", "Red Squirrel", "Autumn Crow", "Turkey", "Goldfinch"], img: packImg("Autumn") }
  ]
};
