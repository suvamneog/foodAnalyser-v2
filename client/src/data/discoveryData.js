/** Homepage discovery content */

/**
 * All nutrition numbers below come from real IFCT 2017 / INDB per-100g rows.
 * Fetched with GET /api/food/by-id?source=INDB&code=<code>.
 * See scripts / audit in commit history when values need refreshing.
 * Values are per 100 g of the prepared dish (except where noted).
 */

export const TRENDING_DISHES = [
  {
    name: "Butter Chicken",
    match: { source: "INDB", code: "ASC242" },
    calories: 137,
    protein: 11,
    carbs: 4,
    fat: 9,
    fiber: 1,
    healthScore: 71,
    source: "INDB",
    image:
      "/foods/butter-chicken.jpg",
  },
  {
    name: "Chicken Biryani",
    match: { source: "INDB", code: "BFP142" },
    note: "Nutrition matched via chicken pulao (INDB)",
    calories: 108,
    protein: 6,
    carbs: 11,
    fat: 8,
    fiber: 2,
    healthScore: 66,
    source: "INDB",
    image:
      "/foods/chicken-biryani.jpg",
  },
  {
    name: "Masala Dosa",
    match: { source: "INDB", code: "ASC146" },
    calories: 165,
    protein: 3,
    carbs: 20,
    fat: 8,
    fiber: 3,
    healthScore: 65,
    source: "INDB",
    image:
      "/foods/masala-dosa.jpg",
  },
  {
    name: "Rajma Chawal",
    match: { source: "INDB", code: "ASC165" },
    note: "Rajma curry only — rice adds ~120 kcal per 100 g",
    calories: 144,
    protein: 6,
    carbs: 16,
    fat: 6,
    fiber: 6,
    healthScore: 80,
    source: "INDB",
    image:
      "/foods/rajma-chawal.jpg",
  },
  {
    name: "Paneer Butter Masala",
    match: { source: "INDB", code: "ASC222" },
    calories: 146,
    protein: 7,
    carbs: 10,
    fat: 9,
    fiber: 2,
    healthScore: 67,
    source: "INDB",
    image:
      "/foods/paneer-butter-masala.jpg",
  },
  {
    name: "Chole Bhature",
    match: { source: "INDB", code: "BFP185" },
    note: "Kabuli chana curry only — bhatura adds ~330 kcal per 100 g",
    calories: 69,
    protein: 3,
    carbs: 8,
    fat: 3,
    fiber: 1,
    healthScore: 62,
    source: "INDB",
    image:
      "/foods/chole-bhature.jpg",
  },
  {
    name: "Pav Bhaji",
    match: { source: "INDB", code: "OSR112" },
    note: "Bhaji only — pav adds ~275 kcal per 100 g",
    calories: 97,
    protein: 3,
    carbs: 12,
    fat: 4,
    fiber: 2,
    healthScore: 64,
    source: "INDB",
    image:
      "/foods/pav-bhaji.jpg",
  },
  {
    name: "Poha",
    match: { source: "INDB", code: "BFP044" },
    calories: 295,
    protein: 6,
    carbs: 35,
    fat: 14,
    fiber: 4,
    healthScore: 53,
    source: "INDB",
    image:
      "/foods/poha.jpg",
  },
  {
    name: "Idli",
    match: { source: "INDB", code: "ASC144" },
    calories: 138,
    protein: 5,
    carbs: 28,
    fat: 0,
    fiber: 2,
    healthScore: 67,
    source: "INDB",
    image:
      "/foods/idli.jpg",
  },
  {
    name: "Rogan Josh",
    match: { source: "INDB", code: "ASC227" },
    calories: 140,
    protein: 10,
    carbs: 5,
    fat: 9,
    fiber: 2,
    healthScore: 71,
    source: "INDB",
    image:
      "/foods/rogan-josh.jpg",
  },
];

export const POPULAR_SEARCHES = [
  "Idli",
  "Masala Dosa",
  "Butter Chicken",
  "Dal",
  "Poha",
  "Rajma",
  "Paneer",
  "Chicken Biryani",
  "Dhokla",
  "Roti",
];

