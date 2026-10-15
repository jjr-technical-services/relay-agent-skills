# Forecasting contact volume

Staffing error is usually forecast error. Build the forecast in layers so each layer can be checked on its own, and keep the history, the adjustments, and the assumptions visible.

## 1. Prepare the history

- Use **offered** contacts (everything that arrived, including abandoned calls and chats), not only handled contacts. If only handled counts exist, add abandoned counts back or flag that demand is understated.
- Separate channels and, where routing differs, queues.
- Tag anomalies: outages, one-off campaigns, billing errors, data gaps, holidays. Either remove them (and forecast them separately if they recur) or keep them with a note. Do not silently average them in.
- Normalize for business drivers where possible: contacts per 1,000 active customers, per 1,000 orders, or per release. A ratio to a driver survives growth better than a raw count.

## 2. Level and trend (monthly or weekly)

- Start from recent weekly totals. With stable volume, a moving average of recent weeks is a reasonable level. With a clear trend, fit a simple linear trend or use the driver ratio × the business forecast for the driver (for example, contacts per active customer × forecast active customers).
- Decision rule for method: if a business driver explains most of the variation in history and has its own forecast, use the driver ratio; otherwise use time-series methods (moving average, exponential smoothing, or seasonal models such as Holt-Winters) on the contact history itself. Say which method was used and why.

## 3. Seasonality

- **Annual:** with at least one full year of history, compute a seasonal index per month or week = that period's volume ÷ average period volume. Two or more years make the index more reliable; one year cannot distinguish seasonality from a one-time event.
- **Day-of-week:** index each weekday = average volume on that weekday ÷ average daily volume, from recent weeks without holidays. Recompute after product or hours changes.
- **Intraday:** for each interval, share of the day's volume = average interval volume ÷ average daily volume for that weekday. Use a separate intraday curve per weekday where patterns differ (Mondays often differ from Fridays in shape, not just size).

Forecast for an interval = weekly forecast × day-of-week share × intraday share.

Illustrative (hypothetical round numbers): weekly forecast 5,000 calls; Monday's share of the week is 25%; the 10:00–10:30 interval carries 4% of Monday's volume. Interval forecast = 5,000 × 0.25 × 0.04 = 50 calls.

## 4. Events and known changes

List each planned event (launch, price change, migration, marketing campaign, policy change) with an estimated uplift, its duration, and the channels affected. Base the uplift on the most similar past event where one exists; otherwise label it a judgement and show the staffing with and without it.

## 5. Deflection and self-service

Deflection assumptions are the most frequently overstated input in staffing plans. Handle them this way:

- Show volume **before** and **after** deflection as separate lines.
- State the rate, the contact types it applies to (deflection rarely applies evenly to all), and the evidence: measured pilot, vendor estimate, or judgement.
- Remember that deflected contacts are usually the simplest ones. When they disappear, the remaining contacts often have a longer average handle time. Model AHT for the remaining mix, or at least flag this.
- Phase deflection in over time rather than assuming the full rate on day one.
- Plan hiring on the more conservative case until deflection is measured in production.

## 6. Handle time

- Forecast AHT per channel and, if possible, per contact type; the mix changes AHT.
- New hires handle contacts more slowly while ramping; include a ramp adjustment when a large share of the team will be new.
- AHT often varies by time of day and season (complex issues cluster at certain times). Use interval-level AHT where available.

## 7. Measure forecast accuracy

Track forecast versus actual at the level used for decisions: weekly for hiring, interval for scheduling. Mean absolute percentage error (MAPE) = average of |actual − forecast| ÷ actual. Report bias too (average of forecast − actual): a forecast that is consistently high or low needs a level correction, not a new method. Do not quote a target accuracy as an industry standard; set one with the user from their history.

## What to hand back

A table per channel: Period | Base volume | Seasonal index | Event adjustment | Deflection | Forecast volume | Method note. Keep adjustments as separate columns so a reviewer can see which layer moved the number.
