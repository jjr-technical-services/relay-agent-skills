# Building the inventory

No single system knows everything the company pays for. The inventory is a join of spend sources (what is paid) and access sources (what is used), reconciled into one row per vendor-product.

## Sources and what each misses

| Source | Finds | Misses |
|---|---|---|
| Accounts payable (AP) | Invoiced contracts, larger vendors, annual prepayments | Card and expensed purchases; bundled items inside reseller invoices |
| Corporate card | Self-serve monthly subscriptions, team-level tools | Invoiced contracts; tools on personal cards |
| Expense reports | Tools bought on personal cards and reimbursed | Anything not claimed; mixes software with other categories |
| SSO / identity provider app list | Tools connected to single sign-on, with users and last sign-in | Tools not connected to SSO; free tools; spend |
| Admin consoles | Seats, plan tier, last activity per user | Tools the audit team cannot access |
| Contracts repository | Terms, notice periods, commitments | Tools bought by click-through on a card |
| Finance system GL accounts | Software spend coded to software accounts | Software miscoded to other accounts |

Use all that are available. For AP and card data, pull at least 12 months so that annual renewals appear; 13 months catches an annual charge that falls on the boundary.

## Assembling the spend table

1. Stack the sources into one table with columns: source, date, merchant or vendor as written, amount, currency, payer (cost center, cardholder, or employee), GL account, description.
2. Filter to software: GL software accounts, plus merchant names that match known software vendors, plus descriptions containing subscription terms (subscription, license, seat, plan, renewal). Review the filtered-out remainder briefly for miscoded software.
3. Convert currencies at one stated rate (for example, the average rate for the period) and say which.
4. Remove refunds and credits against their original charges rather than deleting them.

## Normalizing vendors

Merchant descriptors are inconsistent: the same vendor may appear under a legal entity name, a product name, a payment processor prefix, an abbreviated descriptor, or a reseller or marketplace name.

Rules:

- Create a mapping table: raw name → canonical vendor → product → category. Keep it; it is the most reusable output of the audit.
- Strip payment processor prefixes and trailing reference numbers before matching.
- Match case-insensitively and on distinctive words in the name; confirm ambiguous matches by amount pattern (same monthly amount) and cardholder.
- Resellers and cloud marketplaces: split the invoice into the underlying products where line detail exists; otherwise record the reseller as vendor and flag the row.
- Distinguish products from the same vendor (a vendor may sell several unrelated tools); overlap and utilization analysis happens at product level.
- Record every row that could not be mapped as a data gap rather than dropping it.

## Annual run rate

For each vendor-product:

- Monthly billing: most recent full month × 12 (not the 12-month sum, which understates recent seat growth or overstates recent reductions). Note the 12-month actual alongside.
- Annual billing: the most recent annual charge, adjusted for known contract changes.
- Usage-based: trailing 12 months of actual charges, with the trend noted.
- Multi-year prepaid: annualized contract value, with the next renewal date.

## Joining spend to access

Match the spend inventory to the IdP app list on canonical vendor-product:

- **Paid and in IdP**: managed tools; proceed to utilization.
- **Paid, not in IdP**: unmanaged or not yet connected. Flag for security review (who has access, how access is removed when someone leaves) as well as cost.
- **In IdP, no spend found**: free tier, bundled, paid by another entity, or paid on a card not yet included. Resolve before concluding it is free.
- **Duplicate spend lines for one product**: several teams buying the same tool separately — a prime consolidation candidate.

## Categories

Use a short, stable taxonomy tied to jobs, for example: communication and meetings; documents and knowledge; project and work management; CRM and sales tools; marketing tools; customer support; design; data, analytics and BI; developer tools and infrastructure; security and identity; HR, payroll and finance; legal and procurement; industry-specific. Adjust to the company, but keep each category defined by the job the tool does, so overlaps are visible within a category.

## Owners

Record for each tool: business owner (accountable for value and budget), technical administrator, and budget cost center. Tools with no identifiable owner are a finding in themselves; propose an owner based on the heaviest-using department and confirm with them.