export const REGIONS = [
  {
    state: "Punjab",
    slug: "punjab",
    tagline: "Rich tandoori flavours",
    query: "butter chicken",
    match: { source: "INDB", code: "ASC242" },
    foods: 48,
    dishes: [
      { name: "Butter Chicken", query: "butter chicken", match: { source: "INDB", code: "ASC242" } },
      { name: "Sarson da Saag", query: "sarson" },
      { name: "Makki di Roti", query: "makki" },
      { name: "Chole", query: "chole" },
      { name: "Lassi", query: "lassi" },
      { name: "Amritsari Kulcha", query: "kulcha" },
    ],
    image:
      "/foods/butter-chicken.jpg",
  },
  {
    state: "Assam",
    slug: "assam",
    tagline: "Fresh river fish & traditional cuisine",
    query: "masor tenga",
    match: { source: "ASSAM", code: "ASM016" },
    foods: 32,
    dishes: [
      { name: "Masor Tenga", query: "masor tenga", match: { source: "ASSAM", code: "ASM016" } },
      { name: "Aloo Pitika", query: "aloo pitika", match: { source: "ASSAM", code: "ASM008" } },
      { name: "Khorisa", query: "khorisa", match: { source: "ASSAM", code: "ASM028" } },
      { name: "Lai Xaak", query: "lai xaak", match: { source: "ASSAM", code: "ASM007" } },
      { name: "Narikol Pitha", query: "narikol pitha", match: { source: "ASSAM", code: "ASM031" } },
      { name: "Assamese Thali", query: "assamese thali", match: { source: "ASSAM", code: "ASM030" } },
    ],
    image:
      "/foods/fish-curry.jpg",
  },
  {
    state: "Manipur",
    slug: "manipur",
    tagline: "Fermented soy, fish & bamboo classics",
    query: "hawaijar",
    match: { source: "MANIPUR", code: "MNP001" },
    foods: 5,
    dishes: [
      { name: "Hawaijar", query: "hawaijar", match: { source: "MANIPUR", code: "MNP001" } },
      { name: "Ngari", query: "ngari", match: { source: "MANIPUR", code: "MNP003" } },
      { name: "Hentak", query: "hentak", match: { source: "MANIPUR", code: "MNP002" } },
      { name: "Soibum", query: "soibum", match: { source: "MANIPUR", code: "MNP004" } },
      { name: "Soidon", query: "soidon", match: { source: "MANIPUR", code: "MNP005" } },
    ],
    image: "/foods/manipur-food.jpg",
  },
  {
    state: "Meghalaya",
    slug: "meghalaya",
    tagline: "Khasi fermented soy, fish & wild foods",
    query: "tungrymbai",
    match: { source: "MEGHALAYA", code: "MLG002" },
    foods: 6,
    dishes: [
      { name: "Tungrymbai", query: "tungrymbai", match: { source: "MEGHALAYA", code: "MLG002" } },
      { name: "Tungtap", query: "tungtap", match: { source: "MEGHALAYA", code: "MLG001" } },
      { name: "Lungsiej", query: "lungsiej", match: { source: "MEGHALAYA", code: "MLG003" } },
      { name: "Sohiong", query: "sohiong", match: { source: "MEGHALAYA", code: "MLG009" } },
    ],
    image: "/foods/veg-meal.jpg",
  },
  {
    state: "Nagaland",
    slug: "nagaland",
    tagline: "Smoky fermented leaves & bamboo",
    query: "hungrii",
    match: { source: "NAGALAND", code: "NGL001" },
    foods: 4,
    dishes: [
      { name: "Hungrii", query: "hungrii", match: { source: "NAGALAND", code: "NGL001" } },
      { name: "Anishi", query: "anishi", match: { source: "NAGALAND", code: "NGL004" } },
      { name: "Rhujuk", query: "rhujuk", match: { source: "NAGALAND", code: "NGL002" } },
      { name: "Tsutuocie", query: "tsutuocie", match: { source: "NAGALAND", code: "NGL003" } },
    ],
    image: "/foods/nagaland-food.jpg",
  },
  {
    state: "Kerala",
    slug: "kerala",
    tagline: "Coastal coconut delicacies",
    query: "appam",
    match: { source: "INDB", code: "BFP153" },
    foods: 41,
    dishes: [
      { name: "Appam", query: "appam", match: { source: "INDB", code: "BFP153" } },
      { name: "Fish Curry", query: "fish curry", match: { source: "INDB", code: "ASC246" } },
      { name: "Puttu", query: "puttu", match: { source: "INDB", code: "OSR105" } },
      { name: "Avial", query: "avial" },
      { name: "Idiyappam", query: "idiyappam" },
    ],
    image:
      "/foods/kerala-food.jpg",
  },
  {
    state: "Tamil Nadu",
    slug: "tamil-nadu",
    tagline: "Idli, dosa & filter coffee culture",
    query: "masala dosa",
    match: { source: "INDB", code: "ASC146" },
    foods: 56,
    dishes: [
      { name: "Masala Dosa", query: "masala dosa", match: { source: "INDB", code: "ASC146" } },
      { name: "Idli", query: "idli", match: { source: "INDB", code: "ASC144" } },
      { name: "Sambar", query: "sambar", match: { source: "INDB", code: "ASC167" } },
      { name: "Rasam", query: "rasam" },
      { name: "Pongal", query: "pongal" },
      { name: "Vada", query: "vada" },
    ],
    image:
      "/foods/masala-dosa.jpg",
  },
  {
    state: "West Bengal",
    slug: "west-bengal",
    tagline: "Mustard fish & festive sweets",
    query: "fish",
    match: { source: "INDB", code: "BFP223" },
    foods: 38,
    dishes: [
      { name: "Fish Curry", query: "fish curry", match: { source: "INDB", code: "ASC246" } },
      { name: "Aloo Posto", query: "aloo" },
      { name: "Luchi", query: "luchi" },
      { name: "Rosogolla", query: "rosogolla" },
      { name: "Mishti Doi", query: "curd" },
    ],
    image:
      "/foods/idli.jpg",
  },
  {
    state: "Gujarat",
    slug: "gujarat",
    tagline: "Light, sweet & savoury snacks",
    query: "dhokla",
    match: { source: "INDB", code: "ASC474" },
    foods: 35,
    dishes: [
      { name: "Dhokla", query: "dhokla", match: { source: "INDB", code: "ASC474" } },
      { name: "Thepla", query: "thepla" },
      { name: "Undhiyu", query: "undhiyu" },
      { name: "Khandvi", query: "khandvi" },
      { name: "Khakhra", query: "khakhra" },
    ],
    image:
      "/foods/dhokla.jpg",
  },
  {
    state: "Maharashtra",
    slug: "maharashtra",
    tagline: "Street classics & coastal thalis",
    query: "pav bhaji",
    match: { source: "INDB", code: "OSR112" },
    foods: 44,
    dishes: [
      { name: "Pav Bhaji", query: "pav bhaji", match: { source: "INDB", code: "OSR112" } },
      { name: "Vada Pav", query: "vada" },
      { name: "Misal Pav", query: "misal" },
      { name: "Puran Poli", query: "puran poli" },
      { name: "Bhakri", query: "bhakri" },
    ],
    image:
      "/foods/pav-bhaji.jpg",
  },
  {
    state: "Rajasthan",
    slug: "rajasthan",
    tagline: "Desert spices & royal plates",
    query: "dal",
    match: { source: "INDB", code: "OSR139" },
    foods: 29,
    dishes: [
      { name: "Dal Baati", query: "dal" },
      { name: "Gatte ki Sabzi", query: "gatte" },
      { name: "Ker Sangri", query: "ker" },
      { name: "Laal Maas", query: "mutton" },
      { name: "Bajra Roti", query: "bajra" },
    ],
    image:
      "/foods/indian-thali.jpg",
  },
  {
    state: "Kashmir",
    slug: "kashmir",
    tagline: "Warming curries from the valley",
    query: "rogan josh",
    match: { source: "INDB", code: "ASC227" },
    foods: 26,
    dishes: [
      { name: "Rogan Josh", query: "rogan josh", match: { source: "INDB", code: "ASC227" } },
      { name: "Yakhni", query: "yakhni" },
      { name: "Dum Aloo", query: "dum aloo" },
      { name: "Kahwa", query: "tea" },
      { name: "Modur Pulav", query: "pulao" },
    ],
    image:
      "/foods/rogan-josh.jpg",
  },
  {
    state: "Odisha",
    slug: "odisha",
    tagline: "Temple cuisine & fermented rice",
    query: "rice",
    match: { source: "INDB", code: "ASC126" },
    foods: 24,
    dishes: [
      { name: "Pakhala", query: "rice" },
      { name: "Dalma", query: "dal" },
      { name: "Chhena Poda", query: "chhena" },
      { name: "Machha Besara", query: "fish" },
      { name: "Kanika", query: "rice" },
    ],
    image:
      "/foods/salad-bowl.jpg",
  },
];

