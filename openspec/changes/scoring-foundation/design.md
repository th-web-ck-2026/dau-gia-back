## Context

The backend does not currently have any evaluation logic for tenders or auctions. Since multi-criteria evaluations require math operations (normalization, weighting, and boundary validation), we must establish a standalone module for mathematical calculations to avoid duplicating logic or coupling it directly with controllers and database repositories.

## Goals / Non-Goals

**Goals:**
- Implement `ScoringService` containing stateless, deterministic scoring formulas (numeric normalization, boolean mapping, enum translation, tender/auction pricing).
- Implement shared constants/enums for modules to share session states, optimization directions (`CAO_HON`, `THAP_HON`), etc.
- Verify correctness using a robust unit test suite.
- Export `ScoringService` from `ScoringModule` for other modules to use.

**Non-Goals:**
- Database entity modeling or persistence for criteria or submissions (this will be done in the respective tender and auction modules).
- HTTP controller endpoints directly exposing the scoring service.

## Decisions

### Decision 1: Stateless Utility Service
- **Alternative A**: Keep scoring utility functions in a `utils/` helper.
- **Alternative B**: Implement `ScoringService` as a standard NestJS injectable.
- **Rationale**: Implementing it as a NestJS service allows it to be injected where needed, supporting mock implementations in unit tests of consumer services. Keeping it stateless ensures we can perform quick in-memory calculations without database latency.

### Decision 2: Automatic Weight Normalization
- **Alternative A**: Throw an error if weights do not sum up exactly to 1.0.
- **Alternative B**: Automatically normalize weights proportionally if they don't equal 1.0.
- **Rationale**: We will support validation but also provide a mode to auto-normalize weights proportionally (`weight_i = weight_i / total_weight`) to prevent calculation failures due to rounding errors (e.g., `0.33 + 0.33 + 0.34` vs `1/3 + 1/3 + 1/3`).

## Risks / Trade-offs

- **Risk**: Division by zero during number criteria normalization when $max == min$.
  - **Mitigation**: Detect $max == min$ at the beginning of the calculation and return a default score of 100.
- **Risk**: Input price value of zero or negative.
  - **Mitigation**: Explicitly validate prices to be greater than 0, throwing a `BadRequestException` if violation occurs.
