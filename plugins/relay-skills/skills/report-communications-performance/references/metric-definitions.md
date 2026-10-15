# Metric definitions

Platforms define the same words differently and change definitions over time. Record the
definition in use for each export. The formulas below are the standard forms; state the
one you used.

## Reach and impressions

- **Reach**: the number of unique accounts or people who saw the content at least once.
  Platforms estimate this; it is not additive across posts or days (the same person can
  be reached by several posts).
- **Impressions**: the total number of times content was displayed, including repeat
  views by the same account. Impressions are always at least as large as reach.
- **Frequency**: impressions ÷ reach, the average number of times each reached account
  saw the content.

## Engagement rate

There is no single industry definition. Pick one denominator per report and keep it.

| Version | Formula | When to use |
| --- | --- | --- |
| By reach | engagements ÷ reach × 100 | Default for organic social: share of people who saw it and acted |
| By impressions | engagements ÷ impressions × 100 | When the platform does not give reach, or for paid content |
| By followers | engagements ÷ followers × 100 | Only for comparing with peers who use it; it ignores non-follower reach |

State which engagement types are counted (reactions, comments, shares, saves, link
clicks, video views). Including video views or link clicks changes the rate a lot.

Illustrative example (hypothetical round numbers): 1,000 engagements, 20,000 reach,
50,000 impressions. By reach: 1,000 ÷ 20,000 = 5.0 percent. By impressions: 1,000 ÷
50,000 = 2.0 percent. Same activity, two very different numbers; the denominator must be
named.

## Email

| Metric | Formula | Caveat |
| --- | --- | --- |
| Delivered | sent − bounces | Use as the base for email rates |
| Open rate | unique opens ÷ delivered × 100 | Directional only. Mail privacy features, notably Apple Mail Privacy Protection since 2021, preload images and count opens that may not be reads. Some tools label or filter these machine opens; say whether yours does |
| Click rate | unique clicks ÷ delivered × 100 | The primary email engagement measure; some security scanners click links automatically, so check for sudden spikes |
| Click-to-open rate | unique clicks ÷ unique opens × 100 | Distorted when opens are inflated; if opens rise and this falls, suspect inflation |
| Unsubscribe rate | unsubscribes ÷ delivered × 100 | Watch after changes in frequency or audience |
| Bounce rate | bounces ÷ sent × 100 | List health, not content performance |
| List growth | new subscribers − unsubscribes − removed addresses | Show list cleaning separately |

## Website

| Metric | Formula or definition | Caveat |
| --- | --- | --- |
| Sessions or visits | As defined by the analytics tool | Consent banners and blockers reduce what is recorded |
| Key page views | Views of pages tied to goals (donate, register, resources) | Name the pages |
| Page conversion rate | completed goal actions ÷ sessions on the page × 100 | Define the goal action |

## Conversions

- **Conversion**: a completed action tied to a goal: a gift, a newsletter sign-up, a
  workshop or event registration, a volunteer or advisory board application.
- **Conversion rate**: conversions ÷ the population that had the chance to convert
  (clicks, sessions, recipients). Always name the denominator.
- **Conversion value**: total gift amount credited; for recurring gifts, state whether
  the first payment or an annualized value is counted.
- **Credited to**: name the attribution rule (for example last click in the donation
  platform, a source code on a form, a campaign parameter on the link). See
  trends-and-attribution.md for caveats.

## Rates and change

- Rate change is reported in percentage points: 25.0 percent to 45.0 percent is
  +20.0 percentage points.
- Count change is reported in percent with both raw values: 6 to 12 gifts is +100 percent
  (6 to 12), and flagged as a small base.
- Round rates to one decimal place and never compute a rate on a base smaller than the
  organization's stable-base threshold without flagging it.
