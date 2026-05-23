import { Injectable, BadRequestException } from '@nestjs/common';

export interface EnumScoreOption {
  nhan?: string;
  giaTri: string;
  diem: number;
}

export interface TenderWeights {
  trongSoKyThuat: number;
  trongSoGia: number;
}

export interface AuctionWeights {
  trongSoGia: number;
  trongSoUyTin: number;
  trongSoCamKet?: number;
}

@Injectable()
export class ScoringService {
  /**
   * Normalizes a numeric value into a 0-100 score.
   */
  normalizeNumber(value: number, min: number, max: number, isReverse: boolean): number {
    if (max === min) {
      return 100;
    }
    if (max < min) {
      throw new BadRequestException('Max value must be greater than or equal to Min value');
    }
    
    // Clamp the value to min/max boundaries
    let clampedValue = value;
    if (clampedValue < min) clampedValue = min;
    if (clampedValue > max) clampedValue = max;

    if (isReverse) {
      return ((max - clampedValue) / (max - min)) * 100;
    } else {
      return ((clampedValue - min) / (max - min)) * 100;
    }
  }

  /**
   * Normalizes a boolean value. Maps true/false to default or custom scores.
   */
  normalizeBoolean(value: boolean, trueScore = 100, falseScore = 0): number {
    return value ? trueScore : falseScore;
  }

  /**
   * Normalizes an enum value by mapping it to a score defined in the options list.
   */
  normalizeEnum(value: string, options: EnumScoreOption[]): number {
    const found = options.find((opt) => opt.giaTri === value);
    if (!found) {
      throw new BadRequestException(`Enum value "${value}" not found in options`);
    }
    return found.diem;
  }

  /**
   * Calculates the weighted average of multiple scores.
   * Auto-normalizes weights to sum up to 1.0 if they don't already.
   */
  calculateWeightedScore(items: Array<{ score: number; weight: number }>): number {
    if (items.length === 0) return 0;
    const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
    if (totalWeight <= 0) {
      throw new BadRequestException('Total weight must be greater than 0');
    }

    const needsNormalization = Math.abs(totalWeight - 1.0) > 1e-9;

    let sum = 0;
    for (const item of items) {
      const weight = needsNormalization ? (item.weight / totalWeight) : item.weight;
      sum += item.score * weight;
    }
    return sum;
  }

  /**
   * Calculates the tender price score: P = (Gmin / Gi) * 100
   */
  calculateTenderPriceScore(price: number, minPrice: number): number {
    if (price <= 0 || minPrice <= 0) {
      throw new BadRequestException('Price and Gmin must be greater than 0');
    }
    return (minPrice / price) * 100;
  }

  /**
   * Calculates the auction price score: Pi = (Gi / Gmax) * 100
   */
  calculateAuctionPriceScore(price: number, maxPrice: number): number {
    if (price <= 0 || maxPrice <= 0) {
      throw new BadRequestException('Price and Gmax must be greater than 0');
    }
    return (price / maxPrice) * 100;
  }

  /**
   * Calculates the final tender score combining technical and price scores.
   */
  calculateTenderFinalScore(technicalScore: number, priceScore: number, weights: TenderWeights): number {
    return this.calculateWeightedScore([
      { score: technicalScore, weight: weights.trongSoKyThuat },
      { score: priceScore, weight: weights.trongSoGia },
    ]);
  }

  /**
   * Calculates the final auction score combining price, trust, and commitment scores.
   */
  calculateAuctionFinalScore(
    priceScore: number,
    trustScore: number,
    commitmentScore = 0,
    weights: AuctionWeights = { trongSoGia: 0.8, trongSoUyTin: 0.2, trongSoCamKet: 0 },
  ): number {
    const items = [
      { score: priceScore, weight: weights.trongSoGia },
      { score: trustScore, weight: weights.trongSoUyTin },
    ];
    if (weights.trongSoCamKet !== undefined && weights.trongSoCamKet > 0) {
      items.push({ score: commitmentScore, weight: weights.trongSoCamKet });
    }
    return this.calculateWeightedScore(items);
  }
}
