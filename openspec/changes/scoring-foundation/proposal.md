## Why

To support multi-criteria evaluation and ranking for both tenders (Dau thau) and auctions (Dau gia) consistently and transparently, the backend requires a robust and standalone scoring engine. Implementing this foundation first allows subsequent modules to consume verified, unit-tested scoring formulas without mixing mathematical logic into controllers or database operations.

## What Changes

- Create a new, standalone NestJS module `ScoringModule` under `src/modules/scoring`.
- Establish shared constants/enums for session types, criteria types, proposal statuses, and optimization directions.
- Implement a stateless `ScoringService` for number normalization (optimizing higher or lower), boolean evaluation, enum mapping, price scores, and weighted summation.
- Add unit tests for all mathematical scoring formulas to guarantee edge-case correctness.
- Export `ScoringService` to be imported by the upcoming tender and auction modules.

## Capabilities

### New Capabilities
- `scoring-foundation`: A stateless scoring engine implementing math formulas to normalize values (number, boolean, enum) and calculate weighted final scores for tender/auction participants.

### Modified Capabilities
(None)

## Impact

- **New Files**: `src/modules/scoring` directory (module, service, unit tests, and enums/constants).
- **Existing Files**: None. This is a non-breaking, purely additive change at this stage.
