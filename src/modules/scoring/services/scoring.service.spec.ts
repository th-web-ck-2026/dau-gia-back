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
});
