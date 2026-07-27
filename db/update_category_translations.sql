-- ============================================================
-- UPDATE: Populate title_translations for all 32 categories
-- Run this in Neon SQL Editor
-- ============================================================

-- Level 1: Categories (id 1-5)
UPDATE categories SET title_translations = '{"en": "Construction", "hi": "निर्माण", "ta": "கட்டிடம்"}' WHERE id = 1;
UPDATE categories SET title_translations = '{"en": "Technology", "hi": "प्रौद्योगिकी", "ta": "தொழில்நுட்பம்"}' WHERE id = 2;
UPDATE categories SET title_translations = '{"en": "Healthcare", "hi": "स्वास्थ्य सेवा", "ta": "சுகாதாரம்"}' WHERE id = 3;
UPDATE categories SET title_translations = '{"en": "Hospitality", "hi": "आतिथ्य", "ta": "விருந்தோம்பல்"}' WHERE id = 4;
UPDATE categories SET title_translations = '{"en": "Beauty & Salon", "hi": "सौंदर्य और सैलून", "ta": "அழகு மற்றும் சலூன்"}' WHERE id = 5;

-- Level 2: Subcategories (id 6-12)
UPDATE categories SET title_translations = '{"en": "Civil Works", "hi": "सिविल कार्य", "ta": "சிவில் பணிகள்"}' WHERE id = 6;
UPDATE categories SET title_translations = '{"en": "Electrical Works", "hi": "बिजली का काम", "ta": "மின் பணிகள்"}' WHERE id = 7;
UPDATE categories SET title_translations = '{"en": "Software Development", "hi": "सॉफ्टवेयर विकास", "ta": "மென்பொருள் உருவாக்கம்"}' WHERE id = 8;
UPDATE categories SET title_translations = '{"en": "IT Support", "hi": "आईटी सहायता", "ta": "ஐடி ஆதரவு"}' WHERE id = 9;
UPDATE categories SET title_translations = '{"en": "Nursing", "hi": "नर्सिंग", "ta": "செவிலியல்"}' WHERE id = 10;
UPDATE categories SET title_translations = '{"en": "Restaurant", "hi": "रेस्तरां", "ta": "உணவகம்"}' WHERE id = 11;
UPDATE categories SET title_translations = '{"en": "Hair Services", "hi": "बाल सेवाएं", "ta": "முடி சேவைகள்"}' WHERE id = 12;

-- Level 3: Job Roles (id 13-32)
-- Under Civil Works (parent 6)
UPDATE categories SET title_translations = '{"en": "Mason", "hi": "मिस्त्री", "ta": "தச்சு"}' WHERE id = 13;
UPDATE categories SET title_translations = '{"en": "Carpenter", "hi": "बढ़ई", "ta": "மரவேலை"}' WHERE id = 14;
UPDATE categories SET title_translations = '{"en": "Painter", "hi": "पेंटर", "ta": "ஓவியர்"}' WHERE id = 15;

-- Under Electrical Works (parent 7)
UPDATE categories SET title_translations = '{"en": "Electrician", "hi": "इलेक्ट्रीशियन", "ta": "மின்சார தொழிலாளர்"}' WHERE id = 16;
UPDATE categories SET title_translations = '{"en": "Wireman", "hi": "वायरमैन", "ta": "வயர்மேன்"}' WHERE id = 17;

-- Under Software Development (parent 8)
UPDATE categories SET title_translations = '{"en": "Frontend Developer", "hi": "फ्रंटएंड डेवलपर", "ta": "முன்பக்க டெவலப்பர்"}' WHERE id = 18;
UPDATE categories SET title_translations = '{"en": "Backend Developer", "hi": "बैकएंड डेवलपर", "ta": "பின்பக்க டெவலப்பர்"}' WHERE id = 19;
UPDATE categories SET title_translations = '{"en": "Full Stack Developer", "hi": "फुल स्टैक डेवलपर", "ta": "முழு ஸ்டாக் டெவலப்பர்"}' WHERE id = 20;
UPDATE categories SET title_translations = '{"en": "React Developer", "hi": "रिएक्ट डेवलपर", "ta": "ரியாக்ட் டெவலப்பர்"}' WHERE id = 21;
UPDATE categories SET title_translations = '{"en": "Node.js Developer", "hi": "नोड.जेएस डेवलपर", "ta": "நோட்.ஜே.எஸ் டெவலப்பர்"}' WHERE id = 22;

-- Under IT Support (parent 9)
UPDATE categories SET title_translations = '{"en": "Desktop Support Engineer", "hi": "डेस्कटॉप सपोर्ट इंजीनियर", "ta": "டெஸ்க்டாப் ஆதரவு பொறியாளர்"}' WHERE id = 23;
UPDATE categories SET title_translations = '{"en": "Network Engineer", "hi": "नेटवर्क इंजीनियर", "ta": "நெட்வொர்க் பொறியாளர்"}' WHERE id = 24;

-- Under Nursing (parent 10)
UPDATE categories SET title_translations = '{"en": "Staff Nurse", "hi": "स्टाफ नर्स", "ta": "செவிலி"}' WHERE id = 25;
UPDATE categories SET title_translations = '{"en": "ICU Nurse", "hi": "आईसीयू नर्स", "ta": "ஐசியு செவிலி"}' WHERE id = 26;

-- Under Restaurant (parent 11)
UPDATE categories SET title_translations = '{"en": "Chef", "hi": "शेफ", "ta": "சமையல்காரர்"}' WHERE id = 27;
UPDATE categories SET title_translations = '{"en": "Waiter", "hi": "वेटर", "ta": "ஊழியர்"}' WHERE id = 28;
UPDATE categories SET title_translations = '{"en": "Housekeeping Staff", "hi": "हाउसकीपिंग स्टाफ", "ta": "வீட்டு பராமரிப்பு ஊழியர்"}' WHERE id = 29;

-- Under Hair Services (parent 12)
UPDATE categories SET title_translations = '{"en": "Hair Stylist", "hi": "हेयर स्टाइलिस्ट", "ta": "முடி ஸ்டைலிஸ்ட்"}' WHERE id = 30;
UPDATE categories SET title_translations = '{"en": "Hair Color Specialist", "hi": "हेयर कलर स्पेशलिस्ट", "ta": "முடி நிற நிபுணர்"}' WHERE id = 31;
UPDATE categories SET title_translations = '{"en": "Salon Assistant", "hi": "सैलून असिस्टेंट", "ta": "சலூன் உதவியாளர்"}' WHERE id = 32;

-- ============================================================
-- VERIFY: Run this after to confirm
-- ============================================================
SELECT id, title, title_translations, hierarchy_level, parent_category_id
FROM categories
ORDER BY hierarchy_level, id;
