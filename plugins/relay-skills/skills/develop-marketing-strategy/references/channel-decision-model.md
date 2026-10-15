# Channel Decision Model

Use this reference to form a coherent portfolio and defend channel opinions with business-specific evidence.

## Contents

- Define channel roles
- Filter before scoring
- Score fit and confidence
- Adjust for the business motion
- Build a coherent portfolio
- Write a channel playbook
- Avoid common errors

## Define channel roles

A channel can serve more than one role, but name its primary job:

- **Create demand:** Make a problem, category, or differentiated point of view salient.
- **Capture demand:** Reach buyers already expressing relevant intent.
- **Build trust:** Supply proof, education, authority, community, or repeated exposure.
- **Convert:** Move an interested buyer into a trial, consultation, purchase, or sales conversation.
- **Retain and expand:** Improve activation, repeat purchase, renewal, referral, or expansion.
- **Compound:** Create a durable audience, data asset, partner network, content library, reputation, or product loop.

Do not call a distribution surface a strategy. Specify the audience, moment, message, offer, path, and role.

Also give every channel one **job**, the funnel stage it is accountable for: `acquisition`, `activation`, `retention`, `referral`, or `revenue`. Roles describe how a channel works; the job decides what it is compared against. Create-demand, capture-demand, trust and convert roles usually serve `acquisition`. Retain-and-expand roles serve `activation`, `retention`, `referral`, or `revenue`.

## Filter before scoring

Exclude a channel before weighted scoring when a knockout condition applies:

- the ICP cannot be reached or lawfully targeted there;
- the channel cannot express the required proof or narrative;
- acquisition economics cannot plausibly fit margin, LTV, payback, or sales capacity;
- the team cannot operate the channel at a credible cadence;
- the conversion path or follow-up system does not exist;
- policy, compliance, data, inventory, geography, or delivery constraints make it unsafe;
- the learning horizon is longer than the decision horizon.

State what would remove the knockout condition.

## Score fit and confidence

Use a 1-5 score and 0-1 evidence confidence for each criterion. Adjust weights when the business model demands it and explain the adjustment.

| Criterion | Default weight | Decision question |
|---|---:|---|
| `icp_reach` | 20 | Is the specific ICP concentrated, identifiable, or naturally present? |
| `intent_timing` | 15 | Can the channel reach the buyer near a meaningful trigger or evaluation moment? |
| `message_proof_fit` | 15 | Can the channel carry the needed story, demonstration, authority, and proof? |
| `economic_fit` | 15 | Can likely cost, conversion, margin, LTV, payback, and sales effort plausibly work? |
| `learning_speed` | 10 | Will it produce interpretable signal within the decision horizon? |
| `operational_fit` | 10 | Can the team create, distribute, follow up, and sustain the motion? |
| `competitive_headroom` | 10 | Is there a credible way to earn attention despite saturation and platform dependency? |
| `durability` | 5 | Does activity compound into audience, data, authority, relationships, or product value? |

Run:

```bash
python3 scripts/score_channels.py channel-scores.json --format markdown
```

Use the default criteria by omitting `criteria`. Set `primary_job` to the job the objective is about (default `acquisition`). Give every channel a `job`. Supply every default criterion for each scored channel; use `knockout` instead of `scores` for an excluded channel:

```json
{
  "primary_job": "acquisition",
  "channels": [
    {
      "name": "Organic search",
      "job": "acquisition",
      "scores": {
        "icp_reach": {"score": 4, "confidence": 0.8, "rationale": "Cited evidence"},
        "intent_timing": {"score": 5, "confidence": 0.7},
        "message_proof_fit": {"score": 4, "confidence": 0.8},
        "economic_fit": {"score": 3, "confidence": 0.5},
        "learning_speed": {"score": 2, "confidence": 0.8},
        "operational_fit": {"score": 4, "confidence": 0.9},
        "competitive_headroom": {"score": 3, "confidence": 0.6},
        "durability": {"score": 5, "confidence": 0.8}
      }
    },
    {"name": "Television", "job": "acquisition", "knockout": "Budget and production capacity"}
  ]
}
```

