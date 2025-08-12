import { describe, it, expect } from 'vitest';
import {
  generateKoreanBusinessName,
  generateKoreanAddress,
  generateKoreanPhoneNumber,
  generateBusinessHours,
  generateMerchant,
  generateMerchants,
  BUSINESS_NAME_PATTERNS,
  KOREAN_DISTRICTS,
  CATEGORY_NAMES
} from './merchants';

describe('Korean Business Name Generator', () => {
  it('should generate valid Korean business names', () => {
    const name = generateKoreanBusinessName('RESTAURANT');
    expect(name).toBeTruthy();
    expect(typeof name).toBe('string');
    expect(name.length).toBeGreaterThan(0);
  });

  it('should generate category-specific names', () => {
    const restaurantName = generateKoreanBusinessName('RESTAURANT');
    const convenienceName = generateKoreanBusinessName('CONVENIENCE');
    const cafeName = generateKoreanBusinessName('CAFE');
    
    // 각 카테고리에 맞는 패턴이 있어야 함
    expect(restaurantName).toBeTruthy();
    expect(convenienceName).toBeTruthy();
    expect(cafeName).toBeTruthy();
  });

  it('should include common Korean franchise names', () => {
    const names = Array.from({ length: 100 }, () => 
      generateKoreanBusinessName('CONVENIENCE')
    );
    
    // 일부는 실제 프랜차이즈 이름을 포함해야 함
    const hasKnownFranchise = names.some(name => 
      name.includes('GS25') || 
      name.includes('CU') || 
      name.includes('세븐일레븐')
    );
    expect(hasKnownFranchise).toBe(true);
  });
});

describe('Korean Address Generator', () => {
  it('should generate valid Korean address format', () => {
    const address = generateKoreanAddress();
    expect(address).toBeTruthy();
    expect(address).toContain('시');
    expect(address).toMatch(/[가-힣]/); // 한글 포함
  });

  it('should include real Korean districts', () => {
    const address = generateKoreanAddress();
    const hasValidDistrict = KOREAN_DISTRICTS.some(district => 
      address.includes(district)
    );
    expect(hasValidDistrict).toBe(true);
  });

  it('should have proper address structure', () => {
    const address = generateKoreanAddress();
    // 서울특별시/경기도 등 + 구/시 + 동 + 로/길 + 번지
    expect(address).toMatch(/^[가-힣]+\s+[가-힣]+\s+[가-힣]+\s+[가-힣\d\s-]+$/);
  });

  it('should generate different addresses', () => {
    const addresses = Array.from({ length: 10 }, () => generateKoreanAddress());
    const uniqueAddresses = new Set(addresses);
    expect(uniqueAddresses.size).toBeGreaterThan(5); // 최소 절반은 달라야 함
  });
});

describe('Korean Phone Number Generator', () => {
  it('should generate valid Korean phone format', () => {
    const phone = generateKoreanPhoneNumber();
    expect(phone).toMatch(/^\d{2,3}-\d{3,4}-\d{4}$/);
  });

  it('should use valid Korean area codes', () => {
    const phones = Array.from({ length: 50 }, () => generateKoreanPhoneNumber());
    
    phones.forEach(phone => {
      const areaCode = phone.split('-')[0];
      const validAreaCodes = ['02', '031', '032', '033', '041', '042', '043', 
                             '051', '052', '053', '054', '055', '061', '062', 
                             '063', '064', '010', '011', '016', '017', '018', '019'];
      expect(validAreaCodes).toContain(areaCode);
    });
  });

  it('should generate mobile and landline numbers', () => {
    const phones = Array.from({ length: 100 }, () => generateKoreanPhoneNumber());
    
    const hasMobile = phones.some(p => p.startsWith('010'));
    const hasLandline = phones.some(p => p.startsWith('02') || p.startsWith('031'));
    
    expect(hasMobile).toBe(true);
    expect(hasLandline).toBe(true);
  });
});

