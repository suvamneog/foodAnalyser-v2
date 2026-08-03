/** Homepage discovery content */

export const TRENDING_DISHES = [
  {
    name: "Butter Chicken",
    calories: 290,
    protein: 23,
    healthScore: 62,
    source: "INDB",
    image:
      "https://images.unsplash.com/photo-1603894584372-c69caa91ef37?w=640&q=80&auto=format&fit=crop",
  },
  {
    name: "Chicken Biryani",
    calories: 320,
    protein: 18,
    healthScore: 58,
    source: "INDB",
    image:
      "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=640&q=80&auto=format&fit=crop",
  },
  {
    name: "Masala Dosa",
    calories: 210,
    protein: 6,
    healthScore: 74,
    source: "INDB",
    image:
      "https://images.unsplash.com/photo-1668236543090-82eba5eeab39?w=640&q=80&auto=format&fit=crop",
  },
  {
    name: "Rajma Chawal",
    calories: 250,
    protein: 12,
    healthScore: 78,
    source: "INDB",
    image:
      "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=640&q=80&auto=format&fit=crop",
  },
  {
    name: "Paneer Butter Masala",
    calories: 310,
    protein: 14,
    healthScore: 55,
    source: "INDB",
    image:
      "https://images.unsplash.com/photo-1631452180519-c014fe946bcc?w=640&q=80&auto=format&fit=crop",
  },
  {
    name: "Chole Bhature",
    calories: 420,
    protein: 11,
    healthScore: 42,
    source: "INDB",
    image:
      "https://images.unsplash.com/photo-1626132647523-66f5bf380027?w=640&q=80&auto=format&fit=crop",
  },
  {
    name: "Pav Bhaji",
    calories: 280,
    protein: 8,
    healthScore: 48,
    source: "INDB",
    image:
      "https://images.unsplash.com/photo-1606491956689-2ea866880067?w=640&q=80&auto=format&fit=crop",
  },
  {
    name: "Poha",
    calories: 180,
    protein: 4,
    healthScore: 82,
    source: "IFCT",
    image:
      "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=640&q=80&auto=format&fit=crop",
  },
  {
    name: "Idli",
    calories: 60,
    protein: 2,
    healthScore: 88,
    source: "IFCT",
    image:
      "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=640&q=80&auto=format&fit=crop",
  },
  {
    name: "Rogan Josh",
    calories: 270,
    protein: 22,
    healthScore: 64,
    source: "INDB",
    image:
      "https://images.unsplash.com/photo-1545247181-516566c33cbf?w=640&q=80&auto=format&fit=crop",
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
    foods: 48,
    dishes: [
      { name: "Butter Chicken", query: "butter chicken" },
      { name: "Sarson da Saag", query: "sarson" },
      { name: "Makki di Roti", query: "makki" },
      { name: "Chole", query: "chole" },
      { name: "Lassi", query: "lassi" },
      { name: "Amritsari Kulcha", query: "kulcha" },
    ],
    image:
      "https://images.unsplash.com/photo-1603894584372-c69caa91ef37?w=720&q=75&auto=format&fit=crop",
  },
  {
    state: "Assam",
    slug: "assam",
    tagline: "Fresh river fish & traditional cuisine",
    query: "fish curry",
    foods: 32,
    dishes: [
      { name: "Fish Curry", query: "fish curry" },
      { name: "Masor Tenga", query: "fish" },
      { name: "Aloo Pitika", query: "potato" },
      { name: "Khar", query: "khar" },
      { name: "Pitha", query: "pitha" },
    ],
    image:
      "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=720&q=75&auto=format&fit=crop",
  },
  {
    state: "Kerala",
    slug: "kerala",
    tagline: "Coastal coconut delicacies",
    query: "appam",
    foods: 41,
    dishes: [
      { name: "Appam", query: "appam" },
      { name: "Fish Curry", query: "fish curry" },
      { name: "Puttu", query: "puttu" },
      { name: "Avial", query: "avial" },
      { name: "Idiyappam", query: "idiyappam" },
    ],
    image:
      "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=720&q=75&auto=format&fit=crop",
  },
  {
    state: "Tamil Nadu",
    slug: "tamil-nadu",
    tagline: "Idli, dosa & filter coffee culture",
    query: "masala dosa",
    foods: 56,
    dishes: [
      { name: "Masala Dosa", query: "masala dosa" },
      { name: "Idli", query: "idli" },
      { name: "Sambar", query: "sambar" },
      { name: "Rasam", query: "rasam" },
      { name: "Pongal", query: "pongal" },
      { name: "Vada", query: "vada" },
    ],
    image:
      "https://images.unsplash.com/photo-1668236543090-82eba5eeab39?w=720&q=75&auto=format&fit=crop",
  },
  {
    state: "West Bengal",
    slug: "west-bengal",
    tagline: "Mustard fish & festive sweets",
    query: "fish",
    foods: 38,
    dishes: [
      { name: "Fish Curry", query: "fish curry" },
      { name: "Aloo Posto", query: "aloo" },
      { name: "Luchi", query: "luchi" },
      { name: "Rosogolla", query: "rosogolla" },
      { name: "Mishti Doi", query: "curd" },
    ],
    image:
      "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=720&q=75&auto=format&fit=crop",
  },
  {
    state: "Gujarat",
    slug: "gujarat",
    tagline: "Light, sweet & savoury snacks",
    query: "dhokla",
    foods: 35,
    dishes: [
      { name: "Dhokla", query: "dhokla" },
      { name: "Thepla", query: "thepla" },
      { name: "Undhiyu", query: "undhiyu" },
      { name: "Khandvi", query: "khandvi" },
      { name: "Khakhra", query: "khakhra" },
    ],
    image:
      "https://images.unsplash.com/photo-1601050690117-94f5f6fa8bd0?w=720&q=75&auto=format&fit=crop",
  },
  {
    state: "Maharashtra",
    slug: "maharashtra",
    tagline: "Street classics & coastal thalis",
    query: "pav bhaji",
    foods: 44,
    dishes: [
      { name: "Pav Bhaji", query: "pav bhaji" },
      { name: "Vada Pav", query: "vada" },
      { name: "Misal Pav", query: "misal" },
      { name: "Puran Poli", query: "puran poli" },
      { name: "Bhakri", query: "bhakri" },
    ],
    image:
      "https://images.unsplash.com/photo-1606491956689-2ea866880067?w=720&q=75&auto=format&fit=crop",
  },
  {
    state: "Rajasthan",
    slug: "rajasthan",
    tagline: "Desert spices & royal plates",
    query: "dal",
    foods: 29,
    dishes: [
      { name: "Dal Baati", query: "dal" },
      { name: "Gatte ki Sabzi", query: "gatte" },
      { name: "Ker Sangri", query: "ker" },
      { name: "Laal Maas", query: "mutton" },
      { name: "Bajra Roti", query: "bajra" },
    ],
    image:
      "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=720&q=75&auto=format&fit=crop",
  },
  {
    state: "Kashmir",
    slug: "kashmir",
    tagline: "Warming curries from the valley",
    query: "rogan josh",
    foods: 26,
    dishes: [
      { name: "Rogan Josh", query: "rogan josh" },
      { name: "Yakhni", query: "yakhni" },
      { name: "Dum Aloo", query: "dum aloo" },
      { name: "Kahwa", query: "tea" },
      { name: "Modur Pulav", query: "pulao" },
    ],
    image:
      "https://images.unsplash.com/photo-1545247181-516566c33cbf?w=720&q=75&auto=format&fit=crop",
  },
  {
    state: "Odisha",
    slug: "odisha",
    tagline: "Temple cuisine & fermented rice",
    query: "rice",
    foods: 24,
    dishes: [
      { name: "Pakhala", query: "rice" },
      { name: "Dalma", query: "dal" },
      { name: "Chhena Poda", query: "chhena" },
      { name: "Machha Besara", query: "fish" },
      { name: "Kanika", query: "rice" },
    ],
    image:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=720&q=75&auto=format&fit=crop",
  },
];

