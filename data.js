// Plant profiles are starting points. Adjust the interval for your own space.
const PLANT_TYPES = [
  { id: "monstera", name: "Monstera", days: 7, light: "Bright, indirect light", tip: "Let the top few centimetres of soil dry between waterings." },
  { id: "pothos", name: "Pothos", days: 7, light: "Low to bright, indirect light", tip: "Water when the top of the soil feels dry." },
  { id: "snake-plant", name: "Snake plant", days: 21, light: "Low to bright light", tip: "Let the soil dry out completely before watering." },
  { id: "peace-lily", name: "Peace lily", days: 5, light: "Medium, indirect light", tip: "Keep the soil lightly moist, not soggy." },
  { id: "succulent", name: "Succulent", days: 14, light: "Bright light", tip: "Water deeply, then let the soil dry completely." },
  { id: "herbs", name: "Indoor herbs", days: 3, light: "Bright light", tip: "Check the soil often; small pots can dry quickly." }
];

const STARTER_PLANTS = [
  { id: "starter-monstera", name: "Monstera", typeId: "monstera", interval: 7, location: "Living room", lastWateredOffset: -7 },
  { id: "starter-pothos", name: "Golden pothos", typeId: "pothos", interval: 7, location: "Bookshelf", lastWateredOffset: -5 },
  { id: "starter-snake", name: "Snake plant", typeId: "snake-plant", interval: 21, location: "Bedroom", lastWateredOffset: -15 }
];