export const getRegionBySlug = (slug) =>
  REGIONS.find((r) => r.slug === String(slug || "").toLowerCase());

export const HERO_COLLAGE = [
  {
    src: "/foods/butter-chicken.jpg",
    depth: "mid",
    className:
      "left-[1%] top-[14%] h-20 w-16 rotate-[-7deg] sm:left-[2%] sm:top-[16%] sm:h-36 sm:w-28 md:h-44 md:w-36 lg:left-[4%]",
  },
  {
    src: "/foods/chicken-biryani.jpg",
    depth: "front",
    className:
      "right-[1%] top-[10%] h-24 w-20 rotate-[6deg] sm:right-[2%] sm:top-[12%] sm:h-40 sm:w-32 md:h-48 md:w-40 lg:right-[4%]",
  },
  {
    src: "/foods/idli.jpg",
    depth: "back",
    className:
      "left-[2%] bottom-[10%] h-16 w-20 rotate-[5deg] sm:left-[6%] sm:bottom-[12%] sm:h-28 sm:w-36 md:h-36 md:w-44 lg:left-[8%]",
  },
  {
    src: "/foods/masala-dosa.jpg",
    depth: "mid",
    className:
      "right-[2%] bottom-[11%] h-20 w-24 rotate-[-4deg] sm:right-[5%] sm:bottom-[14%] sm:h-32 sm:w-40 md:h-40 md:w-48 lg:right-[7%]",
  },
  {
    src: "/foods/paneer-butter-masala.jpg",
    depth: "back",
    className:
      "left-[20%] top-[40%] hidden h-28 w-24 rotate-[-10deg] lg:block",
  },
  {
    src: "/foods/dhokla.jpg",
    depth: "front",
    className:
      "right-[18%] top-[44%] hidden h-24 w-32 rotate-[8deg] lg:block",
  },
];

