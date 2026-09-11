# RaceMetrics Design Direction

## Objective

The interface must feel designed for motorsport analysis, not generated from a generic dashboard template.

## Visual language

- Dark technical base with restrained red accent.
- Strong typographic hierarchy.
- Dense information only where density helps analysis.
- Generous spacing around primary decisions.
- Thin borders and subtle surfaces instead of excessive floating cards.
- Data visualization should carry meaning before decoration.
- Motion should explain state changes, ranking movement or race progression.

## Motorsport-specific vocabulary

Use concepts that naturally belong to racing interfaces:

- position
- gap
- interval
- lap
- stint
- sector
- pit window
- qualifying
- race pace
- classification
- DNF
- points progression

These concepts should shape the information architecture, not merely appear as labels.

## Anti-generic rules

1. Do not build every section as the same rounded card.
2. Do not use random gradients as decoration.
3. Do not add fake statistics simply to fill empty space.
4. Do not use oversized marketing copy where a data product needs information.
5. Do not use charts without a defined analytical question.
6. Do not claim live or official data when the application is using mock data.
7. Avoid stock imagery as a substitute for product identity.
8. Prefer bespoke timing tables, comparison layouts and analytical visualizations.
9. Empty states must explain why data is unavailable and what the next action is.
10. Every reusable component needs a reason to exist in RaceMetrics.

## Accessibility

Visual identity cannot compromise usability. Color must never be the only way to communicate status. Keyboard navigation, focus states, reduced motion and readable contrast are release requirements.
