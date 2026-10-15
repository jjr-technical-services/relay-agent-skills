---
name: audit-saas-spend
description: Audit and rationalize a company's software and SaaS spend. Builds the inventory from accounts payable, corporate card and expense exports plus the SSO or identity provider app list, normalizes vendor names, categorizes tools, finds overlapping and duplicate tools, measures license utilization, builds a renewal calendar with notice periods and auto-renew terms, and ranks savings levers with labelled estimates and risk checks before cancelling, ending in an owner-per-app governance model. Use when asked to audit software spend, cut SaaS costs, find unused licenses or duplicate tools, build a renewal calendar, or set up software ownership. Do not use for choosing one vendor among options (vendor-comparison), negotiating a specific renewal (negotiate-tactically), or the annual budget (build-operating-budget).
---

# Audit SaaS Spend

Find out what software the company pays for, who uses it, when each contract can be changed, and which changes save money without breaking work. The audit has three hard parts: assembling a complete inventory from scattered sources, measuring real use rather than assigned seats, and acting at the right moment in each contract's renewal cycle. Savings are only real when a contract changes, so every estimate is labelled by stage (identified, committed, realized) and tied to a date on the renewal calendar. Nothing is cancelled without checking data, integrations, and security implications with the app's owner.

## Inputs to gather

Ask for the following exports, covering at least the last 12 months so annual charges appear. Where one is unavailable, proceed and state which part of the inventory may be incomplete.

- **Accounts payable (AP) vendor ledger**: vendor, invoice date, amount, currency, general ledger account, cost center.
- **Corporate card transactions**: merchant descriptor, date, amount, cardholder, department.
- **Employee expense reports**: merchant, amount, category, employee — software bought on personal cards and reimbursed.
- **SSO / identity provider (IdP) app list**: every application connected to single sign-on, with assigned users and last sign-in dates where available.
- **Admin console exports** for the largest tools: seats purchased, seats assigned, last active date per user, plan tier.
- **Contracts and order forms**: term, start and end dates, seat or usage commitments, price, renewal type (auto-renew or not), notice period, price-increase clauses, termination rights.
- **HR roster** with active and departed employees, to find licenses held by leavers.
- **Known owners**: who requested, administers, or budgets each tool.
- **Security and compliance context**: which tools hold customer data, personal data, or regulated data, and any certification scope that depends on specific tools.
- **Constraints**: tools leadership has already decided to keep, planned migrations, and business-critical periods when changes must not happen.
- **Savings goal and audience**: a target amount, a budget cycle it feeds, or a one-off clean-up; it changes how deep the audit goes.

Label every figure as supplied (from an export or contract), derived (calculated here), or assumed (a placeholder to confirm). If contracts are missing, mark renewal dates and notice periods as unknown rather than guessing; an unknown notice period is itself an action item.

## Workflow

1. **Assemble the raw spend.** Combine AP, card, and expense lines into one table with source, date, amount (converted to one currency at a stated rate), and payer. Read [references/inventory-and-normalization.md](references/inventory-and-normalization.md) for joining sources and cleaning merchant names.
2. **Normalize vendors.** Map merchant descriptors and invoice names to one canonical vendor and product (resellers, marketplaces, and payment processors hide the real vendor). Keep the mapping table so the next audit is faster.
3. **Annualize cost.** For each vendor-product, compute annual run-rate cost: monthly charges × 12, annual charges as billed, usage-based charges from the trailing 12 months. Flag one-off purchases separately.
4. **Join to the app list.** Match spend to SSO/IdP applications. Apps in the IdP without spend may be free, bundled, or paid on a card not yet found; spend without an IdP app may be unmanaged ("shadow IT", tools bought outside central purchasing) — a security finding as well as a cost one.
5. **Categorize.** Assign each tool a functional category (for example, communication, project management, CRM, design, data and analytics, developer tools, security, HR and finance) and a business owner.
6. **Find overlaps and duplicates.** Within each category, list tools that do the same job; separate true duplicates (the same product bought twice by different teams) from functional overlaps (different products for the same job). Read [references/utilization-overlap-and-savings.md](references/utilization-overlap-and-savings.md) for overlap tests, utilization measures, and savings arithmetic.
7. **Measure utilization.** For each seat-priced tool: seats purchased, seats assigned, seats active in the chosen window (state it — commonly 30 or 90 days), and seats held by departed employees.
8. **Build the renewal calendar.** For every contract: renewal date, auto-renew yes or no, notice period, notice deadline (renewal date minus notice period), price-change clauses, and the owner. Read [references/renewals-risk-and-governance.md](references/renewals-risk-and-governance.md) for the calendar, risk checks, and governance model.
9. **Choose savings levers per tool**: right-size seats, downgrade tier, consolidate onto one tool, renegotiate at renewal, or cancel. Estimate each saving with its formula and label it an estimate, with the earliest date it can be realized given the contract.
10. **Run risk checks before any cancellation or consolidation**: data export and retention, integrations and automations that depend on the tool, security and compliance owner sign-off, contractual exit terms, and user impact.
11. **Prioritize** by estimated annual saving, ease, risk, and deadline urgency. Actions whose notice deadline falls soonest go first regardless of size.
12. **Set governance** so the savings stick: an owner per app, an intake process for new tools, offboarding that removes licenses, and a review cadence.

## Worked example (illustrative, hypothetical numbers)

- A tool has 100 seats at 30 per seat per month: 100 × 30 × 12 = 36,000 a year.
- 55 users were active in the last 90 days. Keeping a buffer for growth and returning users, the owner agrees to 60 seats.
- Estimated annual saving from right-sizing = 40 seats × 30 × 12 = 14,400 (estimate; realizable only at renewal if the seat count is committed for the term).
- The contract renews on 1 July, auto-renews, and requires 60 days' written notice: the notice deadline is 2 May. After that date the saving moves out a full term.

