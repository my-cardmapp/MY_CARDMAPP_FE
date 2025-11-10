# 백엔드 API 응답 형식 요구사항

## 현재 백엔드 응답 (문제)

```json
{
  "content": [
    {
      "id": 1,
      "name": "강남 CU편의점",
      "address": "서울특별시 강남구 테헤란로 123",
      "latitude": 37.4979,
      "longitude": 127.0276,
      "phone": null,
      "businessHours": null,
      "category": {
        "id": 2,
        "name": "편의점"
      },
      "availableCards": null,
      "distance": null
    }
  ]
}
```

## 프론트엔드가 요구하는 응답 형식

```json
{
  "content": [
    {
      "id": 1,
      "name": "강남 CU편의점",
      "address": "서울특별시 강남구 테헤란로 123",
      "location": {
        "lat": 37.4979,
        "lng": 127.0276
      },
      "cards": [
        {
          "id": 1,
          "code": "CHILD_MEAL",
          "name": "아동급식카드",
          "colorHex": "#FF6B6B"
        }
      ],
      "category": {
        "id": 2,
        "code": "convenience",
        "name": "편의점",
        "icon": "🏪"
      },
      "phone": "02-1234-5678",
      "businessHours": {
        "mon": ["09:00", "22:00"],
        "tue": ["09:00", "22:00"],
        "wed": ["09:00", "22:00"],
        "thu": ["09:00", "22:00"],
        "fri": ["09:00", "22:00"],
        "sat": ["09:00", "22:00"],
        "sun": ["09:00", "22:00"]
      },
      "isVerified": true
    }
  ],
  "pageable": {
    "page": 0,
    "size": 10,
    "sort": []
  },
  "totalElements": 13,
  "totalPages": 2,
  "first": true,
  "last": false
}
```

## 변경 사항 요약

### 1. ❌ `latitude`, `longitude` → ✅ `location` 객체
```json
// Before
"latitude": 37.4979,
"longitude": 127.0276

// After
"location": {
  "lat": 37.4979,
  "lng": 127.0276
}
```

### 2. ❌ `availableCards: null` → ✅ `cards` 배열
```json
// Before
"availableCards": null

// After
"cards": [
  {
    "id": 1,
    "code": "CHILD_MEAL",
    "name": "아동급식카드",
    "colorHex": "#FF6B6B"
  }
]
```

**카드 코드 목록**:
- `CHILD_MEAL` - 아동급식카드 (#FF6B6B)
- `CULTURE_NURI` - 문화누리카드 (#4ECDC4)
- `LOCAL_CURRENCY` - 지역사랑상품권 (#FFE66D)

### 3. ❌ `category` → ✅ `code`와 `icon` 추가
```json
// Before
"category": {
  "id": 2,
  "name": "편의점"
}

// After
"category": {
  "id": 2,
  "code": "convenience",
  "name": "편의점",
  "icon": "🏪"
}
```

**카테고리 코드 매핑**:
| name | code | icon |
|------|------|------|
| 음식점 | restaurant | 🍽️ |
| 편의점 | convenience | 🏪 |
| 카페 | cafe | ☕ |
| 베이커리 | bakery | 🥐 |
| 서점 | bookstore | 📚 |
| 영화관 | cinema | 🎬 |
| 마트 | mart | 🛒 |
| 약국 | pharmacy | 💊 |
| 전통시장 | market | 🏪 |
| 패스트푸드 | fastfood | 🍔 |

### 4. ❌ `phone: null` → ✅ 필드 제외 or 실제 값
```json
// Before
"phone": null

// After (옵션 1 - 필드 제외)
// "phone" 필드 없음

// After (옵션 2 - 실제 값)
"phone": "02-1234-5678"
```

### 5. ✅ `isVerified` 필드 추가
```json
"isVerified": true  // 검증된 가맹점 여부
```

## TypeScript 타입 정의

```typescript
interface Merchant {
  id: number;
  name: string;
  address: string;
  location: {
    lat: number;
    lng: number;
  };
  cards: Array<{
    id: number;
    code: string;  // "CHILD_MEAL" | "CULTURE_NURI" | "LOCAL_CURRENCY"
    name: string;
    colorHex: string;
  }>;
  category: {
    id: number;
    code: string;
    name: string;
    icon?: string;
  };
  phone?: string;
  businessHours?: {
    [key: string]: string[];  // { "mon": ["09:00", "22:00"], ... }
  };
  isVerified: boolean;
}

interface MerchantListResponse {
  content: Merchant[];
  pageable: {
    page: number;
    size: number;
    sort: string[];
  };
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}
```

## API 엔드포인트

### GET /api/v1/merchants

**Query Parameters**:
- `page`: 페이지 번호 (0부터 시작)
- `size`: 페이지 크기
- `cardTypes`: 카드 타입 필터 (쉼표 구분) 예: `CHILD_MEAL,CULTURE_NURI`
- `categories`: 카테고리 코드 필터 (쉼표 구분) 예: `restaurant,cafe`

**Example Request**:
```
GET /api/v1/merchants?page=0&size=10&cardTypes=LOCAL_CURRENCY
```

**Example Response**: 위의 "프론트엔드가 요구하는 응답 형식" 참고

## 우선순위

1. **🔴 필수**: `location` 객체 변환
2. **🔴 필수**: `cards` 배열 추가
3. **🟡 중요**: `category.code`, `category.icon` 추가
4. **🟢 선택**: `isVerified` 필드 추가

## 구현 방법 제안 (Spring Boot)

```java
@Entity
public class Merchant {
    @Id
    private Long id;
    private String name;
    private String address;
    private Double latitude;
    private Double longitude;

    @ManyToOne
    private Category category;

    @ManyToMany
    private List<Card> cards;

    // DTO 변환 메서드
    public MerchantDTO toDTO() {
        return MerchantDTO.builder()
            .id(id)
            .name(name)
            .address(address)
            .location(new LocationDTO(latitude, longitude))
            .cards(cards.stream().map(Card::toDTO).collect(Collectors.toList()))
            .category(category.toDTO())
            .isVerified(true)
            .build();
    }
}

@Data
public class LocationDTO {
    private Double lat;
    private Double lng;
}
```

## 테스트 방법

프론트엔드에서 테스트:
```bash
curl http://localhost:8080/api/v1/merchants?page=0&size=1
```

응답이 위의 형식과 일치하는지 확인하세요!
