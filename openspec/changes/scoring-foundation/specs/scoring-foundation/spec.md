## ADDED Requirements

### Requirement: Number Criteria Normalization
The system MUST normalize numeric criteria values to a score between 0 and 100. 
- When optimizing for higher values (huongToiUu is CAO_HON), the normalized score SHALL be calculated as `((value - min) / (max - min)) * 100`.
- When optimizing for lower values (huongToiUu is THAP_HON), the normalized score SHALL be calculated as `((max - value) / (max - min)) * 100`.
- When the maximum and minimum values are equal (max == min), the normalized score SHALL be 100.

#### Scenario: Normalize number optimizing for higher values
- **WHEN** the value is 75, minimum is 50, maximum is 150, and optimization direction is CAO_HON
- **THEN** the system returns a normalized score of 25

#### Scenario: Normalize number optimizing for lower values
- **WHEN** the value is 75, minimum is 50, maximum is 150, and optimization direction is THAP_HON
- **THEN** the system returns a normalized score of 75

#### Scenario: Normalize number when maximum equals minimum
- **WHEN** the value is 100, minimum is 100, maximum is 100, and optimization direction is CAO_HON
- **THEN** the system returns a normalized score of 100

### Requirement: Boolean Criteria Normalization
The system MUST normalize boolean criteria values to a score. By default, `true` SHALL map to 100 and `false` SHALL map to 0, unless custom mapping scores are provided.

#### Scenario: Normalize boolean with default values
- **WHEN** the value is true and no custom mapping is provided
- **THEN** the system returns a normalized score of 100

#### Scenario: Normalize boolean with custom values
- **WHEN** the value is false and custom mapping defines false as 20
- **THEN** the system returns a normalized score of 20

### Requirement: Enum Criteria Normalization
The system MUST normalize enum criteria values to a score by looking up the value in the options array.

#### Scenario: Normalize enum value
- **WHEN** the value is "standard" and the option mapping maps "standard" to 70
- **THEN** the system returns a normalized score of 70

### Requirement: Weighted Score Summation
The system MUST calculate the total weighted score as the sum of each normalized score multiplied by its respective weight. The sum of all weights MUST be equal to 1.0. If the sum is not equal to 1.0, the system SHALL automatically normalize the weights proportionally or reject the calculation based on configuration.

#### Scenario: Sum weighted scores
- **WHEN** given scores [80, 90] with weights [0.6, 0.4] respectively
- **THEN** the system returns a total score of 84.0

### Requirement: Tender Price Scoring
The system MUST calculate the tender price score using the formula `P = (Gmin / Gi) * 100`. If any proposal price is less than or equal to 0, the system SHALL throw an error.

#### Scenario: Calculate tender price score
- **WHEN** the bidder's price is 900,000,000 and Gmin (lowest valid price) is 800,000,000
- **THEN** the system returns a price score of 88.89

### Requirement: Auction Price Scoring
The system MUST calculate the auction price score using the formula `Pi = (Gi / Gmax) * 100`. If the auction price is less than or equal to 0, the system SHALL throw an error.

#### Scenario: Calculate auction price score
- **WHEN** the bidder's price is 200,000,000 and Gmax (highest bid) is 250,000,000
- **THEN** the system returns a price score of 80
