CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    mobile_number VARCHAR(20) NOT NULL UNIQUE,
    country_code VARCHAR(10) NOT NULL,
    user_type SMALLINT NOT NULL,
    app_language_code VARCHAR(10) NOT NULL DEFAULT 'en',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE user_profiles (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE REFERENCES users (id) ON DELETE CASCADE,
    full_name VARCHAR(120),
    gender SMALLINT,
    age SMALLINT,
    experience_level SMALLINT,
    price_per_day NUMERIC(10, 2),
    average_rating NUMERIC(3, 2) DEFAULT 0,
    is_document_verified BOOLEAN NOT NULL DEFAULT FALSE,
    location_name VARCHAR(150),
    latitude NUMERIC(9, 6),
    longitude NUMERIC(9, 6),
    spoken_languages JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE categories (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    title_translations JSONB,
    hierarchy_level SMALLINT NOT NULL DEFAULT 1,
    parent_category_id BIGINT REFERENCES categories (id),
    has_children BOOLEAN NOT NULL DEFAULT FALSE,
    recruiter_cta_text JSONB,
    candidate_cta_text JSONB,
    action_cta_text JSONB,
    is_free BOOLEAN NOT NULL DEFAULT TRUE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE user_reviews (
    id BIGSERIAL PRIMARY KEY,
    reviewer_user_id BIGINT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    reviewed_user_id BIGINT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    review_text TEXT,
    related_match_id BIGINT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE user_verifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    verification_type SMALLINT NOT NULL,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    expires_at TIMESTAMP,
    attempt_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE user_blocks (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    blocked_user_id BIGINT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, blocked_user_id)
);

CREATE TABLE user_wallets (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE REFERENCES users (id) ON DELETE CASCADE,
    available_match_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE match_count_packs (
    id BIGSERIAL PRIMARY KEY,
    price NUMERIC(10, 2) NOT NULL,
    match_count INT NOT NULL,
    offer_price NUMERIC(10, 2),
    priority INT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE ad_packs (
    id BIGSERIAL PRIMARY KEY,
    price NUMERIC(10, 2) NOT NULL,
    offer_price NUMERIC(10, 2),
    priority INT NOT NULL,
    max_impressions INT NOT NULL,
    max_days INT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE promocodes (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    promo_type SMALLINT NOT NULL,
    multiplier NUMERIC(10, 2),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    expires_on TIMESTAMP,
    is_referral_code BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE payment_orders (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL,
    tax NUMERIC(10, 2) NOT NULL DEFAULT 0,
    status SMALLINT NOT NULL,
    purpose SMALLINT NOT NULL,
    product_id BIGINT,
    purchased_match_count INT,
    purchased_ad_days INT,
    purchased_ad_impressions INT,
    bonus_match_count INT,
    bonus_ad_days INT,
    bonus_ad_impressions INT,
    promocode_id BIGINT REFERENCES promocodes (id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE transactions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    payment_provider SMALLINT NOT NULL,
    provider_order_id VARCHAR(150),
    payment_order_id BIGINT NOT NULL REFERENCES payment_orders (id),
    amount NUMERIC(10, 2) NOT NULL,
    tax NUMERIC(10, 2) NOT NULL DEFAULT 0,
    status SMALLINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE user_ads (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    media_type SMALLINT NOT NULL,
    media_url TEXT NOT NULL,
    title VARCHAR(150),
    description TEXT,
    impression_count INT NOT NULL DEFAULT 0,
    days_count INT NOT NULL DEFAULT 0,
    max_impressions INT NOT NULL,
    max_days INT NOT NULL,
    is_live BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE user_match_points_ledger (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    transaction_id BIGINT NOT NULL,
    transaction_type SMALLINT NOT NULL,
    transaction_points INT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE matches (
    id BIGSERIAL PRIMARY KEY,
    recruiter_user_id BIGINT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    candidate_user_id BIGINT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    call_initiated_by BIGINT REFERENCES users (id),
    recruiter_form_data JSONB,
    candidate_form_data JSONB,
    final_state SMALLINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE match_tracking (
    id BIGSERIAL PRIMARY KEY,
    match_id BIGINT NOT NULL REFERENCES matches (id) ON DELETE CASCADE,
    state SMALLINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- Auto-update updated_at on every UPDATE
-- One shared function, one trigger per table.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql AS
$$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_categories_updated_at
    BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_user_verifications_updated_at
    BEFORE UPDATE ON user_verifications
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_user_wallets_updated_at
    BEFORE UPDATE ON user_wallets
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_match_count_packs_updated_at
    BEFORE UPDATE ON match_count_packs
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_ad_packs_updated_at
    BEFORE UPDATE ON ad_packs
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_promocodes_updated_at
    BEFORE UPDATE ON promocodes
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_payment_orders_updated_at
    BEFORE UPDATE ON payment_orders
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_transactions_updated_at
    BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_user_ads_updated_at
    BEFORE UPDATE ON user_ads
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_matches_updated_at
    BEFORE UPDATE ON matches
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE payment_orders ADD COLUMN order_id VARCHAR(100) NOT NULL;

ALTER TABLE user_ads ADD COLUMN last_shown_at TIMESTAMP;

ALTER TABLE user_ads ADD COLUMN expires_on TIMESTAMP;

ALTER TABLE ad_packs ALTER COLUMN is_active SET DEFAULT FALSE;

ALTER TABLE matches
DROP COLUMN call_initiated_by,
ADD COLUMN provider_call_id VARCHAR(255),
ADD COLUMN total_users INT NOT NULL,
ADD COLUMN proposal_accepted_count INT NOT NULL DEFAULT 0;

ALTER TABLE user_wallets
ADD COLUMN free_match_count_available INT NOT NULL DEFAULT 0,
ADD COLUMN video_request_count_available INT NOT NULL DEFAULT 0;

CREATE TABLE video_requests (
    id BIGSERIAL PRIMARY KEY,
    requested_by BIGINT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    requested_to BIGINT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    request_expires_on TIMESTAMP NULL DEFAULT NULL,
    state SMALLINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_video_requests_updated_at
    BEFORE UPDATE ON video_requests
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();