describe('Business Hours Generator', () => {
  it('should generate valid business hours', () => {
    const hours = generateBusinessHours('RESTAURANT');
    
    expect(hours).toBeDefined();
    expect(typeof hours).toBe('object');
    
    // 주요 요일이 포함되어야 함
    expect(hours).toHaveProperty('mon');
    expect(hours).toHaveProperty('tue');
    expect(hours).toHaveProperty('fri');
  });

  it('should have proper time format', () => {
    const hours = generateBusinessHours('CONVENIENCE');
    
    if (hours.mon) {
      expect(Array.isArray(hours.mon)).toBe(true);
      expect(hours.mon.length).toBe(2);
      expect(hours.mon[0]).toMatch(/^\d{2}:\d{2}$/);
      expect(hours.mon[1]).toMatch(/^\d{2}:\d{2}$/);
    }
  });

  it('should generate 24/7 for some convenience stores', () => {
    const hoursList = Array.from({ length: 20 }, () => 
      generateBusinessHours('CONVENIENCE')
    );
    
    const has24Hours = hoursList.some(hours => 
      hours['24/7'] === true || 
      (hours.mon && hours.mon[0] === '00:00' && hours.mon[1] === '24:00')
    );
    
    expect(has24Hours).toBe(true);
  });

  it('should respect category patterns', () => {
    const restaurantHours = generateBusinessHours('RESTAURANT');
    const cafeHours = generateBusinessHours('CAFE');
    
    // 레스토랑과 카페는 보통 24시간 영업하지 않음
    if (restaurantHours.mon) {
      const [open, close] = restaurantHours.mon;
      expect(open).not.toBe('00:00');
    }
  });
});

describe('Merchant Generator', () => {
  it('should generate complete merchant object', () => {
    const merchant = generateMerchant(1);
    
    expect(merchant).toHaveProperty('id');
    expect(merchant).toHaveProperty('name');
    expect(merchant).toHaveProperty('address');
    expect(merchant).toHaveProperty('location');
    expect(merchant).toHaveProperty('cards');
    expect(merchant).toHaveProperty('category');
    expect(merchant).toHaveProperty('phone');
    expect(merchant).toHaveProperty('businessHours');
    expect(merchant).toHaveProperty('isVerified');
  });

  it('should have valid location coordinates for Korea', () => {
    const merchant = generateMerchant(1);
    
    // 대한민국 좌표 범위
    expect(merchant.location.lat).toBeGreaterThanOrEqual(33);
    expect(merchant.location.lat).toBeLessThanOrEqual(39);
    expect(merchant.location.lng).toBeGreaterThanOrEqual(124);
    expect(merchant.location.lng).toBeLessThanOrEqual(132);
  });

  it('should assign appropriate cards by category', () => {
    const merchants = generateMerchants(100);
    
    // 음식점은 아동급식카드를 포함해야 함
    const restaurants = merchants.filter(m => 
      m.category.code === 'RESTAURANT' || 
      m.category.code === 'CONVENIENCE'
    );
    
    const hasChildMealCard = restaurants.some(m => 
      m.cards.some(c => c.code === 'CHILD_MEAL')
    );
    
    expect(hasChildMealCard).toBe(true);
  });

  it('should generate Korean text without encoding issues', () => {
    const merchant = generateMerchant(1);
    
    // 한글이 제대로 포함되어 있는지 확인
    expect(merchant.name).toMatch(/[가-힣]/);
    expect(merchant.address).toMatch(/[가-힣]/);
    expect(merchant.category.name).toMatch(/[가-힣]/);
  });
});

describe('Bulk Merchant Generator', () => {
  it('should generate requested number of merchants', () => {
    const count = 50;
    const merchants = generateMerchants(count);
    
    expect(merchants).toHaveLength(count);
  });

  it('should generate unique IDs', () => {
    const merchants = generateMerchants(100);
    const ids = merchants.map(m => m.id);
    const uniqueIds = new Set(ids);
    
    expect(uniqueIds.size).toBe(merchants.length);
  });

  it('should have reasonable category distribution', () => {
    const merchants = generateMerchants(1000);
    const categoryCounts: Record<string, number> = {};
    
    merchants.forEach(m => {
      categoryCounts[m.category.code] = (categoryCounts[m.category.code] || 0) + 1;
    });
    
    // 각 카테고리가 최소한 존재해야 함
    expect(Object.keys(categoryCounts).length).toBeGreaterThan(3);
    
    // 너무 편중되지 않아야 함 (한 카테고리가 70% 이상 차지하지 않음)
    Object.values(categoryCounts).forEach(count => {
      expect(count / merchants.length).toBeLessThan(0.7);
    });
  });

  it('should generate merchants in different locations', () => {
    const merchants = generateMerchants(100);
    const locations = merchants.map(m => `${m.location.lat},${m.location.lng}`);
    const uniqueLocations = new Set(locations);
    
    // 최소 50% 이상은 다른 위치여야 함
    expect(uniqueLocations.size).toBeGreaterThan(50);
  });
});