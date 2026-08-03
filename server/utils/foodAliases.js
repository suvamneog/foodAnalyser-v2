/**
 * Multilingual / regional aliases → English search terms for IFCT/INDB.
 * Improves search recall only — does NOT claim verified nutrition.
 */

const ALIAS_MAP = {
  // Hindi (Devanagari)
  "रोटी": "roti",
  "चावल": "rice",
  "दाल": "dal",
  "दही": "curd",
  "पनीर": "paneer",
  "पराठा": "paratha",
  "आलू": "potato",
  "आलू पराठा": "aloo paratha",
  "छोले": "chole",
  "राजमा": "rajma",
  "खिचड़ी": "khichdi",
  "पूरी": "puri",
  "समोसा": "samosa",
  "इडली": "idli",
  "डोसा": "dosa",
  "पोहा": "poha",
  "उपमा": "upma",
  "चिकन": "chicken",
  "अंडा": "egg",
  "दूध": "milk",
  "घी": "ghee",
  "तेल": "oil",
  "सब्जी": "sabzi",
  "भात": "rice",
  "लस्सी": "lassi",
  "नान": "naan",

  // Assamese
  "ভাত": "rice",
  "মাছ": "fish",
  "ডাল": "dal",
  "কুকুৰা": "chicken",
  "চাউল": "rice",

  // Bengali
  "রুটি": "roti",
  "লুচি": "luchi",
  "ইলিশ": "hilsa",
  "মুরগি": "chicken",
  "দুধ": "milk",
  "দই": "curd",

  // Tamil
  "சாதம்": "rice",
  "இட்லி": "idli",
  "தோசை": "dosa",
  "சாம்பார்": "sambar",
  "ரசம்": "rasam",
  "பருப்பு": "dal",
  "முட்டை": "egg",
  "பால்": "milk",
  "தயிர்": "curd",
  "சிக்கன்": "chicken",

  // Telugu
  "అన్నం": "rice",
  "ఇడ్లీ": "idli",
  "దోస": "dosa",
  "సాంబార్": "sambar",
  "పప్పు": "dal",

  // Kannada
  "ಅನ್ನ": "rice",
  "ಇಡ್ಲಿ": "idli",
  "ದೋಸೆ": "dosa",
  "ಸಾಂಬಾರ್": "sambar",

  // Malayalam
  "ചോറ്": "rice",
  "ഇഡ്ഡലി": "idli",
  "ദോശ": "dosa",
  "സാമ്പാർ": "sambar",
  "പപ്പടം": "papad",

  // Punjabi (Gurmukhi)
  "ਰੋਟੀ": "roti",
  "ਦਾਲ": "dal",
  "ਚੌਲ": "rice",
  "ਪਨੀਰ": "paneer",
  "ਲੱਸੀ": "lassi",

  // Gujarati
  "રોટલી": "roti",
  "દાળ": "dal",
  "ભાત": "rice",
  "થેપલા": "thepla",
  "ઢોકળા": "dhokla",

  // Marathi
  "भाकरी": "bhakri",
  "वरण": "dal",
  "पोळी": "roti",
  "पोहे": "poha",

  // Latin transliterations / common misspellings
  chapati: "chapatti",
  chappati: "chapatti",
  "alu paratha": "aloo paratha",
  yoghurt: "curd",
  yogurt: "curd",
  dahi: "curd",
  chawal: "rice",
  daal: "dal",
  dhal: "dal",
  sabji: "sabzi",
  "plain dosa": "dosa",
  // Chickpea family — dataset uses "channa"
  chana: "channa",
  chole: "channa",
  channa: "channa",
  chickpea: "channa",
  chickpeas: "channa",
  kabuli: "kabuli channa",
  garbanzo: "channa",
  // Paneer / roti / other spelling variants
  panner: "paneer",
  panir: "paneer",
  rotti: "roti",
  roti: "roti",
  puri: "puri",
  poori: "puri",
  poha: "poha",
  pohe: "poha",
  aloo: "aloo",
  alu: "aloo",
  potato: "aloo",
  ghee: "ghee",
  tofu: "tofu",
  // Common cooked-dish synonyms
  gravy: "curry",
  sabzi: "sabzi",
  sabji: "sabzi",
  bhaji: "sabzi",
  sabjee: "sabzi",
  biriyani: "biryani",
  briyani: "biryani",
  masaala: "masala",
  massala: "masala",
  chiken: "chicken",
  chikn: "chicken",
  murgh: "chicken",
  murga: "chicken",
  mutton: "mutton",
  keema: "keema",
  kheema: "keema",
  paratha: "paratha",
  parantha: "paratha",
  parotta: "paratha",
  parota: "paratha",
  kadhai: "kadhai",
  karahi: "kadhai",
  saag: "saag",
  palak: "palak",
  spinach: "palak",
  rajma: "rajmah",
  rajmah: "rajmah",
  rogan: "roghan",
  roghan: "roghan",
};