## Judgement calls and decision rules

- **Active-use window.** Use 30 days for daily-work tools and 90 days or longer for periodic tools (reporting, reviews, annual processes). State the window per tool; a short window on a periodic tool cuts seats people need.
- **Seat buffer.** Right-size to active users plus a buffer for planned hiring and returning users, agreed with the owner. There is no standard buffer; state the one used.
- **Consolidate or keep both.** Consolidate when the retained tool meets the must-have needs of most active users and the migration cost is recovered within a period the owner accepts. Keep both when a small group has a genuine unique need and the cost is small; record why.
- **Cancel now or at renewal.** When seats or terms are committed, a mid-term reduction usually saves nothing; plan it for renewal and give notice on time. Cancel monthly subscriptions promptly once the risk checks pass.
- **Renegotiate or switch.** Renegotiation is lower risk; a credible alternative strengthens it. Evaluating that alternative is a vendor-comparison task.
- **Central purchasing or team autonomy.** Central control reduces duplicates but slows teams; a common middle path is free choice below a spend threshold with registration in the inventory, and review above it.

## Prioritizing actions

Rank the savings plan so the first actions are the ones that lose value if delayed:

1. **Notice deadlines within the next 90 days**, whatever their size: missing one usually locks in another full term.
2. **Leaver seats and unused monthly subscriptions**: low risk, immediate, and they fix offboarding gaps.
3. **Right-sizing and tier changes at upcoming renewals**, largest estimated saving first.
4. **Duplicate accounts of the same product**: merge at the earlier renewal.
5. **Functional consolidations**: largest potential, highest disruption; plan them over two or more renewal cycles with the owners.

Within each group, order by estimated annual saving divided by effort and risk, and name the owner and date for each action.

## Common findings to look for

- Seats still assigned to people who have left.
- The same product bought separately by several teams on cards.
- Premium tiers bought for one feature a few people use.
- Tools paid for but not connected to SSO, so access is not removed at offboarding.
- Auto-renewing multi-year contracts with notice deadlines already close.
- Free trials that converted to paid plans on a card nobody reviews.
- Usage-based charges growing faster than the business, with no owner watching them.

## Handing off

- Choosing between candidate replacement tools: vendor-comparison.
- Preparing and running a renewal negotiation: negotiate-tactically.
- Feeding realized savings and renewal timing into next year's plan: build-operating-budget.
- Documenting the intake and offboarding procedures: sop-writer; mapping the purchasing process end to end: map-business-process.

## Output

Deliver the audit with these parts:

1. **Summary**: total annual software run rate, number of tools, share of spend with a named owner, identified savings (estimate) by lever, and the actions with the nearest deadlines.
2. **Inventory** — table: Vendor | Product | Category | Owner | Source(s) (AP / card / expense / IdP) | Billing (monthly / annual / usage) | Annual run-rate cost | Contract end | In IdP (yes/no).
3. **Utilization** — table: Product | Seats purchased | Seats assigned | Active in window | Held by leavers | Utilization % (active ÷ purchased) | Cost per active user.
4. **Overlaps** — table: Category | Tools | Combined cost | Users per tool | Overlap type (duplicate / functional) | Consolidation candidate | Blocking dependencies.
5. **Renewal calendar** — table: Product | Renewal date | Auto-renew | Notice period | Notice deadline | Price-change clause | Owner | Planned action | Decision needed by.
6. **Savings plan** — table: Product | Lever | Calculation | Estimated annual saving | Earliest realization date | Stage (identified / committed / realized) | Risk checks complete (yes/no) | Owner.
7. **Risk and dependency notes** for each cancellation or consolidation.
8. **Governance model**: owner responsibilities, intake and approval rules, offboarding, review cadence.
9. **Data gaps**: sources not yet included and how they could change the totals.

When only some exports are available, deliver the full structure with the rows that can be filled, mark missing fields as unknown, and put the missing sources at the top of the data gaps. A partial inventory presented as complete understates spend and hides unmanaged tools.

## Quality checks

Before answering, confirm:

- All sources were combined and each line's source is traceable; missing sources are listed as data gaps.
- Vendor normalization merged resellers and variant merchant names, and the mapping is shown or retained.
- Annual run rate treats monthly, annual, and usage billing correctly, in one currency at a stated rate.
- Utilization uses active use in a stated window, not assigned seats; the definition of "active" is stated per tool.
- Every savings figure shows its formula, is labelled an estimate, and has an earliest realization date consistent with the contract.
- Notice deadlines are computed from renewal date minus notice period, and anything due within the next 90 days is flagged first.
- No tool is recommended for cancellation without the data, integration, security, and contract checks.
- No benchmark ("companies typically waste X%") is stated as fact.
- Illustrative numbers are marked hypothetical and recomputed.
- Tools paid for but missing from SSO are flagged for security review, not only for cost.
- Identified, committed, and realized savings are reported separately and not added together.
- Each consolidation names the retained tool, the migration owner, and the renewal it is timed to.

## Boundaries

- Choosing a replacement vendor among several options belongs in vendor-comparison; negotiating a specific renewal belongs in negotiate-tactically.
- Contract interpretation (termination rights, auto-renewal enforceability, data return obligations) should be confirmed with legal counsel or procurement before acting on it.
- Removing tools that hold regulated or customer data needs sign-off from the security or compliance owner; certification scope and data retention obligations may constrain timing.
- The audit recommends; budget owners and procurement decide and execute. Savings feed next year's plan through build-operating-budget.
- Do not access admin consoles or change licenses directly unless the user explicitly asks and has authority; produce the list of changes for the owner to make.
