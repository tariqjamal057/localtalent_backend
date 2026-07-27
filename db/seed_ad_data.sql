-- ============================================================
-- INSERT: Dummy data for ad_packs
-- ============================================================

INSERT INTO ad_packs (price, offer_price, priority, max_impressions, max_days, is_active)
VALUES
    (99, 79, 1, 500, 7, TRUE),
    (299, 249, 2, 2000, 15, TRUE),
    (599, 499, 3, 5000, 30, TRUE),
    (999, 799, 4, 15000, 30, TRUE);

-- ============================================================
-- INSERT: Dummy data for user_ads
-- ============================================================

-- User 1 ads
INSERT INTO user_ads (user_id, media_type, media_url, title, description, impression_count, days_count, max_impressions, max_days, is_live, expires_on)
VALUES
    (1, 1, 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=360&h=120&fit=crop', 'Construction Services', 'Best construction and civil works in your area', 120, 3, 500, 7, TRUE, NOW() + INTERVAL '4 days'),
    (1, 1, 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=360&h=120&fit=crop', 'Summer Sale - 20% Off', 'Discount on all electrical works this summer', 45, 1, 2000, 15, TRUE, NOW() + INTERVAL '14 days'),
    (1, 1, 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=360&h=120&fit=crop', 'Hiring Electricians', 'Looking for skilled electricians for commercial projects', 0, 0, 2000, 15, FALSE, NULL);

-- User 2 ads
INSERT INTO user_ads (user_id, media_type, media_url, title, description, impression_count, days_count, max_impressions, max_days, is_live, expires_on)
VALUES
    (2, 1, 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=360&h=120&fit=crop', 'Premium Salon Services', 'Walk in for hair spa, color & styling at best prices', 320, 5, 5000, 30, TRUE, NOW() + INTERVAL '25 days'),
    (2, 1, 'https://images.unsplash.com/photo-1600948836101-f9ffda59d250?w=360&h=120&fit=crop', 'Grand Opening Offer', '50% off on first visit - Book now!', 89, 2, 500, 7, TRUE, NOW() + INTERVAL '5 days');

-- ============================================================
-- VERIFY
-- ============================================================
SELECT id, user_id, title, impression_count, days_count, max_impressions, max_days, is_live, expires_on
FROM user_ads
ORDER BY id;

SELECT id, price, offer_price, max_impressions, max_days, is_active
FROM ad_packs
ORDER BY priority;