export const CREDIBILITY_STATS = [
  { label: "Foods Indexed", value: "1600+", icon: "Utensils" },
  { label: "IFCT Foods", value: "542", icon: "Database" },
  { label: "INDB Recipes", value: "1000+", icon: "Leaf" },
  { label: "AI Recognition", value: "Vision", icon: "Camera" },
  { label: "Regional", value: "47", icon: "GraduationCap" },
];

export const FEATURED_DISHES = [
  {
    name: "Masala Dosa",
    match: { source: "INDB", code: "ASC146" },
    state: "Tamil Nadu",
    cuisineSlug: "tamil-nadu",
    description:
      "A crisp fermented rice-lentil crepe filled with spiced potato — light, satisfying, and rooted in South Indian breakfast culture.",
    insight: "Naturally fermented, easy to digest and relatively low in fat when cooked with less oil.",
    calories: 165,
    protein: 3,
    carbs: 20,
    fat: 8,
    fiber: 3,
    healthScore: 65,
    source: "INDB",
    image:
      "/foods/masala-dosa.jpg",
  },
  {
    name: "Rajma Curry",
    match: { source: "INDB", code: "ASC165" },
    state: "North India",
    cuisineSlug: "punjab",
    description:
      "Kidney beans simmered with an onion-tomato masala — a fibre-rich vegetarian plate typically served with steamed rice.",
    insight: "High in fibre and plant protein from the beans; rice adds carbs when served as rajma-chawal.",
    calories: 144,
    protein: 6,
    carbs: 16,
    fat: 6,
    fiber: 6,
    healthScore: 80,
    source: "INDB",
    image:
      "/foods/rajma-chawal.jpg",
  },
  {
    name: "Idli",
    match: { source: "INDB", code: "ASC144" },
    state: "South India",
    cuisineSlug: "tamil-nadu",
    description:
      "Steamed rice cakes that are soft, low-oil, and easy to digest — a classic South Indian breakfast staple.",
    insight: "Steamed, not fried — naturally fermented and one of the lightest traditional Indian breakfasts.",
    calories: 138,
    protein: 5,
    carbs: 28,
    fat: 0,
    fiber: 2,
    healthScore: 67,
    source: "INDB",
    image:
      "/foods/idli.jpg",
  },
  {
    name: "Fish Curry",
    match: { source: "INDB", code: "ASC246" },
    state: "Assam / Coastal India",
    cuisineSlug: "assam",
    description:
      "Tangy, spice-forward fish preparations that deliver lean protein with regional character from river and coast.",
    insight: "Lean protein with regional spices — a strong choice when cooked with restrained oil.",
    calories: 111,
    protein: 9,
    carbs: 4,
    fat: 7,
    fiber: 2,
    healthScore: 71,
    source: "INDB",
    image:
      "/foods/fish-curry.jpg",
  },
];

