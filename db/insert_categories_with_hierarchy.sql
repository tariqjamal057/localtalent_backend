-- Categories with hierarchy_level and parent_category_id

-- Level 1: Categories (hierarchy_level = 1)
INSERT INTO categories (id, title, title_translations, hierarchy_level, has_children) VALUES
(1, 'Construction', '{"en": "Construction", "hi": "निर्माण", "ta": "கட்டிடம்"}', 1, TRUE),
(2, 'Technology', '{"en": "Technology", "hi": "प्रौद्योगिकी", "ta": "தொழில்நுட்பம்"}', 1, TRUE),
(3, 'Healthcare', '{"en": "Healthcare", "hi": "स्वास्थ्य सेवा", "ta": "சுகாதாரம்"}', 1, TRUE),
(4, 'Hospitality', '{"en": "Hospitality", "hi": "आतिथ्य", "ta": "விருந்தோம்பல்"}', 1, TRUE),
(5, 'Beauty & Salon', '{"en": "Beauty & Salon", "hi": "सौंदर्य और सैलून", "ta": "அழகு மற்றும் சலூன்"}', 1, TRUE)

ON CONFLICT (id) DO UPDATE SET 
    title = EXCLUDED.title,
    title_translations = EXCLUDED.title_translations,
    hierarchy_level = EXCLUDED.hierarchy_level,
    has_children = EXCLUDED.has_children;

-- Level 2: Subcategories (hierarchy_level = 2)
INSERT INTO categories (id, title, title_translations, hierarchy_level, parent_category_id, has_children) VALUES
(6, 'Civil Works', '{"en": "Civil Works", "hi": "सिविल कार्य", "ta": "சிவில் பணிகள்"}', 2, 1, TRUE),
(7, 'Electrical Works', '{"en": "Electrical Works", "hi": "बिजली का काम", "ta": "மின் பணிகள்"}', 2, 1, TRUE),
(8, 'Software Development', '{"en": "Software Development", "hi": "सॉफ्टवेयर विकास", "ta": "மென்பொருள் உருவாக்கம்"}', 2, 2, TRUE),
(9, 'IT Support', '{"en": "IT Support", "hi": "आईटी सहायता", "ta": "ஐடி ஆதரவு"}', 2, 2, TRUE),
(10, 'Nursing', '{"en": "Nursing", "hi": "नर्सिंग", "ta": "செவிலியல்"}', 2, 3, TRUE),
(11, 'Restaurant', '{"en": "Restaurant", "hi": "रेस्तरां", "ta": "உணவகம்"}', 2, 4, TRUE),
(12, 'Hair Services', '{"en": "Hair Services", "hi": "बाल सेवाएं", "ta": "முடி சேவைகள்"}', 2, 5, TRUE)

ON CONFLICT (id) DO UPDATE SET 
    title = EXCLUDED.title,
    title_translations = EXCLUDED.title_translations,
    hierarchy_level = EXCLUDED.hierarchy_level,
    parent_category_id = EXCLUDED.parent_category_id,
    has_children = EXCLUDED.has_children;

-- Level 3: Job Roles (hierarchy_level = 3)
INSERT INTO categories (id, title, title_translations, hierarchy_level, parent_category_id) VALUES
(13, 'Mason', '{"en": "Mason", "hi": "मिस्त्री", "ta": "தச்சு"}', 3, 6),
(14, 'Carpenter', '{"en": "Carpenter", "hi": "बढ़ई", "ta": "மரவேலை"}', 3, 6),
(15, 'Painter', '{"en": "Painter", "hi": "पेंटर", "ta": "ஓவியர்"}', 3, 6),
(16, 'Electrician', '{"en": "Electrician", "hi": "इलेक्ट्रीशियन", "ta": "மின்சார தொழிலாளர்"}', 3, 7),
(17, 'Wireman', '{"en": "Wireman", "hi": "वायरमैन", "ta": "வயர்மேன்"}', 3, 7),
(18, 'Frontend Developer', '{"en": "Frontend Developer", "hi": "फ्रंटएंड डेवलपर", "ta": "முன்பக்க டெவலப்பர்"}', 3, 8),
(19, 'Backend Developer', '{"en": "Backend Developer", "hi": "बैकएंड डेवलपर", "ta": "பின்பக்க டெவலப்பர்"}', 3, 8),
(20, 'Full Stack Developer', '{"en": "Full Stack Developer", "hi": "फुल स्टैक डेवलपर", "ta": "முழு ஸ்டாக் டெவலப்பர்"}', 3, 8),
(21, 'React Developer', '{"en": "React Developer", "hi": "रिएक्ट डेवलपर", "ta": "ரியாக்ட் டெவலப்பர்"}', 3, 8),
(22, 'Node.js Developer', '{"en": "Node.js Developer", "hi": "नोड.जेएस डेवलपर", "ta": "நோட்.ஜே.எஸ் டெவலப்பர்"}', 3, 8),
(23, 'Desktop Support Engineer', '{"en": "Desktop Support Engineer", "hi": "डेस्कटॉप सपोर्ट इंजीनियर", "ta": "டெஸ்க்டாப் ஆதரவு பொறியாளர்"}', 3, 9),
(24, 'Network Engineer', '{"en": "Network Engineer", "hi": "नेटवर्क इंजीनियर", "ta": "நெட்வொர்க் பொறியாளர்"}', 3, 9),
(25, 'Staff Nurse', '{"en": "Staff Nurse", "hi": "स्टाफ नर्स", "ta": "செவிலி"}', 3, 10),
(26, 'ICU Nurse', '{"en": "ICU Nurse", "hi": "आईसीयू नर्स", "ta": "ஐசியு செவிலி"}', 3, 10),
(27, 'Chef', '{"en": "Chef", "hi": "शेफ", "ta": "சமையல்காரர்"}', 3, 11),
(28, 'Waiter', '{"en": "Waiter", "hi": "वेटर", "ta": "ஊழியர்"}', 3, 11),
(29, 'Housekeeping Staff', '{"en": "Housekeeping Staff", "hi": "हाउसकीपिंग स्टाफ", "ta": "வீட்டு பராமரிப்பு ஊழியர்"}', 3, 11),
(30, 'Hair Stylist', '{"en": "Hair Stylist", "hi": "हेयर स्टाइलिस्ट", "ta": "முடி ஸ்டைலிஸ்ட்"}', 3, 12),
(31, 'Hair Color Specialist', '{"en": "Hair Color Specialist", "hi": "हेयर कलर स्पेशलिस्ट", "ta": "முடி நிற நிபுணர்"}', 3, 12),
(32, 'Salon Assistant', '{"en": "Salon Assistant", "hi": "सैलून असिस्टेंट", "ta": "சலூன் உதவியாளர்"}', 3, 12)

ON CONFLICT (id) DO UPDATE SET 
    title = EXCLUDED.title,
    title_translations = EXCLUDED.title_translations,
    hierarchy_level = EXCLUDED.hierarchy_level,
    parent_category_id = EXCLUDED.parent_category_id;
