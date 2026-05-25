import { Test, TestingModule } from '@nestjs/testing';
import { ScoringService } from './scoring.service';
import { BadRequestException } from '@nestjs/common';

describe('ScoringService', () => {
  let service: ScoringService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ScoringService],
    }).compile();

    service = module.get<ScoringService>(ScoringService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('normalizeNumber', () => {
    it('should normalize value optimizing for higher values (isReverse = false)', () => {
      const score = service.normalizeNumber(75, 50, 150, false);
      expect(score).toBe(25);
    });

    it('should normalize value optimizing for lower values (isReverse = true)', () => {
      const score = service.normalizeNumber(75, 50, 150, true);
      expect(score).toBe(75);
    });

    it('should return 100 when max equals min', () => {
      const score = service.normalizeNumber(100, 100, 100, false);
      expect(score).toBe(100);
    });

    it('should clamp value to min boundary if value is below min', () => {
      const score = service.normalizeNumber(30, 50, 150, false);
      expect(score).toBe(0);
    });

    it('should clamp value to max boundary if value is above max', () => {
      const score = service.normalizeNumber(200, 50, 150, false);
      expect(score).toBe(100);
    });

    it('should throw BadRequestException if max is less than min', () => {
      expect(() => {
        service.normalizeNumber(75, 150, 50, false);
      }).toThrow(BadRequestException);
    });
  });

  describe('normalizeBoolean', () => {
    it('should return default scores for true and false', () => {
      expect(service.normalizeBoolean(true)).toBe(100);
      expect(service.normalizeBoolean(false)).toBe(0);
    });

    it('should return custom scores when provided', () => {
      expect(service.normalizeBoolean(true, 80, 20)).toBe(80);
      expect(service.normalizeBoolean(false, 80, 20)).toBe(20);
    });
  });

  describe('normalizeEnum', () => {
    const options = [
      { giaTri: 'basic', diem: 40 },
      { giaTri: 'standard', diem: 70 },
      { giaTri: 'premium', diem: 100 },
    ];

    it('should return mapped score for a valid enum value', () => {
      expect(service.normalizeEnum('standard', options)).toBe(70);
    });

    it('should throw BadRequestException if enum value is not in options', () => {
      expect(() => {
        service.normalizeEnum('luxury', options);
      }).toThrow(BadRequestException);
    });
  });

  describe('calculateWeightedScore', () => {
    it('should sum scores with weights', () => {
      const items = [
        { score: 80, weight: 0.6 },
        { score: 90, weight: 0.4 },
      ];
      expect(service.calculateWeightedScore(items)).toBeCloseTo(84);
    });

    it('should auto-normalize weights if they do not sum to 1.0', () => {
      const items = [
        { score: 80, weight: 60 },
        { score: 90, weight: 40 },
      ];
      expect(service.calculateWeightedScore(items)).toBeCloseTo(84);
    });

    it('should throw BadRequestException if total weight is 0 or negative', () => {
      const items = [
        { score: 80, weight: -0.5 },
        { score: 90, weight: 0.5 },
      ];
      expect(() => {
        service.calculateWeightedScore(items);
      }).toThrow(BadRequestException);
    });
  });

  describe('calculateTenderPriceScore', () => {
    it('should calculate tender price score correctly', () => {
      // P = (Gmin / Gi) * 100
      expect(service.calculateTenderPriceScore(900, 800)).toBeCloseTo(88.88888);
    });

    it('should throw BadRequestException if price or minPrice is zero or negative', () => {
      expect(() => service.calculateTenderPriceScore(0, 800)).toThrow(BadRequestException);
      expect(() => service.calculateTenderPriceScore(900, -10)).toThrow(BadRequestException);
    });
  });

  describe('calculateAuctionPriceScore', () => {
    it('should calculate auction price score correctly', () => {
      // Pi = (Gi / Gmax) * 100
      expect(service.calculateAuctionPriceScore(200, 250)).toBe(80);
    });

    it('should throw BadRequestException if price or maxPrice is zero or negative', () => {
      expect(() => service.calculateAuctionPriceScore(-50, 250)).toThrow(BadRequestException);
      expect(() => service.calculateAuctionPriceScore(200, 0)).toThrow(BadRequestException);
    });
  });

  describe('calculateTenderFinalScore', () => {
    it('should calculate final tender score based on weights', () => {
      const finalScore = service.calculateTenderFinalScore(91, 88.89, {
        trongSoKyThuat: 0.6,
        trongSoGia: 0.4,
      });
      expect(finalScore).toBeCloseTo(90.156);
    });
  });

  describe('calculateAuctionFinalScore', () => {
    it('should calculate final auction score with default weights (0.8 price, 0.2 trust)', () => {
      const finalScore = service.calculateAuctionFinalScore(90, 70);
      expect(finalScore).toBeCloseTo(86);
    });

    it('should calculate final auction score with custom weights including commitment', () => {
      const finalScore = service.calculateAuctionFinalScore(90, 70, 100, {
        trongSoGia: 0.7,
        trongSoUyTin: 0.2,
        trongSoCamKet: 0.1,
      });
      expect(finalScore).toBeCloseTo(87);
    });
  });
});
