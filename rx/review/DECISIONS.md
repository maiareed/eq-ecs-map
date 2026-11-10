# Decisions log

One line per judgment call. Each is reversible unless noted.

## Architecture
- Content records (`rx/content/<slug>.json`) are the single source of copy. Components hold no strings; even button labels, aria labels and tier names live in `_system.json`.
- Records stay flat snake_case at the top level. Repeating groups (steps, notice items, sources) are arrays of flat objects, mapping 1:1 to Shopify metaobject list references.
- Pages fetch JSON at runtime, with no inline fallback or build step. That means they need http(s): local review uses `python3 -m http.server` in `rx/`, and Artifacts publish the JSON alongside the page.
- Copy interpolation is `{{field}}` from the same record. Dose values are fields (`dose_standard_value`, `dose_low_range`, `dose_concentration`, `dose_spray_pattern`), so a clinician change is a one-field edit.
- Visuals render at the panel's real pixel width instead of scaling a fixed 720px drawing. This keeps SVG text at true size (16 to 19px) on a 390px phone.
- The cell energy archetype always uses numbered markers in the drawing plus an HTML key below. In-drawing labels collided at every width.
- The Bead String sets the line length to the FDA's 40-amino-acid cutoff, so "spills onto a second line" reads as "counts as a protein". This replaced a vertical marker that crossed the labels.
- The body-map silhouette is lifted verbatim from the root ECS map into `rx/eq-body.js`. The root `index.html` is untouched.
- Tokens are lifted from the ECS map, with gold text darkened to #7a5f2e (fills keep #ab8c52) and dim text raised to 70% opacity. Measured contrast: dim 5.5:1+, gold 4.6:1+, plum 6.6:1+ on every light surface, and 7:1+ in dark.
- Body text is 18px. Captions, source lists and tier chips are 15 to 16px secondary text. Logged because that's below the 18px body floor by design.
- Inline footnote links stay visually small but carry a 44 by 44px hit area via negative margins. After that change, and with larger SVG hit areas on the MOTS-c signal diagram, the final Playwright pass finds zero targets under 44px, zero text under 16px, and no horizontal scroll across all 30 runs.
- Text on the LDN occupancy band uses the panel color, not white: white on dark-mode pink failed contrast.