The script reports raw fit, weighted evidence confidence, and confidence-adjusted fit. Channels that serve the primary job rank first, and `rankings_by_job` ranks each job separately. Compare a channel only with others doing the same job: an onboarding email scores well because its audience is already won, which says nothing about acquiring new buyers. Keep rationales and citations in the strategy; the score is a comparison aid, not an empirical forecast.

## Adjust for the business motion

Use these as hypotheses to investigate, not universal defaults:

| Motion | Channels commonly worth evaluating | Critical condition |
|---|---|---|
| High-consideration B2B | Targeted outbound, partners, expert content, events, search, account-based paid support | Named buying trigger, credible proof, and disciplined sales follow-up |
| Product-led software | Product loops, templates, community, search, integrations, creator or partner education, lifecycle | Fast activation and an observable value event |
| Professional service | Referrals, alliances, authority content, targeted outreach, workshops, search | Trust assets, case proof, qualification, and delivery capacity |
| Local service | Local search and maps, reviews, referrals, local partners, lifecycle, selective paid search | Geographic intent, review operations, response speed, and call or booking conversion |
| Ecommerce | Shopping and search, paid social, creators or affiliates, email or SMS, SEO, referral | Contribution margin, creative throughput, merchandising, conversion, and repeat purchase |
| Consumer subscription | Product or referral loops, creators, communities, paid social or search, lifecycle | Retention, payback, habit formation, and sufficient creative testing capacity |
| Marketplace | Supply-side partnerships or outbound plus demand capture, referral, local or category liquidity plays | Sequenced liquidity by side, segment, and geography |

For a new or weakly validated offer, emphasize interpretable learning and direct customer contact. For a proven motion, emphasize scalable distribution, yield improvement, and dependency reduction.

## Build a coherent portfolio

Choose channels that reinforce one another. A common shape is:

- one demand-creation or trust motion;
- one demand-capture motion;
- one conversion and lifecycle system;
- one compounding asset or relationship network;
- one bounded experiment addressing a strategic unknown.

Examples of reinforcement include expert content supplying outbound follow-up, customer proof improving paid and sales conversion, partners creating event audiences, or lifecycle data shaping paid suppression and expansion.

Limit primary channels to the number the team can operate well. A channel that needs six months of consistent work is not a small experiment merely because media spend is low.

## Write a channel playbook

For every primary, supporting, or experimental channel, specify:

| Field | Required answer |
|---|---|
| Role | Journey stage and strategic job |
| Audience | Segment, buying role, trigger, exclusions |
| Message | Problem, promise, mechanism, proof, objection |
| Offer | Content, tool, trial, consultation, product, event, or other next value |
| Motion | Surface, format, targeting or distribution, cadence |
| Path | Landing experience, capture, nurture, sales or purchase, onboarding |
| Integration | Inputs to and outputs from other channels |
| Resources | Owner, skills, production, tools, media, sales and delivery capacity |
| Measurement | Setup, leading, conversion, revenue or retention, brand, attribution limits |
| Decision rule | Hypothesis, test size or duration, pass, fail, scale, stop, review date |

Tie the channel metric to a business outcome. Followers, impressions, traffic, clicks, and leads are not sufficient without quality, conversion, economics, or retention.

## Avoid common errors

- Do not recommend every major platform.
- Do not confuse a content format with a distribution channel.
- Do not use competitor visibility as proof of competitor success.
- Do not scale paid acquisition before conversion, follow-up, delivery, and unit economics are ready.
- Do not assume organic means free; include production, expertise, and time-to-compound.
- Do not assign revenue credit where measurement supports only association.
- Do not use a benchmark without recency, geography, segment, funnel definition, and source.
- Do not hide uncertainty inside precise forecasts or scores.
