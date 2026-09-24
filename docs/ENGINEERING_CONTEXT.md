# Engineering Context

RaceMetrics is a private, authenticated motorsport analytics product. The repository may be public while application data and user-owned state remain protected.

## Proactive implementation rules

Infer low-risk product and engineering details from the domain model, existing visual language and documented roadmap. Do not wait for a micro-specification when the intended behavior is clear.

Every feature should answer four questions:

1. What verified domain data does it use?
2. Who is authorized to access it?
3. What happens when the data is missing, stale or invalid?
4. How does the feature behave on small screens and with keyboard navigation?

## Data integrity

Preview fixtures must remain visibly distinct from official results. Metrics should carry provenance or a clear source boundary. Never manufacture a race result, timing value, ranking or live status to make the interface look finished.

## Product quality

Avoid generic dashboard patterns. Density should follow motorsport information hierarchy: classification, timing, sectors, laps, stints, qualifying and race context. Decorative UI must not outrank useful data.

Security, accessibility, responsive behavior, test coverage and meaningful error states are release requirements, not later polish.
