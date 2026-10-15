# Renewal calendar, risk checks, and governance

## Renewal calendar

For every contract (and every card subscription over a threshold the user sets), record:

| Field | Notes |
|---|---|
| Renewal or end date | From the order form or the billing console, not from the invoice date alone |
| Auto-renew | Yes or no, and for how long it renews (same term or a new term) |
| Notice period | Days of written notice required to avoid renewal or to change seats |
| Notice deadline | Renewal date minus notice period, computed with real calendar dates |
| Notice method | Email to a named address, portal, registered letter — as the contract specifies |
| Price-change clause | Stated uplift cap, list-price reset, or none |
| Committed quantity | Seats or usage committed for the term, and whether reductions are allowed at renewal |
| Owner | Who decides renew, change, or cancel |
| Decision needed by | Internal deadline, set before the notice deadline to allow review and negotiation |

Illustrative (hypothetical): renewal 1 July, 60 days' notice → notice deadline 2 May. If the internal review needs four weeks, the decision is needed by early April.

Practice points:

- Sort by notice deadline, not renewal date.
- Contracts without a documented notice period: read the terms; if still unclear, treat as needing action well ahead of renewal and ask procurement or legal.
- Auto-renewal terms sometimes renew for the full original term (a multi-year contract renewing for another multi-year term). Flag these prominently.
- Send renewal notices in the manner the contract specifies and keep evidence of sending.
- Monthly card subscriptions can usually be cancelled anytime, but check minimum terms and data deletion timing.

## Risk checks before cancelling or consolidating

Complete these with the app owner before any cancellation or migration. Record the result for each.

1. **Data**: What data lives in the tool? Can it be exported in a usable format? Where will it go? How long does the provider retain data after cancellation, and is there a deletion confirmation? Are there legal holds or retention obligations (financial records, employment records, customer communications) that require keeping it?
2. **Integrations and automations**: What systems send data to or read data from the tool (webhooks, sync jobs, embedded widgets, reports)? What breaks when it is removed? Who will rebuild them?
3. **Identity and access**: Is the tool connected to SSO? Are there accounts outside SSO (shared logins, service accounts) that must be closed?
4. **Security and compliance**: Does the tool appear in security documentation, customer commitments, data-processing records, or certification scope? The security or compliance owner signs off on removal and on any replacement tool's review.
5. **Contract**: Exit fees, committed spend, minimum terms, data return clauses, and the notice method.
6. **Users**: Who loses what capability? Is there a replacement and training? Is timing compatible with critical business periods (quarter end, peak season)?
7. **Rollback**: Can the decision be reversed if something was missed (for example, keeping one admin seat until migration is confirmed)?

A tool with active users who have no replacement should not be cancelled for savings alone; the decision belongs to its owner and their leadership.

## Governance model: one owner per app

Savings decay without governance. Put in place:

**Owner responsibilities** (business owner per app):

- Justify the tool's value and budget annually.
- Approve new seats and tier changes.
- Review utilization before each renewal and decide renew, change, or cancel by the internal deadline.
- Keep the contract, notice terms, and administrators recorded.

**Intake for new tools**:

- A short request: the job to be done, why existing tools do not meet it (check the category list first), expected users and cost, data handled, and owner.
- Security review proportional to the data handled.
- Procurement or finance check for existing contracts with the same vendor.
- Purchase through the approved route; card purchases of software above a threshold require the intake to be completed.

**Offboarding**:

- The HR departure process triggers removal from SSO and from tools outside SSO, and seat reclamation.
- Periodic reconciliation of assigned seats against the HR roster.

**Review cadence**:

- Monthly: new software charges on cards and expenses reviewed against the inventory.
- Quarterly: renewal calendar for the next two quarters reviewed with owners; leaver seats reclaimed.
- Annually: full audit refresh, category overlap review, and budget input to build-operating-budget.

**Reporting**: total run rate, number of tools, share of spend with an owner, savings by stage (identified, committed, realized), and upcoming notice deadlines.
