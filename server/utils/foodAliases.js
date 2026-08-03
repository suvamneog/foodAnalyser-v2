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
};

function expandQuery(raw) {
  const q = String(raw || "").trim();
  if (!q) return [];
  const lower = q.toLowerCase();
  const out = new Set([q, lower]);

  if (ALIAS_MAP[lower]) out.add(ALIAS_MAP[lower]);
  if (ALIAS_MAP[q]) out.add(ALIAS_MAP[q]);

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

module.exports = { expandQuery, ALIAS_MAP };