/**
 * Multi-word dish phrases → INDB/IFCT-friendly search terms.
 * Improves recall when users type popular restaurant names.
 */
const PHRASE_ALIASES = {
  "butter chicken": ["butter chicken"],
  "chicken butter masala": ["butter chicken"],
  "murgh makhani": ["butter chicken"],
  "chicken biryani": ["chicken pulao", "mutton biryani", "vegetable biryani"],
  "chicken biriyani": ["chicken pulao", "mutton biryani", "vegetable biryani"],
  "masala dosa": ["masala dosa"],
  "rajma chawal": ["rajmah curry", "kidney bean curry"],
  "rajma rice": ["rajmah curry"],
  "paneer butter masala": ["paneer in butter sauce", "shahi paneer"],
  "butter paneer": ["paneer in butter sauce"],
  "paneer makhani": ["paneer in butter sauce"],
  "chole bhature": ["kabuli channa curry", "bhatura", "chickpeas curry"],
  "chole bhatura": ["kabuli channa curry", "bhatura"],
  "channa bhatura": ["kabuli channa curry", "bhatura"],
  "pav bhaji": ["pav bhaji"],
  "rogan josh": ["roghan josh"],
  "roghan josh": ["roghan josh"],
  "palak paneer": ["spinach paneer", "palak paneer"],
  "fish curry": ["fish curry", "machli curry"],
  "chicken breast": ["chicken, poultry, breast"],
  "boiled egg": ["boiled egg"],
  "plain dosa": ["plain dosa"],
  // Assamese regional dishes → research recipe names
  "masor tenga": ["rou masar tenga", "masar tenga", "tenga"],
  "masar tenga": ["rou masar tenga", "masor tenga"],
  "aloo pitika": ["aloo pitika", "alu pitika", "pitika"],
  "alu pitika": ["aloo pitika", "pitika"],
  khorisa: ["khorisa", "bamboo shoot pickle"],
  "lai xaak": ["lai sak bhaji", "lai xaak"],
  "narikol pitha": ["narikol pitha", "coconut pitha"],
  "til pitha": ["til pitha"],
  "assamese thali": ["assamese thali", "axomiya thali"],
  // Manipur / Meghalaya / Nagaland
  hawaijar: ["hawaijar", "manipur fermented soybean"],
  ngari: ["ngari", "manipur fermented fish"],
  hentak: ["hentak", "hentaak"],
  soibum: ["soibum", "fermented bamboo manipur"],
  soidon: ["soidon"],
  tungrymbai: ["tungrymbai", "khasi fermented soybean"],
  tungtap: ["tungtap"],
  lungsiej: ["lungsiej"],
  sohiong: ["sohiong", "prunus nepalensis"],
  hungrii: ["hungrii"],
  anishi: ["anishi"],
  rhujuk: ["rhujuk", "bastanga", "bastenga"],
  bastanga: ["rhujuk", "bastanga"],
  tsutuocie: ["tsutuocie"],
};

function expandQuery(raw) {
  const q = String(raw || "").trim();
  if (!q) return [];
  const lower = q.toLowerCase().replace(/\s+/g, " ");
  const out = new Set([q, lower]);

  if (ALIAS_MAP[lower]) out.add(ALIAS_MAP[lower]);
  if (ALIAS_MAP[q]) out.add(ALIAS_MAP[q]);

  // Phrase-level expansions (longest match first)
  const phrases = Object.keys(PHRASE_ALIASES).sort((a, b) => b.length - a.length);
  for (const phrase of phrases) {
    if (lower === phrase || lower.includes(phrase)) {
      for (const alt of PHRASE_ALIASES[phrase]) out.add(alt);
      break;
    }
  }

  const tokens = lower.split(/[\s,]+/).filter(Boolean);
  let anyTokenAlias = false;
  const substituted = tokens.map((t) => {
    if (ALIAS_MAP[t]) {
      anyTokenAlias = true;
      out.add(ALIAS_MAP[t]);
      return ALIAS_MAP[t];
    }
    return t;
  });
  // Emit a full phrase with each token's alias substituted (e.g.
  // "chana masala" → "channa masala"). Keeps multi-word queries useful
  // when only one token needs a transliteration fix.
  if (anyTokenAlias && substituted.length > 1) {
    out.add(substituted.join(" "));
  }

  return Array.from(out);
}

module.exports = { expandQuery, ALIAS_MAP, PHRASE_ALIASES };