export const getRegionBySlug = (slug) =>
  REGIONS.find((r) => r.slug === String(slug || "").toLowerCase());

export const HERO_COLLAGE = [
  {
    src: "https://images.unsplash.com/photo-1603894584372-c69caa91ef37?w=320&q=70&auto=format&fit=crop",
    className: "left-[4%] top-[18%] h-28 w-28 sm:h-36 sm:w-36 rotate-[-8deg]",
  },
  {
    src: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=320&q=70&auto=format&fit=crop",
    className: "right-[5%] top-[14%] h-32 w-32 sm:h-40 sm:w-40 rotate-[7deg]",
  },
  {
    src: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=320&q=70&auto=format&fit=crop",
    className: "left-[8%] bottom-[16%] h-24 w-24 sm:h-32 sm:w-32 rotate-[6deg]",
  },
  {
    src: "https://images.unsplash.com/photo-1668236543090-82eba5eeab39?w=320&q=70&auto=format&fit=crop",
    className: "right-[7%] bottom-[18%] h-28 w-28 sm:h-36 sm:w-36 rotate-[-5deg]",
  },
  {
    src: "https://images.unsplash.com/photo-1631452180519-c014fe946bcc?w=320&q=70&auto=format&fit=crop",
    className: "left-[18%] top-[42%] hidden h-20 w-20 rotate-[-3deg] lg:block",
  },
  {
    src: "https://images.unsplash.com/photo-1601050690117-94f5f6fa8bd0?w=320&q=70&auto=format&fit=crop",
    className: "right-[16%] top-[48%] hidden h-20 w-20 rotate-[4deg] lg:block",
  },
];

