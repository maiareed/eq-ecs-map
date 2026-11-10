# Rx data pass: findings (2026-11-10)

**Bottom line: nobody has been sent to Rx yet, so the "people don't understand it" theory can't be tested, and a better explainer won't move adoption this month.** Rx went live on Shopify on Oct 26 as a private alpha with SEO-hidden pages. It has had about 400 landing sessions in 15 days against 91,898 storewide sessions over the 60-day window. The planned send to 1,700 survey respondents hasn't gone out. Per the gate in the brief, I stopped before step 2.

## Sources and what I couldn't reach

| Source | Status | What it gave |
|---|---|---|
| Shopify analytics (ShopifyQL, read-only) | OK | Sessions by landing page, referrer, device and week |
| Shopify catalog and sales | OK, but empty for Rx | **There are no Rx products in Shopify.** The Rx pages are Shopify *pages* (a choice made to avoid PHI and abandoned-browse tracking). Price, cart, checkout and orders all happen in Wizlo, so Shopify has no Rx prices, carts or orders. |
| Gorgias | **Blocked (auth)** | The connector needs a re-login. `get_gaia_instructions` isn't exposed in this session either. I pulled no ticket counts. |
| shop.myeq.com/pages/rx-alpha | **Blocked (network)** | The host doesn't resolve from this session, so it's outside the network allowlist. I read the page records through the Shopify Admin API instead. All bodies are theme-section templates (`templateSuffix: rx-*`) with `seo.hidden = 1`. |
| Formulary sheet `1bwcA689…` | OK | Live now, Coming next and Stacks tabs |
| Pricing model v7/v8 (Drive) | Partial | I got the pricing rules (60% target margin, $40 minimum contribution). The per-SKU price cells didn't come through the connector's text export. |
| Survey readout ("Internal Alignment: Telehealth Status 9.21" deck, n=1,059) | OK | Demand by category, price expectations, fears |
| Slack #telehealth and the team DM (read-only search) | OK | Launch state, send plans, friction anecdotes |

## 1. Where people drop off

Rx landing sessions, Oct 26 to Nov 10 (no Rx traffic before Oct 26):

| Stage | Count | Note |
|---|---|---|
| Store sessions, 60 days | 91,898 | Baseline |
| rx-alpha landing sessions | 300 | 0.3% of store traffic. **98% "direct"** (293), 5 from Instagram, 2 from Google. Mobile 167, desktop 132. 35% bounce, about 3.7 pageviews per session. |
| Product-page landings (all 11 live) | about 50 | GLP/GIP 11 · Radiance 7 · Copper Glow 7 · Intimacy Melt 6 · Energy Spray 5 · Gut Peptides 4 · Intimacy Cream 4 · Needle-Free Melt 2 · Microdose 1 · Follicle 1 · **LDN 0** |
| rx-support / v2 landings | 41 | 30 of 36 on desktop, so most likely team traffic |
| Intake start | **Not measurable** | Happens in Wizlo. No Shopify event. |
| Order-confirmed page landings (return from Wizlo) | 10 | rx-order-confirmed 8 · Whole-Woman stack 1 · Discovery session 1. This is a proxy for completed orders and includes team tests. |

Reading:
- The biggest drop-off is before the funnel starts. Rx is getting almost no exposure: hidden pages, no email send yet, no paid media (LegitScript blocks it).
- Once people arrive, they browse: 3.7 pages per session and only 35% bounce.
- Mid-funnel conversion can't be measured. Navigation from rx-alpha to product pages within a session isn't broken out by page in ShopifyQL, and the intake lives in Wizlo.
- The "direct" share is inflated because the Slack and email links carry no UTMs.
- The ramp plan in the 9/21 deck was 50 members in October and 150 in November. The order-confirmed proxy (about 10) is behind that, but the gap comes from invitations not having gone out, not from a conversion failure.

## 2. Top questions and objections

Gorgias was unavailable, so this list has **no ticket counts**. It is assembled from the survey and Slack. Treat it as directional.

