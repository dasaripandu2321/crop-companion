import os
import json
import requests
from dotenv import load_dotenv

# load environment variables (ensures .env is parsed)
load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY", "").strip()

# model we will call via REST
target_model = "gemini-2.0-flash"

# Template used to build the request prompt
PROMPT_TEMPLATE = """You are a senior agricultural scientist helping Indian farmers.

Crop predicted by ML model: {{crop}}

Soil & Environment Data:
Nitrogen: {{N}}
Phosphorus: {{P}}
Potassium: {{K}}
Temperature: {{temperature}} °C
Humidity: {{humidity}} %
pH: {{ph}}
Rainfall: {{rainfall}} mm

Provide detailed advisory covering:

1. Technical explanation
2. Fertilizer plan
3. Irrigation strategy
4. Pest prevention
5. Yield optimization
6. Seasonal advice
7. Market insight
8. Relevant Indian government schemes

Then provide short farmer-friendly summaries in:
English, Hindi, Tamil, Telugu, Kannada.

Return ONLY valid JSON in this structure:

{{
  "technical_explanation": "",
  "fertilizer_plan": "",
  "irrigation_strategy": "",
  "pest_prevention": "",
  "yield_optimization": "",
  "seasonal_advice": "",
  "market_insight": "",
  "government_schemes": "",
  "summaries": {{
    "english": "",
    "hindi": "",
    "tamil": "",
    "telugu": "",
    "kannada": ""
  }}
}}
Do not include extra text outside JSON.
"""


