import { Injectable, BadRequestException } from '@nestjs/common';

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
   * Calculates the auction price score: Pi = (Gi / Gmax) * 100
   */
  calculateAuctionPriceScore(price: number, maxPrice: number): number {
    if (price <= 0 || maxPrice <= 0) {
      throw new BadRequestException('Price and Gmax must be greater than 0');
    }
    return (price / maxPrice) * 100;
  }
}