## Evidence system
- There are 4 tiers: Established / Early human studies / Lab and animal research / Leading theory. Line style carries the tier (heavy solid / thin solid / dashed / dotted), with a persistent text label next to every item.
- The "Established" tier covers large trials, FDA labels, and settled biology (amino acid counts, NAD+'s redox role). Without that, textbook facts would have had to be labeled weaker than they are.
- In the LDN chart, the low-dose occupancy band has a dotted edge (theory) while the standard-dose band is solid. The FDA label supports the blocking, but the "brief" window at low dose is inferred.
- The LDN chart is labeled "Illustration, not measured data". Band lengths and the rebound curve are conceptual, not pharmacokinetic data.
- The NAD+ skin-by-age bars are labeled "direction, not measured amounts", because the source reports a correlation, not levels by age.
- The MOTS-c exercise bars are drawn roughly to the 11.9-fold muscle figure and labeled as a small men-only study.
- The 2026 LDN review's "low-risk but unproven" became "low-risk, with benefits not yet established", because "proven" is banned even when negated.
- Headache is left off LDN side effects. The only source found was a clinic handout, not a trial or review.
- Wording changed from "large trials are lacking" to "some early results did not hold up in larger trials", per the 2026 review.
- Citation titles that name conditions (Younger 2014, Ying 2007) are shortened to neutral descriptions, so condition names never render. The URLs still point to the papers.

## Compliance calls
- The LDN dose conflict is not resolved. The page shows only the literature range (1 to 5 mg) and the label dose (50 mg), and `dose_eq_strengths` stays "Pending clinician review". The intake's 5/15/45 mg plans vs the sheet's 0.5/1.5/4.5 mg capsules is open question Q1.
- Contraindications appear in "Not for you if" (opioids; acute hepatitis or liver failure for LDN). These are reasons to avoid, not uses, so naming them doesn't break the no-conditions rule. The whole panel carries the pending badge.
- NAD+ has no published contraindication list for the nasal route. The panel says so honestly instead of inventing one.
- Every CTA says a licensed clinician decides and sets strength. Wellness Advocates are described as handling account, orders and shipping, and routing dosing questions to the clinician.
- "Compounded" and "isn't an FDA-approved product" appear in the NAD+ CTA and the LDN route and footer, so nothing implies approval or equivalence.
- Tirzepatide and bremelanotide amino acid counts are sourced from the approved products' prescribing information, but no brand name renders on any page. Brand names appear only in source URLs.
- KPV and MOTS-c appear on the primer as molecules, without product claims. KPV is not live and MOTS-c is "coming next".
- The primer avoids kinship language. The oxytocin note doesn't say "your body makes it"; it's described structurally.
- Both CTAs link to the existing rx-alpha page. Nothing on Shopify was touched.

## Process
- Research ran in two parallel sub-agents writing `rx/review/research/*.json`. The audit is a third sub-agent that never saw the build.
- **Environment blocker:** pubmed, pmc, dailymed, pubchem, uniprot and federalregister would not load (outside the session's network allowlist). Quotes come from search-engine extracts. Every claim row says so in `status`. Fix: allow those domains in the environment's network settings and re-run the audit. Verification was not weakened: no claim is marked fully verified.
- The MOTS-c template test reuses the cell energy archetype's "signal" role. That role was designed up front, before the MOTS-c record, so the test proves content-only rendering, not unplanned flexibility. No component changes were needed when the record was written.
- Rendered copy is extracted from the live DOM, including SVG text, image descriptions, sheet details and slider states, so the banned-word grep checks what members actually see.
- The screenshots are full-page. Reduced-motion runs are light theme only (motion is theme-independent).
- Published two private Artifacts: Learn hub https://claude.ai/artifact/MAzJg6ToXue9dzGWVxLBK4 and review board https://claude.ai/artifact/1cYjZGLB5TAjGVtpJ5KUme. Both are stripped of the document skeleton per the Artifact contract. The board artifact uses compressed JPEG screenshots; the full PNGs stay in the repo.

## Redesign: LDN in the ECS map's format (after morning feedback)
- LDN now uses a story layout (`rx/eq-story.js`, `rx/eq-story.css`, archetype `receptor_story`). The ECS map's figure is the sticky stage; seven stops scroll beside it, and each stop names the figure layers it lights up. Copy still lives entirely in `content/ldn.json`.
- Evidence tiers are drawn into the figure itself. Plum points with solid rings are the established block, gold dotted waves are the rebound theory, and olive dashed stars are the lab-research immune-cell idea.
- The 24-hour lane chart became a three-ring dose clock inside stop 3. The evidence ladder in stop 6 places each LDN idea on its tier.
- Cautions, cadence, the tier legend and sources moved into one collapsed "For your clinician conversation" drawer. Tapping any footnote opens it.
- A crosslink card links back to the ECS map. In the published artifact it points to a bundled copy (`ecs-map.html`).
- The new stop copy has not been through the independent audit yet. It reuses the audited sources, but its wording is new.

## v2 data pass (2026-11-10)
- Stopped at the step 1 gate. The binding constraint is exposure: Rx has had about 400 landing sessions since its Oct 26 alpha, the pages are SEO-hidden, and the 1,700-respondent send hasn't gone out. Education can't fix that. Full write-up: `findings.md`.
- Shopify can't supply the Rx funnel past the page view. Rx items are pages, not products, so price, cart, intake and orders live in Wizlo. Order-confirmed page landings stand in for completed orders.
- Gorgias needs re-authorization (category 4). shop.myeq.com is outside the session's network allowlist (category 3), so the page records were read through the Shopify Admin API instead.
- Logged open items, not resolved: the LDN strength conflict, the 503A status (Wolverine and Gut Peptides held out as pending), the Wolverine name, the PDE5 double-up in the Intimacy Stack, and the Intimacy Melt formula mismatch.