export const CREDIBILITY_STATS = [
  { label: "Foods Indexed", value: "1500+", icon: "Utensils" },
  { label: "IFCT Foods", value: "542", icon: "Database" },
  { label: "INDB Recipes", value: "1000+", icon: "Leaf" },
  { label: "AI Recognition", value: "Vision", icon: "Camera" },
  { label: "Research", value: "IEEE", icon: "GraduationCap" },
];

export const FEATURED_DISHES = [
  {
    name: "Masala Dosa",
    state: "Tamil Nadu",
    description:
      "A crisp fermented rice-lentil crepe filled with spiced potato — light, satisfying, and rooted in South Indian breakfast culture.",
    insight: "Naturally fermented, easy to digest and relatively low in fat when cooked with less oil.",
    calories: 210,
    protein: 6,
    carbs: 34,
    fat: 6,
    healthScore: 74,
    source: "INDB",
    image:
      "https://images.unsplash.com/photo-1668236543090-82eba5eeab39?w=1200&q=75&auto=format&fit=crop",
  },
  {
    name: "Rajma Chawal",
    state: "North India",
    description:
      "Kidney beans simmered with onion-tomato masala over steamed rice — everyday comfort with solid plant protein.",
    insight: "A fibre-rich vegetarian plate that pairs complex carbs with plant protein for steady energy.",
    calories: 250,
    protein: 12,
    carbs: 42,
    fat: 5,
    healthScore: 78,
    source: "INDB",
    image:
      "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=1200&q=75&auto=format&fit=crop",
  },
  {
    name: "Idli",
    state: "South India",
    description:
      "Steamed rice cakes that are soft, low-oil, and easy to digest — a classic healthy Indian breakfast staple.",
    insight: "Steamed, not fried — naturally fermented and one of the lightest traditional Indian breakfasts.",
    calories: 60,
    protein: 2,
    carbs: 12,
    fat: 0,
    healthScore: 88,
    source: "IFCT",
    image:
      "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=1200&q=75&auto=format&fit=crop",
  },
  {
    name: "Fish Curry",
    state: "Assam / Coastal India",
    description:
      "Tangy, spice-forward fish preparations that deliver lean protein with regional character from river and coast.",
    insight: "Lean protein with regional spices — a strong choice when cooked with restrained oil.",
    calories: 180,
    protein: 22,
    carbs: 6,
    fat: 8,
    healthScore: 81,
    source: "IFCT",
    image:
      "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=1200&q=75&auto=format&fit=crop",
  },
];