export const CATEGORIES = [
  {
    id: "high-protein",
    label: "High Protein",
    query: "chicken breast",
    match: { source: "IFCT", code: "N003" },
    blurb: "Build muscle with Indian staples",
    examples: ["Chicken", "Egg", "Fish", "Paneer"],
    count: "120+",
    icon: "Dumbbell",
    accent: "from-ink-950/90 via-ink-950/55 to-rose-900/20",
    image:
      "/foods/grilled-chicken.jpg",
  },
  {
    id: "weight-loss",
    label: "Weight Loss",
    query: "khichdi",
    match: { source: "INDB", code: "BFP144" },
    blurb: "Lighter bowls that still satisfy",
    examples: ["Khichdi", "Soup", "Salad", "Dalia"],
    count: "90+",
    icon: "Scale",
    accent: "from-ink-950/90 via-ink-950/55 to-emerald-900/25",
    image:
      "/foods/salad-bowl.jpg",
  },
  {
    id: "high-fibre",
    label: "High Fibre",
    query: "dal",
    match: { source: "INDB", code: "ASC165" },
    blurb: "Gut-friendly dals & grains",
    examples: ["Dal", "Oats", "Millet", "Sprouts"],
    count: "85+",
    icon: "Wheat",
    accent: "from-ink-950/90 via-ink-950/55 to-lime-900/20",
    image:
      "/foods/indian-thali.jpg",
  },
  {
    id: "low-carb",
    label: "Low Carb",
    query: "paneer",
    match: { source: "INDB", code: "ASC215" },
    blurb: "Fewer carbs, more flavour",
    examples: ["Paneer", "Egg", "Chicken", "Fish"],
    count: "70+",
    icon: "Leaf",
    accent: "from-ink-950/90 via-ink-950/55 to-sky-900/25",
    image:
      "/foods/paneer-tikka.jpg",
  },
  {
    id: "vegetarian",
    label: "Vegetarian",
    query: "palak paneer",
    match: { source: "INDB", code: "ASC215" },
    blurb: "Classic sabzi & curries",
    examples: ["Paneer", "Dal", "Sabzi", "Curd"],
    count: "200+",
    icon: "Salad",
    accent: "from-ink-950/90 via-ink-950/55 to-amber-900/20",
    image:
      "/foods/dhokla.jpg",
  },
  {
    id: "vegan",
    label: "Vegan",
    query: "chole",
    match: { source: "INDB", code: "ASC162" },
    blurb: "Plant-forward Indian plates",
    examples: ["Chole", "Rajma", "Tofu", "Millet"],
    count: "110+",
    icon: "Sprout",
    accent: "from-ink-950/90 via-ink-950/55 to-green-900/25",
    image:
      "/foods/veg-meal.jpg",
  },
  {
    id: "traditional",
    label: "Traditional Indian",
    query: "thali",
    match: { source: "INDB", code: "ASC165" },
    blurb: "Homestyle classics",
    examples: ["Thali", "Rice", "Roti", "Curry"],
    count: "300+",
    icon: "Utensils",
    accent: "from-ink-950/90 via-ink-950/55 to-orange-900/25",
    image:
      "/foods/rajma-chawal.jpg",
  },
  {
    id: "street-food",
    label: "Street Food",
    query: "samosa",
    match: { source: "INDB", code: "ASC361" },
    blurb: "Know what you snack on",
    examples: ["Samosa", "Pani Puri", "Vada", "Chaat"],
    count: "60+",
    icon: "Store",
    accent: "from-ink-950/90 via-ink-950/55 to-yellow-900/20",
    image:
      "/foods/poha.jpg",
  },
  {
    id: "breakfast",
    label: "Healthy Breakfast",
    query: "idli",
    match: { source: "INDB", code: "ASC144" },
    blurb: "Start light, stay fuelled",
    examples: ["Idli", "Poha", "Upma", "Oats"],
    count: "75+",
    icon: "Coffee",
    accent: "from-ink-950/90 via-ink-950/55 to-cyan-900/20",
    image:
      "/foods/idli.jpg",
  },
  {
    id: "snacks",
    label: "Healthy Snacks",
    query: "roasted chana",
    match: { source: "INDB", code: "ASC259" },
    blurb: "Smarter munching",
    examples: ["Chana", "Fruit", "Nuts", "Yogurt"],
    count: "50+",
    icon: "Apple",
    accent: "from-ink-950/90 via-ink-950/55 to-stone-800/40",
    image:
      "/foods/snacks-nuts.jpg",
  },
];