def get_mock_advisory(crop: str) -> dict:
    """Return realistic mock advisory data for testing when Gemini API is unavailable."""
    mock_data = {
        "Rice": {
            "technical_explanation": "Rice thrives in waterlogged conditions with high nitrogen. Requires 5cm standing water throughout growth. Warm temperatures (20-25°C) optimize tillering.",
            "fertilizer_plan": "60 kg/ha basal NPK (10:26:26). Top-dress 40 kg/ha urea at 4-6 weeks. Additional 30 kg/ha at flowering. Organic mulch improves retention.",
            "irrigation_strategy": "Maintain 5cm standing water during growth. Initial flooding after transplanting. Drain 1-2 weeks before harvest. Total 1000-1500mm water.",
            "pest_prevention": "Monitor stem borers, leaf folders, brown planthoppers. Use pheromone traps. Spray carbofuran 3G for borers. Encourage natural predators.",
            "yield_optimization": "Use certified HYV seeds for 15-25% boost. Proper 20x15cm spacing improves tillers. Early transplant captures longer season.",
            "seasonal_advice": "Plant June-July. Grow 120-150 days. Harvest Oct-Nov. Prepare seedbed 30-40 days ahead.",
            "market_insight": "Staple with stable demand. Store below 14% moisture. Premium basmati 30-40% higher prices. Direct retail improves margins.",
            "government_schemes": "PM-KISAN ₹6000/year. PMFBY at 2% premium. Loans at 4%. MSP ₹2050/quintal.",
            "summaries": {"english": "Rice needs waterlogged conditions and high N.", "hindi": "चावल को जलभराव और अधिक नाइट्रोजन चाहिए।", "tamil": "அரிசிக்கு நீர் மற்றும் நைட்ரஜன் தேவை.", "telugu": "వరికి నీరు మరియు నైట్రోజన్ చాలా అవసరం.", "kannada": "ಅಕ್ಕಿಗೆ ನೀರು ಮತ್ತು ನೈಟ್ರೋಜನ್ ಬೇಕು."}
        },
        "Wheat": {
            "technical_explanation": "Cool-season crop thriving at 15-20°C. Moderate rainfall 400-500mm. Well-drained soils prevent waterlogging. Needs balanced P&K.",
            "fertilizer_plan": "40 kg N, 25 kg P₂O₅, 25 kg K₂O/ha basally. Top-dress 40 kg N at tillering. Additional 20 kg N at boot stage.",
            "irrigation_strategy": "1st at CRI (50 days). 2nd at Tillering (75-80 days). 3rd at Boot (100 days). 4th at Soft Dough. Total 3-4 irrigations.",
            "pest_prevention": "Monitor Armyworm, Thrips, Jassids. Seed treatment with carbofuran. Spray pyrethroids if needed. Crop rotation reduces diseases.",
            "yield_optimization": "Use certified seed 100 kg/ha. Space 20x10cm for good stands. Timely planting avoids heat stress. Choose HYV varieties.",
            "seasonal_advice": "Sow Oct 20-Nov 20. Critical: Tillering to heading. Harvest at milk stage for test weight.",
            "market_insight": "Stable due to govt procurement. MSP ₹2150/quintal. Store at 12% moisture. Direct connections improve rates.",
            "government_schemes": "PM-KISAN ₹6000/year. PMFBY 2% premium. Subsidized seeds available. Processing units priority loans.",
            "summaries": {"english": "Wheat: Oct-Nov sowing, 15-20°C, 400-500mm rain, 4 irrigations.", "hindi": "गेहूं को 15-20°C और 400-500 मिमी बारिश चाहिए।", "tamil": "கோதுமைக்கு மிதமான மழை தேவை.", "telugu": "గోధుమకు చల్లని ఆబాహవం అవసరం.", "kannada": "ಗೋದಿಗೆ ಶೀತಕಾಲ ಅಗತ್ಯ."}
        },
        "Maize": {
            "technical_explanation": "Warm-season crop needing 21-27°C germination. Requires 60-100cm rainfall or irrigation. Deep, well-drained soils with organic matter. 100-120 day duration.",
            "fertilizer_plan": "120 kg N, 60 kg P₂O₅, 60 kg K₂O/ha. Split N: 50% basal, 25% knee-high, 25% tasseling. Micronutrients (Zn, B) improve quality.",
            "irrigation_strategy": "5-7 irrigations at 10-15 day intervals. Critical: Germination, V6, silking, grain-fill. Total 600-700mm equivalent.",
            "pest_prevention": "Monitor armyworm, shoot fly, stem borers. Scout early for buildup. Spinosad for control. Pheromone traps for borers.",
            "yield_optimization": "Use certified hybrids (DHM 117). Space 60x25cm. Timely detasseling improves fertility. Intercrop with pulse/vegetables.",
            "seasonal_advice": "Sow April-May (rainfed), June-July (irrigated). Harvest at maturity. Dry to 12% moisture for storage.",
            "market_insight": "Linked to poultry/dairy demand. Contract farming offers better prices. Process into flour/feed adds value.",
            "government_schemes": "Cereal support. Insurance available. Subsidized seeds through cooperatives.",
            "summaries": {"english": "Maize: warm season, 21-27°C, 100-120 days, hybrids best.", "hindi": "मक्का गर्मी में बोएं, 21-27°C, संकर किस्म उत्तम.", "tamil": "மக்காச்சோளம்: வெப்ப பருவம், 100-120 நாட்கள்.", "telugu": "మక్కజోలం: వేసవిలో, 100-120 రోజులు.", "kannada": "ಮೆಕ್ಕಜೋಳ: ಬೇಗೆ ಬೆಳೆಯುವ, 100-120 ದಿನ."}
        },
        "Barley": {"technical_explanation": "Cool-climate crop tolerating lower fertility. Prefers well-drained soils. Modest N (40-60 kg/ha).", "fertilizer_plan": "40-60 kg N. Ensure available P at sowing. Balanced NPK.", "irrigation_strategy": "Moderate moisture. 1-2 irrigations during critical stages. Avoid waterlogging.", "pest_prevention": "Monitor aphids, fungal diseases. Use certified seed. Crop rotation.", "yield_optimization": "Certified varieties, timely sowing, early weed control.", "seasonal_advice": "Sow cool months. Harvest before heat.", "market_insight": "Feed and malting use. Malting varieties premium.", "government_schemes": "Cereal and insurance. PMFBY.", "summaries": {"english": "Barley: cool soils, certified seed.", "hindi": "जौ: ठंडा, अच्छी निकासी।", "tamil": "கோதுமை: குளிர् நிலம्.", "telugu": "బార్లీ: చల్లని మట్టి.", "kannada": "ಜೋಳ: ಶೀತಕಾಲೀನ."}},
        "Ragi": {"technical_explanation": "Drought-tolerant finger millet on low-fertility soils. 3-4 month duration.", "fertilizer_plan": "Light N and P. Organic manures improve.", "irrigation_strategy": "Rainfed or light irrigation. Tolerant to stress.", "pest_prevention": "Monitor blast, storage pests. Timely harvest.", "yield_optimization": "Improved varieties, timely sowing.", "seasonal_advice": "Sow rainy season. Harvest 3-4 months.", "market_insight": "Growing millet health-food demand.", "government_schemes": "Millet promotion and MSP support.", "summaries": {"english": "Ragi: drought-tolerant, nutritious.", "hindi": "रागी: सूखा सहन, पोषक।", "tamil": "ராகி: உலर् நிலை.", "telugu": "రాగి: ఆరుకొండ.", "kannada": "ರಾಗಿ: ಆರೀಕರಣ."}},
        "Bajra": {"technical_explanation": "Pearl millet for arid regions and low-fertility. Short-duration hybrids.", "fertilizer_plan": "Modest N and P. Organic amendments.", "irrigation_strategy": "Rainfed. Supplemental at flowering.", "pest_prevention": "Manage borers, earheads. Timely sowing.", "yield_optimization": "Hybrids, proper spacing.", "seasonal_advice": "Sow monsoon start.", "market_insight": "Staple in drylands. Growing demand.", "government_schemes": "Millet and dryland programs.", "summaries": {"english": "Bajra: semi-arid, hybrids.", "hindi": "बाजरा: सूखा-क्षेत्र, संकर।", "tamil": "பஜ்ரா: உலர् பகுதி.", "telugu": "బజ్రా: ఆరుభూమి.", "kannada": "ಬಜ್ರಾ: ಒಣ."}},
        "Jowar": {"technical_explanation": "Sorghum: heat and drought tolerant. Broad soil range.", "fertilizer_plan": "Balanced N-P-K for grain.", "irrigation_strategy": "Rainfed mostly. 1-2 irrigations boost.", "pest_prevention": "Monitor midge, shoot fly. Hygiene.", "yield_optimization": "Hybrids, population.", "seasonal_advice": "Sow monsoon onset.", "market_insight": "Fodder and grain demand.", "government_schemes": "Dryland and insurance.", "summaries": {"english": "Jowar: drought-resilient.", "hindi": "ज्वार: सूखा सहन।", "tamil": "ஜவார்: உலर్.", "telugu": "జొవార్: ఆరుకొండ.", "kannada": "ಜೋವಾರ: ಒಣ."}},
        "Red Gram (Tur)": {"technical_explanation": "Long-duration legume improving nitrogen. Intercrop with cereals.", "fertilizer_plan": "Low N. Apply P and K.", "irrigation_strategy": "Rainfed. Moisture during pod fill.", "pest_prevention": "Helicoverpa pest. Traps, biocontrol.", "yield_optimization": "Resistant varieties, intercropping.", "seasonal_advice": "Sow after monsoon. Harvest maturity.", "market_insight": "High pulse demand. Seasonal prices.", "government_schemes": "Pulse support.", "summaries": {"english": "Tur: nitrogen-fixing.", "hindi": "तूर: नाइट्रोजन।", "tamil": "துவரம्: பலசக.", "telugu": "తుర్: నైట్రోజన్.", "kannada": "ತೂರು: ನೈಟ್ರೋಜನ್."}},
        "Green Gram (Moong)": {"technical_explanation": "Short-duration legume for light soils.", "fertilizer_plan": "Minimal N. P and K. Inoculation.", "irrigation_strategy": "Light irrigation. Avoid waterlogging.", "pest_prevention": "Monitor thrips, borers.", "yield_optimization": "Timely sowing, seed treatment.", "seasonal_advice": "Summer or post-monsoon.", "market_insight": "Popular pulse, steady demand.", "government_schemes": "Pulse promotion.", "summaries": {"english": "Moong: short-duration.", "hindi": "मूंग: कम अवधि।", "tamil": "மூங்: குறுகிய.", "telugu": "ముంగ: చిన్కాల.", "kannada": "ಮುಂಗು: ಕಡಿಮೆ."}},
        "Black Gram (Urad)": {"technical_explanation": "Warm-season pulse. Moderate irrigation.", "fertilizer_plan": "Low N, adequate P. Organic manure.", "irrigation_strategy": "Supplemental at flowering.", "pest_prevention": "Pod borers, aphids.", "yield_optimization": "Certified seeds, harvest.", "seasonal_advice": "Pre-/post-monsoon.", "market_insight": "Culinary demand, steady.", "government_schemes": "Pulse support.", "summaries": {"english": "Urad: warm-season.", "hindi": "उड़द: गर्म पलस।", "tamil": "உரதம्: உணவु.", "telugu": "ఉరద్: ఆహారం.", "kannada": "ಉರದ್: ಆಹಾರ."}},
        "Chickpea (Chana)": {"technical_explanation": "Cool growing season, well-drained soils.", "fertilizer_plan": "Moderate P and K. Minimal N.", "irrigation_strategy": "1-2 irrigations during pod fill.", "pest_prevention": "Pod borer, blight via varieties.", "yield_optimization": "Timely sowing, treatment.", "seasonal_advice": "Autumn for rabi.", "market_insight": "Protein-rich, procurement.", "government_schemes": "Pulse MSP and insurance.", "summaries": {"english": "Chana: cool season, protein.", "hindi": "चना: ठंडा, प्रोटीन।", "tamil": "சன्னா: குளிர्.", "telugu": "చనా: శీతకాలం.", "kannada": "ಚಣಾ: ಪ್ರೋಟಿನ್."}},
        "Lentil (Masoor)": {"technical_explanation": "Short-duration pulse, cool tolerant.", "fertilizer_plan": "Low N. P and K. Inoculation.", "irrigation_strategy": "Light at flowering and pod fill.", "pest_prevention": "Foliar diseases, borers.", "yield_optimization": "Early maturing varieties.", "seasonal_advice": "Rabi sowing.", "market_insight": "Pulse demand, steady.", "government_schemes": "Pulse support and insurance.", "summaries": {"english": "Masoor: rabi windows.", "hindi": "मसूर: रबी।", "tamil": "மசூர्: ராபি.", "telugu": "మసూర్: రబీ.", "kannada": "ಮಸೂರು: ರಬಿ."}},
        "Pea": {"technical_explanation": "Cool climate, good soil moisture.", "fertilizer_plan": "Low N. Balanced P and K.", "irrigation_strategy": "Regular moisture during pod set.", "pest_prevention": "Aphids, powdery mildew.", "yield_optimization": "Trellising, timely harvest.", "seasonal_advice": "Sow cool. Harvest before heat.", "market_insight": "High-value vegetable.", "government_schemes": "Horticulture subsidies.", "summaries": {"english": "Pea: cool, high-value.", "hindi": "मटर: ठंडा, मूल्यवान।", "tamil": "பயிர्: குளிར्.", "telugu": "మటర: చల్లని.", "kannada": "ವೆತ್ತೆ: ಶೀತಕಾಲ."}},
        "Groundnut": {"technical_explanation": "Sandy-loam soils, warm. N-fixing.", "fertilizer_plan": "20-40 kg N. Adequate P and K. Gypsum.", "irrigation_strategy": "Critical at pegging. 4-6 irrigations.", "pest_prevention": "Leaf miner, pod rot. Timely harvest.", "yield_optimization": "60-90 kg/ha seed. Harvest technique.", "seasonal_advice": "Warm season. Pod maturity.", "market_insight": "Oilseed markets diverse.", "government_schemes": "Oilseed support and MSP.", "summaries": {"english": "Groundnut: warm, sandy soils.", "hindi": "मूंगफली: गर्म, बलुई।", "tamil": "நிலக्கடலை: வெப्ப.", "telugu": "వేరుశెనగ: వేడి.", "kannada": "ಗುಂಡುಹುಲು: ಬೆಚ್ಚನೆ."}},
        "Mustard": {"technical_explanation": "Cool-season oilseed. Moderate soils.", "fertilizer_plan": "Moderate N and P. Sulfur improves oil.", "irrigation_strategy": "Moisture at germination, flowering.", "pest_prevention": "Aphids, white rust monitoring.", "yield_optimization": "Timely sowing, seed treatment.", "seasonal_advice": "Rabi sowing, pod maturity.", "market_insight": "Oil demand influences prices.", "government_schemes": "Oilseed programs.", "summaries": {"english": "Mustard: rabi, oil quality.", "hindi": "सरसों: रबी, तेल।", "tamil": "கடுகு: ரபी.", "telugu": "సరళ: రబీ.", "kannada": "ಸರಿಸೂಪ: ರೇವೆ."}},
        "Sunflower": {"technical_explanation": "Well-drained soils, full sun.", "fertilizer_plan": "Balanced NPK, emphasis P and K.", "irrigation_strategy": "1-2 at flowering for seed set.", "pest_prevention": "Head diseases, bird management.", "yield_optimization": "Hybrids, population.", "seasonal_advice": "Spring or post-monsoon.", "market_insight": "Edible oil demand growing.", "government_schemes": "Oilseed support and incentives.", "summaries": {"english": "Sunflower: sun, drainage, hybrids.", "hindi": "सूरजमुखी: धूप, निकासी।", "tamil": "சூரியகாந्தி: சூரியன्.", "telugu": "సూర్యకాంతి: సూర్యుడు.", "kannada": "ಸೂರ್ಯಕಾಂತಿ: ಸೂರ್ಯ."}},
        "Soybean": {"technical_explanation": "Legume N-fixing, warm season.", "fertilizer_plan": "Low N. P and K. Inoculation.", "irrigation_strategy": "Adequate moisture flowering, pod fill.", "pest_prevention": "Stem fly, pod borers.", "yield_optimization": "High-yielding varieties, timing.", "seasonal_advice": "Monsoon onset.", "market_insight": "Oil and meal uses.", "government_schemes": "Oilseed and soybean programs.", "summaries": {"english": "Soybean: nitrogen-fixing.", "hindi": "सोयाबीन: नाइट्रोजन।", "tamil": "சோயாபீன्: எண்ணெய्.", "telugu": "సోయాబీన్: నైట్రోజన്.", "kannada": "ಸಿಂಧೂರ: ನೈಟ್ರೋಜನ್."}},
        "Sesame (Til)": {"technical_explanation": "Drought-tolerant oilseed. Light soils.", "fertilizer_plan": "Low inputs. P and K doses.", "irrigation_strategy": "Rainfed. Avoid excess maturity.", "pest_prevention": "Bird pests, capsule. Netting.", "yield_optimization": "Spacing, shallow sowing.", "seasonal_advice": "Post-monsoon light soils.", "market_insight": "Niche quality sesame.", "government_schemes": "Oilseed support.", "summaries": {"english": "Sesame: drought-tolerant.", "hindi": "तिल: सूखा सहन।", "tamil": "எள्: உலर्.", "telugu": "నువ్వులు: ఆరుకొండ.", "kannada": "ಗಿಂಗೆಲ್ಲಿ: ಒಣ."}},
        "Castor": {"technical_explanation": "Hardy oilseed for marginal lands.", "fertilizer_plan": "Balanced NPK. P for roots.", "irrigation_strategy": "Drought-tolerant. Supplemental boost.", "pest_prevention": "Semilooper, storage pests.", "yield_optimization": "Spacing and seed rate.", "seasonal_advice": "Warm. Brown capsules.", "market_insight": "Industrial oil demand.", "government_schemes": "Industrial incentives.", "summaries": {"english": "Castor: hardy, marginál.", "hindi": "अरंडी: कठोर।", "tamil": "ஆமணக్କु: விளிম్ப.", "telugu": "ఆనవాలు: సరిహద్ద.", "kannada": "ಎರಡೋ: ಸೀಮಾಂತ."}},
        "Coconut": {"technical_explanation": "Tropical coastal humid climates.", "fertilizer_plan": "Regular NPK and micronutrients.", "irrigation_strategy": "Frequent dry spells.", "pest_prevention": "Leaf caterpillars, beetles.", "yield_optimization": "Spacing, intercropping.", "seasonal_advice": "Rainy season establish.", "market_insight": "Copra and water demand.", "government_schemes": "Horticulture subsidies.", "summaries": {"english": "Coconut: tropical, humid.", "hindi": "नारियल: उष्णकटिबंधीय।", "tamil": "தென்னை: வெப्ப।", "telugu": "కొబ్బరి: ఉష్ణ.", "kannada": "ತೆಂಗಿನ ಮರ: ಉಷ್ಣ."}},
        "Cotton": {"technical_explanation": "Warm-season fiber. Moderate water.", "fertilizer_plan": "100 kg N, 50 kg P and K. Split.", "irrigation_strategy": "4-6 irrigations. Flowering to boll.", "pest_prevention": "Bollworm, jassids. IPM.", "yield_optimization": "60x45cm. Pruning.", "seasonal_advice": "Monsoon sow. Dec-Jan harvest.", "market_insight": "Fiber demand, mills.", "government_schemes": "Fiber support.", "summaries": {"english": "Cotton: warm, fiber, IPM.", "hindi": "कपास: गर्म, फाइबर।", "tamil": "பருத्தி: வெப्ப.", "telugu": "పత్తి: వెచ్చ.", "kannada": "ಹತ್ತಿ: ಬೆಚ್ಚನೆ."}},
        "Sugarcane": {"technical_explanation": "Long-duration, rich soils, water.", "fertilizer_plan": "High N. Balanced P and K. Split.", "irrigation_strategy": "Frequent. Drip efficient.", "pest_prevention": "Borers, virus. Certified setts.", "yield_optimization": "Varieties, harvest cycles.", "seasonal_advice": "Monsoon or spring plant.", "market_insight": "Cash crop mill demand.", "government_schemes": "Pricing support.", "summaries": {"english": "Sugarcane: water-intensive, long.", "hindi": "गन्ना: जल-गहन।", "tamil": "கரும्बு: நீர् நిபंধन.", "telugu": "చెరకు: నీటి.", "kannada": "ಕಬ್ಬಿನ: ನೀರು."}},
        "Jute": {"technical_explanation": "Warm humid alluvial soils fiber.", "fertilizer_plan": "Balanced NPK timely supply.", "irrigation_strategy": "Moist growth. Avoid waterlog.", "pest_prevention": "Stem rot, bollworms.", "yield_optimization": "Early sow, retting.", "seasonal_advice": "Monsoon window.", "market_insight": "Packaging, textiles.", "government_schemes": "Promotion and MSP.", "summaries": {"english": "Jute: warm, humid.", "hindi": "पटसन: गर्म, नम।", "tamil": "சணல्: வெப்ப.", "telugu": "సన: ఆర్ద్ర.", "kannada": "ಸೆಣೆ: ನಾರಿನ."}},
        "Tea": {"technical_explanation": "High rainfall, acidic soils, shaded.", "fertilizer_plan": "NPK micronutrients, mulch.", "irrigation_strategy": "Regular moisture rainfall, shade.", "pest_prevention": "Mites, nematodes, pruning.", "yield_optimization": "Plucking, bush management.", "seasonal_advice": "Year-round cycles.", "market_insight": "Quality export premiums.", "government_schemes": "Tea board support.", "summaries": {"english": "Tea: rainfall, acidic, pluck.", "hindi": "चाय: वर्षा, अम्लीय।", "tamil": "தேயிலை: மழை.", "telugu": "టీ: వర్షం.", "kannada": "ಚಹಾ: ಮಳೆ."}},
        "Coffee": {"technical_explanation": "Shaded hilly humid tropics.", "fertilizer_plan": "Balanced organic-rich.", "irrigation_strategy": "Dry spells, shade trees.", "pest_prevention": "Berry borer, rust integrated.", "yield_optimization": "Pruning, shade quality.", "seasonal_advice": "Region varies, post-harvest.", "market_insight": "Specialty export prices.", "government_schemes": "Coffee board help.", "summaries": {"english": "Coffee: shaded, hills, specialty.", "hindi": "कॉफी: छायादार, विशेष।", "tamil": "கொக్కோ: நிழல्.", "telugu": "కాఫీ: నీడ.", "kannada": "ಕಾಫಿ: ನೆರಳು."}},
        "Rubber": {"technical_explanation": "Humid tropics distributed rain.", "fertilizer_plan": "NPK micronutrient tapping.", "irrigation_strategy": "Dry months latex.", "pest_prevention": "Root disease sanitation.", "yield_optimization": "Cycles, clones.", "seasonal_advice": "Humid zones, shade.", "market_insight": "Global latex prices.", "government_schemes": "Rubber board help.", "summaries": {"english": "Rubber: humid, tapping.", "hindi": "रबर: आर्द्र, दोहन।", "tamil": "ரப்பர्: ஈரம्.", "telugu": "రబ్బర్: ఆర్ద్ర.", "kannada": "ರಬ್ಬರ್: ತೇವ."}},
        "Tobacco": {"technical_explanation": "High-value, fertile, curing.", "fertilizer_plan": "Balanced NPK leaf quality.", "irrigation_strategy": "Regular avoid excess.", "pest_prevention": "Aphids, fungal, cure price.", "yield_optimization": "Variety, post-harvest cure.", "seasonal_advice": "Warm, prompt cure.", "market_insight": "Industry driven.", "government_schemes": "Contract farming.", "summaries": {"english": "Tobacco: high-value, cure.", "hindi": "तंबाकू: मूल्यवान।", "tamil": "புகையिலை: விலை.", "telugu": "పొగాకు: ఎత్తు.", "kannada": "ಧೂಮಪಾನ: ಮೌಲ್ಯ."}},
        "Mango": {"technical_explanation": "Tropical/subtropical, drained.", "fertilizer_plan": "Balanced NPK micronutrients.", "irrigation_strategy": "Frequent fruit set.", "pest_prevention": "Flies, mildew, traps.", "yield_optimization": "Prune, thin.", "seasonal_advice": "Full maturity.", "market_insight": "High-value export.", "government_schemes": "Horticulture, mango.", "summaries": {"english": "Mango: warm, premium.", "hindi": "आम: गर्म, प्रीमियम।", "tamil": "மாம्பழம्: வெப్ப.", "telugu": "మామిడి: ఎత్తు.", "kannada": "ಮಾವಿನ: ಬೆಚ್ಚನೆ."}},
        "Banana": {"technical_explanation": "Warm humid rich moisture.", "fertilizer_plan": "High K quality, N and P.", "irrigation_strategy": "Frequent, mulch.", "pest_prevention": "Nematodes, Sigatoka tissue.", "yield_optimization": "Suckers, spacing.", "seasonal_advice": "Year-round tropics.", "market_insight": "Demand, perishable, cold.", "government_schemes": "Horticulture.", "summaries": {"english": "Banana: warm, humid, K.", "hindi": "केला: गर्म, नम।", "tamil": "வாழைப్పழம्: వేడి.", "telugu": "అరటి: వెచ್చ.", "kannada": "ಬಾಳೆ: ಬೆಚ್ಚನೆ."}},
        "Apple": {"technical_explanation": "Temperate chill hours drained.", "fertilizer_plan": "Balanced NPK micronutrients.", "irrigation_strategy": "Regular fruit stress.", "pest_prevention": "Moth, scab, frost.", "yield_optimization": "Prune, train, thin.", "seasonal_advice": "Temperate hills.", "market_insight": "Premium cold-chain.", "government_schemes": "Horticulture.", "summaries": {"english": "Apple: temperate, chill, premium.", "hindi": "सेब: शीतल, विशेष।", "tamil": "ஆப्பிள्: குளிர्।", "telugu": "ఆపిల్: చల్లని.", "kannada": "ಸೇಬೆ: ಶೀತರ."}},
        "Orange": {"technical_explanation": "Subtropical drained balanced.", "fertilizer_plan": "NPK micronutrients improve.", "irrigation_strategy": "Regular waterlog avoid.", "pest_prevention": "Greening, aphids.", "yield_optimization": "Graft, variety.", "seasonal_advice": "Region varies.", "market_insight": "Fresh juice demand.", "government_schemes": "Citrus.", "summaries": {"english": "Orange: subtropical, fruit.", "hindi": "संतरा: उप-उष्णकटिबंधीय।", "tamil": "ஆரஞ्ज: பழம।", "telugu": "నారింజ: ఫಲ.", "kannada": "ಕಿತ್ತಳೆ: ಸಿಟ್ರಸ್."}},
        "Grapes": {"technical_explanation": "Drained warm cool nights.", "fertilizer_plan": "Balanced foliar micronutrients.", "irrigation_strategy": "Drip berry develop.", "pest_prevention": "Mildew, flies.", "yield_optimization": "Trellis, canopy.", "seasonal_advice": "Table wine vary.", "market_insight": "High-value wines.", "government_schemes": "Horticulture.", "summaries": {"english": "Grapes: warm, cool, trellis.", "hindi": "अंगूर: गर्म, ठंड।", "tamil": "திராட்சை: अंगूर.", "telugu": "ద్రాక్ష: ఉష్ణ.", "kannada": "ದ್ರಾಕ್ಷಿ: ಶಾಖ."}},
        "Papaya": {"technical_explanation": "Tropical fast-yielding warm.", "fertilizer_plan": "High N and K fruiting.", "irrigation_strategy": "Regular waterlog avoid.", "pest_prevention": "Flies, ring spot.", "yield_optimization": "Hybrids, harvest.", "seasonal_advice": "Avoid frost.", "market_insight": "Early, fresh local.", "government_schemes": "Horticulture.", "summaries": {"english": "Papaya: tropical, fast.", "hindi": "पपीता: उष्णकटिबंधीय।", "tamil": "பப்பாளி: வெப్ப.", "telugu": "పపాయా: బాలక.", "kannada": "ಪಪ್ಪಾಯ: ಬೇಗೆ."}},
        "Guava": {"technical_explanation": "Adaptable tropical range.", "fertilizer_plan": "Balanced organic taste.", "irrigation_strategy": "Moisture fruit.", "pest_prevention": "Flies, wilt.", "yield_optimization": "Prune, harvest.", "seasonal_advice": "Multiple harvests.", "market_insight": "Fresh process.", "government_schemes": "Horticulture.", "summaries": {"english": "Guava: adaptable, harvests.", "hindi": "अमरूद: बहुध।", "tamil": "கொய்யா: பல्வेறு.", "telugu": "గువ: బహుళ.", "kannada": "ಪೆರೆಕ್ಕ: ಬಹುಳ."}},
        "Tomato": {"technical_explanation": "High-value fertile frequent.", "fertilizer_plan": "Balanced calcium prevent.", "irrigation_strategy": "Regular drip.", "pest_prevention": "Borer, blight, varieties.", "yield_optimization": "Hybrids, stake, harvest.", "seasonal_advice": "Spring autumn.", "market_insight": "Perishable timing.", "government_schemes": "Horticulture.", "summaries": {"english": "Tomato: fertile, water, calcium.", "hindi": "टमाटर: उपजाऊ, जल।", "tamil": "தக्காளி: సमृద्ध.", "telugu": "టమోటో: సారవంతమైన.", "kannada": "ಟೊಮೆಟೊ: ಸಮೃದ್ಧ."}},
        "Potato": {"technical_explanation": "Cool drained fertile.", "fertilizer_plan": "High N and K tubers.", "irrigation_strategy": "Frequent hilling.", "pest_prevention": "Blight, pests, certified.", "yield_optimization": "Tubers, timely.", "seasonal_advice": "Cool maturity.", "market_insight": "Staple, process value.", "government_schemes": "Seed, cold-chain.", "summaries": {"english": "Potato: cool, drained.", "hindi": "आलू: ठंडा, जल।", "tamil": "உருளைக்கிழங्: குளிร.|", "telugu": "బంగాళాదుమ్మ: చల్లని.", "kannada": "ಆಲೂ: ಕೋಮಲ."}},
        "Onion": {"technical_explanation": "Well-drained moderate bulb.", "fertilizer_plan": "Adequate P and K split.", "irrigation_strategy": "Regular bulb reduce.", "pest_prevention": "Thrips, rot essential.", "yield_optimization": "Sets, cure store.", "seasonal_advice": "Rabi kharif variety.", "market_insight": "Volatile storage value.", "government_schemes": "Storage, cold-chain.", "summaries": {"english": "Onion: drained, balanced, store.", "hindi": "प्याज: निकासी, भंडार।", "tamil": "வெங்காயம्: பதिவு.", "telugu": "ఉల్లి: నిల్వ.", "kannada": "ನೀರುಳ್ಳಿ: ಸಂಗ್ರಹ."}},
        "Brinjal": {"technical_explanation": "Warm fertile fruit vegetable.", "fertilizer_plan": "Balanced organic set.", "irrigation_strategy": "Regular mulch.", "pest_prevention": "Shoot borer, biocontrol.", "yield_optimization": "Stake, prune.", "seasonal_advice": "Warm multiple.", "market_insight": "Vegetable quality premium.", "government_schemes": "Horticulture.", "summaries": {"english": "Brinjal: warm, stake.", "hindi": "बैंगन: गर्म, उपजाऊ।", "tamil": "கத्திരிక्काய: வெப్ப.", "telugu": "వంకాయ: ఉష్ణ.", "kannada": "ಬದನೇಕಾಯ: ಬೆಚ್ಚನೆ."}},
        "Cabbage": {"technical_explanation": "Cool fertile head formation.", "fertilizer_plan": "Balanced organic matter.", "irrigation_strategy": "Consistent uniform.", "pest_prevention": "Butterfly, aphids.", "yield_optimization": "Transplant, spacing.", "seasonal_advice": "Cool seasons.", "market_insight": "Fresh process.", "government_schemes": "Horticulture.", "summaries": {"english": "Cabbage: cool, heads, transplant.", "hindi": "बंदगोभी: ठंडा, कसा।", "tamil": "முட்டைக०ோస್: குளिร्.", "telugu": "క్యాబేజ్: చల్లని.", "kannada": "ಕೋಸು: ಶೀತಕಾಲ."}},
        "Cauliflower": {"technical_explanation": "Cool balanced curd.", "fertilizer_plan": "Balanced NPK timely.", "irrigation_strategy": "Regular moisture defects.", "pest_prevention": "Cabbage pests.", "yield_optimization": "Transplant, blanch.", "seasonal_advice": "Cool windows.", "market_insight": "Perishable quality.", "government_schemes": "Horticulture.", "summaries": {"english": "Cauliflower: cool, curd, blanch.", "hindi": "फूलगोभी: ठंडा, फूल।", "tamil": "பூக்கோஸ्: குளிர्.", "telugu": "కాలిఫ్లవర్: చల్లని.", "kannada": "ಕೌಲಿಫ್ಲೊವರ್: ಶೀತಕಾಲ."}},
        "Carrot": {"technical_explanation": "Loose deep cool root.", "fertilizer_plan": "Moderate N and K.", "irrigation_strategy": "Even moisture straight.", "pest_prevention": "Nematode, fly.", "yield_optimization": "Seedbed, thin.", "seasonal_advice": "Cool sweet color.", "market_insight": "Fresh process.", "government_schemes": "Horticulture.", "summaries": {"english": "Carrot: loose, sweet.", "hindi": "गाजर: ढीली, मिठाई।", "tamil": "கேரட्: msoft.", "telugu": "క్యారట్: సడలు.", "kannada": "ಕ್ಯಾರೆಟ್: ಸುವಾಸನೆ."}},
        "Radish": {"technical_explanation": "Quick-growing cool.", "fertilizer_plan": "Light N roots.", "irrigation_strategy": "Even moisture, crisp.", "pest_prevention": "Vegetable pests.", "yield_optimization": "Cycles.", "seasonal_advice": "Cool windows.", "market_insight": "Turnover demand.", "government_schemes": "Horticulture.", "summaries": {"english": "Radish: quick, cool.", "hindi": "मूली: जल्दी, ठंडा।", "tamil": "முள्ளங்கி: விரைவு.", "telugu": "రేటిష్: శీఘ్ర.", "kannada": "ಮೂಲಂಗಿ: ಬೇಗೆ."}},
        "Spinach": {"technical_explanation": "Fast leafy nutrient.", "fertilizer_plan": "N-rich leaves.", "irrigation_strategy": "Regular tender.", "pest_prevention": "Miners, mildew.", "yield_optimization": "Harvest.", "seasonal_advice": "Cool seasons.", "market_insight": "High-value vegetable.", "government_schemes": "Nutrition.", "summaries": {"english": "Spinach: fast, nutrient.", "hindi": "पालक: जल्दी, पोषक।", "tamil": "கீरை: விரைவு.", "telugu": "పాలక్: శీఘ్ర.", "kannada": "ಪಾಲ್ಯ: ಬೇಗೆ."}},
        "Coriander": {"technical_explanation": "Quick herb cool moist.", "fertilizer_plan": "Moderate N organic.", "irrigation_strategy": "Moist leaf.", "pest_prevention": "Miners, aphids.", "yield_optimization": "Succession.", "seasonal_advice": "Leaves early, seeds.", "market_insight": "Fresh seed demand.", "government_schemes": "Herb.", "summaries": {"english": "Coriander: herb, succession.", "hindi": "धनिया: सुगंधित, अनुक्रम।", "tamil": "கொத்తமல्लि: வாசனை.", "telugu": "కొత్తిమీర: సువాసన.", "kannada": "ಕೊತ್ತಂಬರಿ: ಕಲ್ಪ."}},
        "Chilli": {"technical_explanation": "Warm nutrition heat.", "fertilizer_plan": "Balanced NPK K.", "irrigation_strategy": "Regular waterlog avoid.", "pest_prevention": "Thrips, borers, soils.", "yield_optimization": "Stake, prune.", "seasonal_advice": "Warm windows.", "market_insight": "Spice fresh markets.", "government_schemes": "Spice board, horticulture.", "summaries": {"english": "Chilli: warm, spicy.", "hindi": "मिर्च: गर्म, मसालेदार।", "tamil": "மிளகாய्: చేదు.", "telugu": "మిరపకాయ: తీక్షణమైన.", "kannada": "ಮೆಣಸಿನಕಾಯಿ: ಕೂಟ."}},
        "Turmeric": {"technical_explanation": "Tropical rhizome warm humid.", "fertilizer_plan": "Organic balanced NPK.", "irrigation_strategy": "Regular reduce.", "pest_prevention": "Rot, treatment.", "yield_optimization": "Certified, spacing.", "seasonal_advice": "Monsoon plant.", "market_insight": "Spice medicinal demand.", "government_schemes": "Spice board.", "summaries": {"english": "Turmeric: tropical, medicinal.", "hindi": "हल्दी: उष्णकटिबंधीय, औषधि।", "tamil": "மஞ்சள்: மூलிகை.", "telugu": "పసుపు: ఔషధ.", "kannada": "ಆರತೆ: ಔಷಧ."}},
        "Ginger": {"technical_explanation": "Humid shaded organic.", "fertilizer_plan": "High organic balanced.", "irrigation_strategy": "Regular drainage.", "pest_prevention": "Rot, nematodes.", "yield_optimization": "Certified, raised.", "seasonal_advice": "Plant harvest 8-10.", "market_insight": "Spice medicinal.", "government_schemes": "Spice board.", "summaries": {"english": "Ginger: humid, organic, medicinal.", "hindi": "अदरक: आर्द्र, भिन्न।", "tamil": "இஞ్జी: ஈரமான।", "telugu": "అల్లం: ఆర్ద్ర.", "kannada": "ಅದರಕೆ: ತೇವ."}}
    }
    return mock_data.get(crop, mock_data["Rice"])


