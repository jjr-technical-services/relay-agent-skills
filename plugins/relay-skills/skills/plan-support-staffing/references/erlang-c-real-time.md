# Erlang C for real-time channels

## What Erlang C models

Erlang C is the queueing model M/M/N: contacts arrive at random (Poisson arrivals) at a steady rate within the interval, handle times are exponentially distributed with a known average, there are N identical agents, and anyone who cannot be answered immediately waits in an unlimited queue and never hangs up. Under those assumptions it gives the probability a contact waits, the service level, and the average speed of answer (ASA) for any number of agents.

## Formulas

Definitions:

- λ = arrivals in the interval; S = interval length in seconds; AHT = average handle time in seconds.
- Traffic intensity A = λ × AHT ÷ S, measured in Erlangs. One Erlang is one agent continuously busy for the interval.
- N = agents logged in and available (net agents). N must be greater than A or the queue grows without limit.
- T = service-level threshold in seconds (the "Y" in "X% in Y seconds").

Probability a contact has to wait (the Erlang C formula):

```
                 A^N / N! × N / (N − A)
P(wait) = ─────────────────────────────────────────────
          Σ_{k=0}^{N−1} A^k / k!  +  A^N / N! × N / (N − A)
```

Service level (share answered within T seconds):

```
SL = 1 − P(wait) × e^(−(N − A) × T / AHT)
```

Average speed of answer (over all contacts, including those answered immediately):

```
ASA = P(wait) × AHT / (N − A)
```

Occupancy (share of available time spent handling contacts):

```
Occupancy = A / N
```

For large N the factorials overflow, so the script computes Erlang C through the Erlang B recursion, which is numerically stable and mathematically equivalent:

```
B(0) = 1;  B(n) = A × B(n−1) / (n + A × B(n−1))
C(N) = N × B(N) / (N − A × (1 − B(N)))
```

Staffing procedure per interval: start at the smallest whole N above A, increase N until SL meets the target, then until ASA meets its limit (if one is set), then raise N to ceil(A ÷ occupancy cap) if the cap would otherwise be exceeded.

## Worked example (illustrative, hypothetical numbers)

A 30-minute interval (S = 1,800 s) receives 100 calls with AHT 180 s. Target: 80% answered within 20 s.

A = 100 × 180 ÷ 1,800 = 10 Erlangs.

| N | P(wait) | Service level | ASA (s) | Occupancy |
|---|---|---|---|---|
| 11 | 0.682 | 39.0% | 122.8 | 90.9% |
| 12 | 0.449 | 64.0% | 40.4 | 83.3% |
| 13 | 0.285 | 79.6% | 17.1 | 76.9% |
| 14 | 0.174 | 88.8% | 7.8 | 71.4% |

Thirteen agents falls just short (79.6%), so 14 net agents are required. With shrinkage of 30%, gross agents = 14 ÷ (1 − 0.30) = 20. Multiplying instead (14 × 1.30 = 18.2) would understate the need by nearly two agents in this one interval.

Two lessons the example makes visible:

- Going from 13 to 14 agents buys about nine points of service level; going from 11 to 12 buys twenty-five. Service level rises steeply and then flattens, so the last few points of a high target are expensive.
- Occupancy falls as service level rises. Asking for a high service level and a high occupancy at the same time is contradictory in small groups.

## Pooling

Larger pools are more efficient: at the same service level, doubling the arrivals needs fewer than double the agents, so occupancy rises with scale. Splitting one queue into several skill-based queues loses some of this efficiency. When a user proposes splitting queues (by product, language, tier), run the numbers both ways and show the cost of the split. The flip side is that very large pools can hit the occupancy cap, which is why the cap is checked after the service-level search.

## When Erlang C misleads and what to do

- **Abandonment.** Real callers hang up. Erlang C ignores this, so it overstates waiting and usually overstates the agents needed when abandonment is material. Erlang A (which adds a patience parameter) is the standard refinement; if the user has abandonment and patience data, say that Erlang A or simulation would be more accurate and treat Erlang C as a conservative upper estimate.
- **Retries.** Callers who abandon and call back inflate offered volume; count unique demand where possible.
- **Chat concurrency.** An agent handling two chats at once is not twice as fast; each chat usually takes longer when shared. A practical approximation is effective AHT = measured chat handle time ÷ achieved concurrency, but label it an approximation and validate against actual chat service levels. Use the concurrency the team actually achieves, not the configured maximum.
- **Asynchronous messaging.** Messaging where customers reply hours later behaves more like deferred work; size it with the workload method.
- **Small teams and very short intervals.** With a handful of agents, randomness dominates; results swing sharply with one agent more or less. Present a range and consider a minimum staffing floor for coverage.
- **Non-random arrivals.** Bursts after an email campaign or outage violate the steady-rate assumption. Use shorter intervals (15 minutes) around known spikes, or plan a surge response instead of staffing every day for the spike.
- **Blended agents.** Agents who also work tickets between calls change availability. Size the real-time requirement first, then count idle time as capacity for deferred work only if the deferred targets tolerate it.

## Choosing the service goal

There is no correct service level. Commonly used conventions (for example 80% in 20 seconds for voice, or shorter first-response targets for chat) are starting points, not standards. Present two or three service-level options with the FTE and cost each requires and let the business choose. The decision rule: choose the lowest service level where measured customer outcomes (abandonment, repeat contacts, satisfaction, churn signals) stop improving meaningfully, and revisit when data shows otherwise.