export const WHY_FEATURES = [
  {
    title: "Built for Indian Foods",
    body: "Designed around everyday Indian meals — not Western calorie apps with missing dishes.",
  },
  {
    title: "IFCT & INDB first",
    body: "Core macros prefer ICMR–NIN IFCT 2017 and the Indian Nutrient Databank when a match exists.",
  },
  {
    title: "AI Food Recognition",
    body: "Photograph a dish and get identification matched to Indian nutrition data.",
  },
  {
    title: "Barcode Scanner",
    body: "Decode packaged foods via Open Food Facts and map toward Indian alternatives when possible.",
  },
  {
    title: "Meal Tracking",
    body: "Log meals securely and watch daily calories and macros add up.",
  },
  {
    title: "Health Score",
    body: "A habit-style score from your logs — not a clinical diagnosis.",
  },
  {
    title: "Regional estimates",
    body: "Assam and Northeast dishes may use regional estimates. Only listed nutrients are shown; they are not IFCT/INDB verified.",
  },
];

export const TRUST_BADGES = [
  "IFCT 2017 (ICMR–NIN)",
  "Indian Nutrient Databank",
  "Open Food Facts",
  "Regional estimates labeled",
  "Source labels on every result",
];

export const SEARCH_PLACEHOLDERS = [
  "Search Chicken Biryani, Paneer, Masor Tenga, Idli...",
  "Try Butter Chicken, Rajma Chawal, or Poha",
  "Explore IFCT, INDB, and regional Indian foods",
  "Search dal, dosa, biryani, or fish curry",
];

export const QUICK_ACTIONS = [
  { label: "Diet plan", path: "/plan" },
  { label: "Daily tracker", path: "/tracker" },
  { label: "Recipe nutrition", path: "/recipe" },
  { label: "Your profile", path: "/profile" },
  { label: "Analyze Food Image", path: "/image" },
  { label: "Scan Barcode", path: "/scan" },
  { label: "Compare regions", path: "/compare/roti" },
  { label: "Calculate Calories", path: "/calculator" },
];

export const FOOTER_LINKS = {
  product: [
    { label: "About", path: "/about" },
    { label: "Diet Plan", path: "/plan" },
    { label: "Daily Tracker", path: "/tracker" },
    { label: "Recipe Nutrition", path: "/recipe" },
    { label: "Compare staples", path: "/compare/roti" },
    { label: "Calculator", path: "/calculator" },
    { label: "Image Recognition", path: "/image" },
    { label: "Barcode Scanner", path: "/scan" },
    { label: "Meal Tracker", path: "/logmeals" },
  ],
  resources: [
    { label: "Reviews", path: "/review" },
    { label: "Contact", href: "mailto:hello@foodanalyser.app" },
  ],
};