def generate_crop_advisory(crop: str, input_data: dict, timeout_sec: float = 15.0) -> dict:
    """Call Gemini API for crop advisory; fallback to mock on any error."""
    if not API_KEY:
        print(f"[FALLBACK] No API key configured. Returning mock advisory for {crop}.")
        return get_mock_advisory(crop)
    
    try:
        print(f"[DEBUG] Generating advisory for {crop} via REST API")
        
        # Build payload
        payload = {
            "contents": [{
                "parts": [{
                    "text": PROMPT_TEMPLATE.format(
                        crop=crop,
                        N=input_data.get("nitrogen", 25),
                        P=input_data.get("phosphorus", 20),
                        K=input_data.get("potassium", 20),
                        temperature=input_data.get("temperature", 25),
                        humidity=input_data.get("humidity", 60),
                        ph=input_data.get("ph", 6.5),
                        rainfall=input_data.get("rainfall", 750)
                    )
                }]
            }],
            "generationConfig": {
                "temperature": 0.7,
                "topP": 0.95,
                "topK": 50,
                "maxOutputTokens": 2048
            }
        }
        
        # Call Gemini REST endpoint
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{target_model}:generateContent?key={API_KEY}"
        r = requests.post(url, json=payload, headers={"Content-Type": "application/json"}, timeout=timeout_sec)
        r.raise_for_status()
        
        # Extract text response
        response_text = r.json().get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "")
        
        if not response_text:
            print(f"[FALLBACK] Empty Gemini response. Returning mock advisory.")
            return get_mock_advisory(crop)
        
        # Try to parse JSON
        text = response_text.strip()
        if text.startswith("```"):
            lines = text.split("\n")
            text = "\n".join([l for l in lines if not l.startswith("```")])
        
        advisory = json.loads(text)
        print(f"[SUCCESS] Gemini advisory for {crop} received.")
        return advisory
        
    except json.JSONDecodeError as je:
        print(f"[FALLBACK] JSON parse error: {je}. Returning mock advisory.")
        return get_mock_advisory(crop)
    except Exception as exc:
        print(f"[FALLBACK] Gemini API error: {exc}. Returning mock advisory.")
        return get_mock_advisory(crop)


def chat_response(message: str, timeout_sec: float = 15.0) -> dict:
    """Chat endpoint; fallback to friendly message on error."""
    if not API_KEY:
        return {
            "reply": "I'm in offline mode. For farming questions, please contact your local agricultural extension officer or cooperative."
        }
    
    try:
        payload = {
            "contents": [{
                "parts": [{
                    "text": f"You are a helpful farming advisor. Answer this question concisely: {message}"
                }]
            }],
            "generationConfig": {
                "temperature": 0.7,
                "maxOutputTokens": 512
            }
        }
        
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{target_model}:generateContent?key={API_KEY}"
        r = requests.post(url, json=payload, headers={"Content-Type": "application/json"}, timeout=timeout_sec)
        r.raise_for_status()
        text = r.json().get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "")
        return {"reply": text}
    except Exception as exc:
        print(f"[FALLBACK] Chat API error: {exc}")
        return {
            "reply": f"I'm currently in offline mode. However, for '{message}': This is a farming reference system. For detailed Q&A, please contact your local agricultural officer or cooperative. General farming best practices include timely irrigation, balanced fertilization, pest monitoring, and soil health maintenance."
        }
