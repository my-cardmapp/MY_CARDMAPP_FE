# Card-Map 데이터베이스 설계

## 핵심 테이블

```sql
-- 카드 정보
CREATE TABLE card (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,  -- 'CHILD_MEAL', 'CULTURE_NURI'
    name VARCHAR(100) NOT NULL,
    issuer VARCHAR(100),
    color_hex VARCHAR(7),
    icon_url VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_card_code (code)
);

-- 가맹점 정보
CREATE TABLE merchant (
    id BIGSERIAL PRIMARY KEY,
    merchant_code VARCHAR(100) UNIQUE,  -- 외부 시스템 연동용
    name VARCHAR(200) NOT NULL,
    category_id BIGINT REFERENCES category(id),
    address VARCHAR(500),
    location GEOGRAPHY(POINT, 4326),  -- PostGIS
    phone VARCHAR(20),
    business_hours JSONB,  -- {"mon": ["09:00", "22:00"], ...}
    is_verified BOOLEAN DEFAULT false,
    search_vector tsvector,  -- Full-text search
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    SPATIAL INDEX idx_merchant_location (location),
    INDEX idx_merchant_search (search_vector) USING GIN
);

-- 가맹점-카드 연결 (시간대별 사용 가능 정보 추가)
CREATE TABLE merchant_card (
    merchant_id BIGINT REFERENCES merchant(id),
    card_id BIGINT REFERENCES card(id),
    is_active BOOLEAN DEFAULT true,
    usage_restriction JSONB,  -- {"min_amount": 10000, "time_slots": [...]}
    last_verified_at TIMESTAMP,
    PRIMARY KEY (merchant_id, card_id)
);
```

## 캐싱 전략

```sql
-- 경로 캐시 (지역별 파티셔닝)
CREATE TABLE route_cache (
    cache_key VARCHAR(255) PRIMARY KEY,  -- MD5(origin+dest+waypoints)
    origin GEOGRAPHY(POINT, 4326),
    destination GEOGRAPHY(POINT, 4326),
    waypoints JSONB,
    route_data JSONB,  -- {distance, duration, polyline, steps}
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    hit_count INT DEFAULT 0
) PARTITION BY RANGE (created_at);

-- AI 쿼리 캐시 (Semantic)
CREATE TABLE ai_query_cache (
    id BIGSERIAL PRIMARY KEY,
    query_embedding vector(1536),  -- pgvector
    query_hash VARCHAR(64),
    normalized_query TEXT,
    response JSONB,
    model_version VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ttl_hours INT DEFAULT 24,
    INDEX idx_embedding (query_embedding) USING ivfflat
);
```

## 데이터베이스 기술 스택

- **Database**: PostgreSQL 16 + PostGIS 3.5
- **Cache**: Redis 7 + Spring Cache
- **Search**: PostgreSQL Full-Text Search → Elasticsearch (확장시)
- **Connection Pool**: HikariCP
- **Migration**: Flyway