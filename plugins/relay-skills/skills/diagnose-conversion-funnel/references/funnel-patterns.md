# Funnel patterns by business model

Use these as starting templates. Replace every stage name and criterion with the user's own definitions; the traps listed are the ones that most often produce a wrong diagnosis in each model.

## Sales-led (CRM stages)

Typical stages: Lead → Marketing-qualified lead (MQL, meets fit and engagement rules) → Sales-accepted lead (SAL, a rep agrees to work it) → Opportunity (qualified, with a named need and buyer) → Proposal → Closed-won.

Data: opportunity and lead history tables with stage entry dates, not just the current stage. Without history, only a snapshot is possible and step rates cannot be computed honestly.

Formulas specific to this model:

- Stage-to-stage conversion by entry cohort: opportunities created in a quarter, followed to close or to a fixed age limit.
- Win rate: `closed-won / (closed-won + closed-lost)` for a cohort that has fully resolved. Excluding still-open deals from the denominator inflates the rate for young cohorts; state which convention is used.
- Stage velocity and aging (see `funnel-measurement.md`).

Traps:

- **Stage skipping.** Reps create opportunities directly from referrals or events, so opportunities exceed SALs. Report the skip path as its own entry route.
- **Recycled leads.** A lead that returns to nurture and re-enters is counted twice. Decide whether to count first entry or each entry.
- **Definition drift.** MQL scoring rules change during the period. Split cohorts at the change date.
- **Lost-reason quality.** Picklist values are often defaulted. Sample notes to verify before quoting lost-reason shares.
- **Owner effects.** One rep or team can drive a stage gap. Cut by owner before blaming marketing or the product.

Qualitative sources: call recordings and notes for stalled deals, lost-reason notes, and short interviews with recently lost prospects where the relationship allows.

## Product-led (signup and activation events)

Typical stages: Visit → Signup started → Signup completed → Activation (the first action that predicts retention, defined by the user's own data) → Habit or team adoption → Paid conversion.

Defining activation: choose the early action whose completion best separates users who retain from those who do not, measured on the user's past cohorts. Write it as an event, a count, and a window ("created two projects within 7 days of signup"). If no analysis exists, flag the activation definition as Assumed and recommend the retention comparison as a follow-up.

Traps:

- **Account vs. user unit.** Paid conversion happens per account; signups are per user. Pick one unit and map the other to it.
- **Invited users.** Users who join an existing account behave differently from founders of a new account. Separate them.
- **Trial length changes.** A shorter or longer trial shifts when conversion happens; compare cohorts at equal age.
- **Event renames.** Product releases rename or retire events. Check the event catalog history around any step change.
- **Immature cohorts.** The last few weeks of signups have not had time to convert. Exclude or label them.

Qualitative sources: recordings of first sessions, onboarding checklist completion data, in-product one-question surveys, support tickets from users in their first week.

## E-commerce

Typical stages: Session → Product view → Add to cart → Checkout started → Payment submitted → Order confirmed.

Traps:

- **Session vs. user.** Many buyers browse across several sessions before buying. Session-based rates understate true purchase propensity; user-based rates need cross-device identity. State the unit and its limitation.
- **Promotions and stockouts.** A promotion lifts add-to-cart; a stockout depresses it. Annotate both on the timeline.
- **Payment failures.** Separate declined or errored payments from abandonment. Declines point to the payment provider or fraud rules, not the checkout design.
- **Shipping cost surprise.** A drop between checkout start and payment often coincides with the first display of shipping cost or delivery date. Check what is shown at each step.
- **Returns.** If the final outcome is revenue, decide whether returned orders count.

Qualitative sources: recordings of checkout abandonment, field-level form analytics, payment error logs, and post-purchase or exit surveys.

## Choosing the final outcome

Stop the funnel at the outcome the business values and can measure reliably within the window. When the true outcome (retained customer, expansion revenue) takes too long, use the last reliably measured stage and state that the diagnosis optimizes a proxy. For retention after purchase, hand off to analyze-cohort-retention.