export const CATEGORIES = [
  {
    id: "high-protein",
    label: "High Protein",
    query: "chicken breast",
    blurb: "Build muscle with Indian staples",
    examples: ["Chicken", "Egg", "Fish", "Paneer"],
    count: "120+",
    icon: "Dumbbell",
    accent: "from-ink-950/90 via-ink-950/55 to-rose-900/20",
    image:
      "https://images.unsplash.com/photo-1532550907401-a5327ae9f0f4?w=640&q=80&auto=format&fit=crop",
  },
  {
    id: "weight-loss",
    label: "Weight Loss",
    query: "khichdi",
    blurb: "Lighter bowls that still satisfy",
    examples: ["Khichdi", "Soup", "Salad", "Dalia"],
    count: "90+",
    icon: "Scale",
    accent: "from-ink-950/90 via-ink-950/55 to-emerald-900/25",
    image:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=640&q=80&auto=format&fit=crop",
  },
  {
    id: "high-fibre",
    label: "High Fibre",
    query: "dal",
    blurb: "Gut-friendly dals & grains",
    examples: ["Dal", "Oats", "Millet", "Sprouts"],
    count: "85+",
    icon: "Wheat",
    accent: "from-ink-950/90 via-ink-950/55 to-lime-900/20",
    image:
      "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=640&q=80&auto=format&fit=crop",
  },
  {
    id: "low-carb",
    label: "Low Carb",
    query: "paneer",
    blurb: "Fewer carbs, more flavour",
    examples: ["Paneer", "Egg", "Chicken", "Fish"],
    count: "70+",
    icon: "Leaf",
    accent: "from-ink-950/90 via-ink-950/55 to-sky-900/25",
    image:
      "https://images.unsplash.com/photo-1567188040759-fb8a4309951d?w=640&q=80&auto=format&fit=crop",
  },
  {
    id: "vegetarian",
    label: "Vegetarian",
    query: "palak paneer",
    blurb: "Classic sabzi & curries",
    examples: ["Paneer", "Dal", "Sabzi", "Curd"],
    count: "200+",
    icon: "Salad",
    accent: "from-ink-950/90 via-ink-950/55 to-amber-900/20",
    image:
      "https://images.unsplash.com/photo-1601050690117-94f5f6fa8bd0?w=640&q=80&auto=format&fit=crop",
  },
  {
    id: "vegan",
    label: "Vegan",
    query: "chole",
    blurb: "Plant-forward Indian plates",
    examples: ["Chole", "Rajma", "Tofu", "Millet"],
    count: "110+",
    icon: "Sprout",
    accent: "from-ink-950/90 via-ink-950/55 to-green-900/25",
    image:
      "https://images.unsplash.com/photo-1511690656900-d16d0e4fef6a?w=640&q=80&auto=format&fit=crop",
  },
  {
    id: "traditional",
    label: "Traditional Indian",
    query: "thali",
    blurb: "Homestyle classics",
    examples: ["Thali", "Rice", "Roti", "Curry"],
    count: "300+",
    icon: "Utensils",
    accent: "from-ink-950/90 via-ink-950/55 to-orange-900/25",
    image:
      "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=640&q=80&auto=format&fit=crop",
  },
  {
    id: "street-food",
    label: "Street Food",
    query: "samosa",
    blurb: "Know what you snack on",
    examples: ["Samosa", "Pani Puri", "Vada", "Chaat"],
    count: "60+",
    icon: "Store",
    accent: "from-ink-950/90 via-ink-950/55 to-yellow-900/20",
    image:
      "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=640&q=80&auto=format&fit=crop",
  },
  {
    id: "breakfast",
    label: "Healthy Breakfast",
    query: "idli",
    blurb: "Start light, stay fuelled",
    examples: ["Idli", "Poha", "Upma", "Oats"],
    count: "75+",
    icon: "Coffee",
    accent: "from-ink-950/90 via-ink-950/55 to-cyan-900/20",
    image:
      "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=640&q=80&auto=format&fit=crop",
  },
  {
    id: "snacks",
    label: "Healthy Snacks",
    query: "roasted chana",
    blurb: "Smarter munching",
    examples: ["Chana", "Fruit", "Nuts", "Yogurt"],
    count: "50+",
    icon: "Apple",
    accent: "from-ink-950/90 via-ink-950/55 to-stone-800/40",
    image:
      "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=640&q=80&auto=format&fit=crop",
  },
];

export const WHY_FEATURES = [
  {
    title: "Built for Indian Foods",
    body: "Designed around everyday Indian meals — not Western calorie apps with missing dishes.",
  },
  {
    title: "Official IFCT & INDB Nutrition",
    body: "Macros grounded in ICMR–NIN IFCT 2017 and the Indian Nutrient Databank.",
  },
  {
    title: "AI Food Recognition",
    body: "Photograph a dish and get identification matched to Indian nutrition data.",
  },
  {
    title: "Barcode Scanner",
    body: "Decode packaged foods and map them toward healthier Indian equivalents.",
  },
  {
    title: "Meal Tracking",
    body: "Log meals securely and watch daily calories and macros add up.",
  },
  {
    title: "Health Score",
    body: "A simple score to compare choices and spot lighter alternatives.",
  },
  {
    title: "Research-backed Intelligence",
    body: "Built as a nutrition intelligence system — accepted research at IEEE CCPIS 2025.",
  },
];

export const TRUST_BADGES = [
  "Powered by IFCT 2017",
  "Indian Nutrient Databank",
  "Open Food Facts",
  "OpenAI Vision",
  "Research-backed Nutrition",
];

export const SEARCH_PLACEHOLDERS = [
  "Search Chicken Biryani, Paneer, Masor Tenga, Idli...",
  "Try Butter Chicken, Rajma Chawal, or Poha",
  "Explore IFCT 2017 + INDB Indian databases",
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
    {
      label: "Research Publication",
      href: "https://github.com/suvamneog/foodAnalyser-v2",
    },
    {
      label: "GitHub",
      href: "https://github.com/suvamneog/foodAnalyser-v2",
    },
    { label: "Contact", href: "mailto:hello@foodanalyser.app" },
  ],
};
