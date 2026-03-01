# PRD Clarification Session

**Source PRD**: PRD.md
**Session Started**: March 1, 2026
**Depth Selected**: Quick
**Total Questions**: 5
**Progress**: 5/5

---

## Session Log

## Question 1
**Category**: Functional Requirements
**Ambiguity Identified**: "Claim" feature ($10 to claim 30s of lore) mentioned in Demo Goals but has no use case flow, functional decision entry, or processing logic.
**Question Asked**: What should happen with the Claim feature?
**User Response**: Include - needs full spec
**Requirement Clarified**: Claim feature is IN SCOPE for demo. Requires: Tier 4 use case flow, functional decision entries (F10+), and processing logic to be added to PRD.

---

## Question 2
**Category**: Scope Boundaries
**Ambiguity Identified**: Section 2 Non-Goals excludes "Multi-station/multi-tenant deployment," but Section 6.1 describes 4 station cards on home feed—a direct contradiction.
**Question Asked**: Which is correct for the demo?
**User Response**: Multiple stations (home feed)
**Requirement Clarified**: Demo WILL include multiple stations with a home feed. Non-Goals section must be updated to remove "Multi-station/multi-tenant deployment" exclusion.

---

## Question 3
**Category**: Business Rules
**Ambiguity Identified**: Section 4 says FUEL adds 5 mins, but F4 says "Payment of $X adds X×10 minutes"—conflicting formulas.
**Question Asked**: Which formula is correct?
**User Response**: Fixed 5 mins per payment
**Requirement Clarified**: FUEL payment adds a flat 5 minutes to Signal Stability regardless of payment amount ($0.01–$1.00). F4 must be updated to reflect this.

---

## Question 4
**Category**: Functional Requirements
**Ambiguity Identified**: Demo Goals says CALL allows "1 minute" on-air, but Tier 3 Use Case says "2 minutes."
**Question Asked**: Which duration is correct?
**User Response**: 1 minute
**Requirement Clarified**: CALL feature grants 1 minute of live on-air time. Tier 3 Use Case must be updated (change "2 minutes" → "1 minute", warning prompt, and 0:50/1:00 fade timing).

---

## Question 5
**Category**: Technical Constraints
**Ambiguity Identified**: CALL feature requires bidirectional voice but no technical approach specified in Data & Logic section.
**Question Asked**: What's the expected technical approach for the demo?
**User Response**: Browser-based WebRTC
**Requirement Clarified**: CALL uses browser mic via WebRTC—no phone integration. Should be added to Section 7.1 Inputs and 7.2 Processing.

---

# Session Summary

## Key Clarifications Made

| # | Issue | Resolution |
|---|-------|------------|
| 1 | Claim feature undefined | **IN SCOPE** — needs full Tier 4 use case, functional decisions, and processing logic |
| 2 | Multi-station conflict | **Multiple stations confirmed** — remove from Non-Goals |
| 3 | Fuel math inconsistency | **Fixed 5 mins per payment** — update F4 |
| 4 | Call duration conflict | **1 minute** — update Tier 3 use case |
| 5 | Call technical approach | **Browser WebRTC** — add to tech specs |

## Remaining Ambiguities (Not Fully Resolved)

1. **Claim feature flow** — User confirmed it's in scope but the actual UX flow, button placement, and "share to social" mechanism need definition.
2. **Multiple station data** — How many stations? Are they pre-configured or generated? What differentiates them (different AI personas, different lore)?
3. **WebRTC architecture** — Mixing caller audio into the broadcast stream requires specific infrastructure (SFU/MCU). Not detailed.

## Recommended Next Steps

1. **High Priority**: Define the Claim feature (Tier 4 use case flow + functional entries)
2. **Medium Priority**: Specify station configuration (how many, what lore, what voices)
3. **Low Priority**: Document WebRTC architecture for CALL feature

---

*Session complete. Ready to update PRD with clarifications.*