1. **Cost.** It ranked #1 of 5 buying factors (mean 2.30, n=828). 66% expect to spend $50 to $149 a month, and only 11% expect $200 or more.
2. **"It's so new / I've heard bad things / I know nothing about it."** Among respondents nervous about a category: 39% said "so new", 34% "heard bad things", 28% "know nothing". Nervousness by category: GLP-1 30%, HRT 21%, peptides 18%, longevity 11%. **This is the only evidence that supports the education theory, and it's stated, not observed.**
3. **"Who do I trust?"** Verbatim: "so much hype… I don't know who to trust"; "if you feel someone has heard me and you trust them, I'd be less [hesitant]."
4. **Intake back-and-forth.** One team member's hair Rx consult turned into a prescriber follow-up asking for labs and medications that the intake hadn't captured ("as a consumer… I may say forget it and try to cancel"). n=1, but it's the right kind of signal.
5. **Getting people to go through it at all.** Coco: "even with investors it's honestly been a little hard to get people to go through it." There's also notification load: an approved member gets about 15 emails and 11 texts by week one (Comms TB agenda, Nov 4).

## 3. Demand by goal and product

- **Survey, unmet demand (want it minus already using it):** peptides +25pt, facial skin +21, longevity +21, HRT +20, female hair loss +18, metabolic/GLP-1 +17, intimacy +17, sleep +14.
- **Observed product-page landings (n=48, too small to rank reliably):** GLP/GIP leads (11). Skin (Radiance plus Copper Glow, 14 combined) is the largest goal cluster. Intimacy (10) is next.
- **LDN had zero direct landings, and Energy Spray had five.** Those are the two products the brief asked for story cards on.
- **HRT is not in the lineup.** It has +20pt unmet demand and is the next waitlist item.

## 4. Recommendation

**Don't build the finder or the story cards yet. Turn the 1,700-respondent send into the experiment that answers the education question, then build what it points to.**

Do it this week, before or alongside Marcy's send:
1. **Add UTMs to every link** in both emails (the ~1,700 respondents and the ~346 who clicked but didn't respond), one per audience. Without them the send disappears into "direct", the same way 98% of traffic already has.
2. **Split the link destination in two**: half go to rx-alpha, half go to one goal-led page (a static version of the finder, three goals and three products, about a day of work, built from the existing content records). Compare product-page reach and order-confirmed returns. This tests "do they understand it" with real people instead of opinions.
3. **Get Wizlo to report intake starts and abandons by product.** It's the only way to see the drop between "interested" and "paid". It's a category 4 blocker: ask Wizlo for an export or a webhook.
4. **Re-authorize Gorgias** and pull Rx tickets 7 days after the send. That gives real objection counts in place of the survey proxies above.

If the goal-led arm wins on reach to product pages and intake, build the full finder and story cards with the briefed design bar. If both arms stall at the same point after the click, the problem is price or intake friction, and education spend is wasted.

## 5. Confidence

- **High** that exposure is the constraint today. It's the plain arithmetic of 300 sessions against 92k, 98% direct, hidden pages and an unsent invite.
- **Low** on whether education is the next constraint. The only support is a stated-intent survey of $500+ LTV customers, presented internally as "validated". Stated intent overstates action, and there's no behavioral data either way.

## Open items logged (not resolved)

- **LDN strength conflict.** The formulary sheet says 0.5, 1.5 and 4.5 mg capsules. The intake offers 5, 15 and 45 mg. The sheet also notes that today the member picks the strength on the intake, and asks whether the clinician should set it instead. Owner: clinical. (Existing Q1.)
- **Regulatory status.** BPC-157, KPV, MOTS-c and GHK-Cu were on FDA's 2023 503A Category 2 list, and their current status is unconfirmed. Wolverine Recovery Rx and Gut Peptides Rx stay out of any finder and are marked pending legal. Note: Slack (Nov 9) shows a plan to rename BPC-157 to "Recovery Peptide #1 Rx" and to bundle TB-500 separately "to get around the pre-mixed wolverine limitation". Legal should see that framing. Owner: legal. (Existing Q15.)
- **Product name.** "Wolverine Recovery Rx" carries trademark and implied-use risk. Owner: legal. (Existing Q16.)
- **New, Intimacy Stack.** The Stacks tab pairs topical sildenafil cream with a tadalafil melt (two PDE5 inhibitors), and the advisor's note says not to combine the cream with ED medications. Flag this before any finder shows the stack. Owner: clinical.
- **New, Intimacy Melt formula** differs between sources. The formulary lists tadalafil 22 mg / oxytocin 50 IU / PT-141 100 mcg, while the 9/21 deck lists PT-141 strips. Confirm it before any copy names ingredients.
