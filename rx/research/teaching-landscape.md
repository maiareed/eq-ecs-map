# How others teach peptides, NAD+ and LDN (2026-11-10)

Three parallel research passes: DTC competitors, science-education and explainer work, and medical journals plus health media. **Limit:** the session's network policy blocked direct page reads for nearly every site (competitors, PDB-101, NYT, FT, Reuters, Scientific American, NPR), so all findings come from search-result excerpts. Quotes need checking against live pages before reuse. Confidence overall: **medium**. The patterns repeat across many independent sources, but no page was read in full.

## The finding
Nobody in the category shows mechanism. No competitor draws a molecule binding a receptor, an LDN dose-over-time curve, or GLP-1 versus GIP; the most visual thing is Superpower's body-sorted peptide catalog. Learning research says that visual mechanism teaching works when it's guided and fails when it's a sandbox. Our three concepts (bead string, NAD+ shuttle with an age slider, LDN occupancy dial) are what the science-education track independently recommends. The first build failed on teaching sequence and evidence framing, not on concept choice.

## What the category does (competitors)
| Pattern | Who | Verdict |
|---|---|---|
| "Short chain of amino acids / signaling molecule" | Superpower, Defy, Hims | Correct, forgettable |
| "Mimics a hormone your body makes" (GLP-1) | Ro, Alloy, Hers | Good anchor |
| "NAD+ is in every cell, declines with age" | Hone, Midi, Superpower | Overstates the human decline |
| Long SEO articles + boilerplate compounding disclaimer | Nearly everyone | Static |
| Company-reported outcome numbers (AgelessRx "91% felt improvement", Ro's 20% calculator) | AgelessRx, Ro, Hims, Midi | Avoid |

Standouts worth borrowing:
- **Superpower** ([peptides](https://superpower.com/peptides)): evidence tiers (FDA-approved / in trials / wellness / cosmetic), peptides sorted by where they act in the body, and study counts ("35 of 36" animal or lab for BPC-157). Biohacker tone, and its pages contradict each other.
- **Midi** ([peptides for women](https://www.joinmidi.com/post/peptides-for-women), [LDN](https://www.joinmidi.com/post/low-dose-naltrexone)): menopause-native framing ("hormonal, not willpower"), says research is "limited and still emerging", promises updates. Some lines drift into drug claims ("pain relief").
- **Alloy** ([how GLP-1s work](https://get.myalloy.com/blog/how-do-glp-1s-work)): knowledge base titled as questions; estriol framed as local, not systemic. Some overreach ("reverse… high blood pressure").
- **AgelessRx** ([LDN science](https://agelessrx.com/ldn-science/)): "briefly blocks opioid receptors, followed by a rebound" is the clearest LDN line in the category. It presents the theory as settled, which a [2021 eNeuro paper](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8211470/) disputes.
- **Henry Meds** ([tablets](https://henrymeds.com/tirzepatide-tablets-sl)): most honest compounding line found ("branded trial data should not be used" to judge compounded versions).
- **Noom GLP-1 Companion**: education tied to her own experience over time, not a one-time explainer.

## How the best explainers teach (science education)
Principles that recur in the best work, with the research behind them:
1. **One idea per figure, built in order.** [Ciechanowski](https://ciechanow.ski/mechanical-watch/) isolates each part before combining; Mayer's segmenting and pre-training principles.
2. **Guided path first, sandbox last.** [Nicky Case](https://blog.ncase.me/explorable-explanations-4-more-design-patterns/) "gating"; Lowe: novices given control don't use it well and learn mostly what is visually prominent.
3. **The interaction is the claim.** [Bret Victor](https://worrydream.com/ExplorableExplanations/); [Yale Kleinlab pharmacology sliders](https://kleinlab-yale.github.io/pharm) put occupancy and effect on one 0–100% axis.
4. **Compare, don't just show.** [PDB-101 GLP-1 Molecule of the Month](https://pdb101.rcsb.org/motm/311): natural hormone and drug on the same receptor.
5. **Anchor scale to familiar objects.** Scale of the Universe; Goodsell's single-scale [Molecular Machinery](https://cdn.rcsb.org/pdb101/molecular-machinery).
6. **Jargon on demand.** HHMI BioInteractive tap-to-define terms.
7. **Say what's uncertain, visibly.** AlphaFold confidence coloring.
8. **Decorative motion hurts.** "Seductive details" reduce learning (Harp & Mayer 1997; Rey 2012 meta-analysis). Animation beats static only when it carries the content (Höffler & Leutner 2007; [Tversky et al. 2002](https://hci.stanford.edu/courses/cs448b/papers/Tversky_AnimationFacilitate_IJHCS02.pdf)).

Specific mechanics to adapt: predict-before-reveal ("drag to where you think half the receptors are blocked"); receptors as parking spots filling with dose ([Keele classroom model](https://pharmacyeducation.fip.org/pharmacyeducation/article/view/230)); a half-life strip comparing how long a natural hormone lasts with how long a drug lasts (Kurzgesagt's framing, minus its ad-like tone).

## How trusted sources explain it (journals, clinics, media)
Clearest lines found:
- **Peptide:** "A chain of two or more amino acids—building blocks of proteins… insulin is a peptide" ([Scientific American](https://www.scientificamerican.com/article/the-science-behind-the-peptide-craze/)). [Stanford](https://med.stanford.edu/news/insights/2026/08/peptides-what-does-the-science-say.html) adds the range, three to about 100. Brown Health and WebMD explain why most are injected: they're digested like food if swallowed.
- **NAD+:** "Without NAD, you wouldn't be able to turn food into energy… some cells begin using NAD more quickly than your body can replace it" ([Cleveland Clinic](https://my.clevelandclinic.org/health/body/nad-nicotinamide-adenine-dinucleotide)). [NPR](https://www.npr.org/2026/05/11/nx-s1-5813664/does-nad-live-up-the-hype) adds the honest turn: the human data are "pretty iffy."
- **LDN:** no top-tier patient-education page exists. That gap is ours to fill.

Best patterns for showing evidence to lay readers:
- **Cochrane wording ladder:** does → probably → may → "it is uncertain whether." Consumer-tested in four countries.
- **Sort by evidence type before outcome:** cells/animals → small human pilots → randomized trials → FDA approval.
- **Grade each route separately:** GHK-Cu has "genuine clinical backing, but only for topical use on skin" (BBC Science Focus).
- **Use buckets:** FDA-approved / compounded and prescribed / gray-market "research use only" ([MIT Technology Review](https://www.technologyreview.com/2026/02/23/1133522/peptides-are-everywhere-heres-what-you-need-to-know/), [Harvard Health](https://www.health.harvard.edu/staying-healthy/peptides-what-they-are-potential-benefits-and-safety-concerns)).
- **"The honest answer is: we don't know yet"** ([Cleveland Clinic on BPC-157](https://health.clevelandclinic.org/bpc-157-peptide)), paired with what is known.

What skeptical journalism says the industry gets wrong: treating rodent results as human results; implying a vial is what its label says (in one test of about 450 BPC-157 samples, some vials had none); "research use only" as cover; implying compounded GLP-1s are "the same" as Zepbound or Mounjaro; claiming NAD+ reverses aging or has proven nasal bioavailability.

Women 40+: they feel underinformed and distrust social-media "menopause gold rush" content, and clinician advice moves them most ([UCL 2025](https://www.ucl.ac.uk/news/2025/oct/call-nationwide-menopause-education-programme)). Muscle loss is the central midlife theme of GLP-1 education (JAMA Patient Page). No competitor applies a midlife lens to BPC-157, MOTS-c or NAD+.

## White space (where we can lead)
1. **Mechanism you can see and test:** nobody does it.
2. **One evidence badge on every molecule:** evidence type, route and regulatory bucket, worded on the Cochrane ladder. Nobody does it consistently.
3. **Why the route matters** (injection vs nasal vs sublingual vs troche vs topical): mentioned everywhere, explained nowhere, and it maps straight onto our product formats.
4. **LDN explained honestly:** the clearest competitor line (AgelessRx) oversells the theory, and no clinic or journal page exists.
5. **A midlife lens on the molecule pages,** not only on GLP-1s and estriol.

## Recommendation
Rebuild as **one guided lesson format applied to each molecule**, not three sandboxes. Each lesson is a short sequence of single-idea figures with copy beside them (Ciechanowski), with one predict-before-reveal moment and the free sandbox unlocked at the end (Case). Every molecule carries the same evidence badge. Add a fourth lesson that no one else has, **"Why it's a spray, a cream or a shot"**, because route is where product format and biology meet. Drop ambient decoration everywhere.

Keep from the first build: the bead chain and 40-row line-up, the NAD+ shuttle, the LDN block curve with the dotted rebound, the line-art figure. Cut: the home page's drifting particles, open-sandbox first screens, the five-enzyme cell on first view.

## Regulatory flags for counsel (secondary sources, unverified)
- **HHS interim enforcement-discretion policy (late Oct 2026)** reportedly covers six single-ingredient peptides with route limits: BPC-157, TB-500, KPV (topical/oral), MOTS-c (injection), Semax, Epitalon. Blends such as **BPC-157 + TB-500 would be outside it** ([Holland & Knight](https://www.hklaw.com/en/insights/publications/2026/11/hhs-issues-interim-enforcement-discretion-policy-for-compounding)). This bears directly on the Wolverine product.
- **PCAC July 2026** voted 8–6–1 to recommend BPC-157 for the 503A bulks list; FDA staff recommended against; the vote is non-binding ([AJMC](https://www.ajmc.com/view/fda-panel-backs-6-peptides-for-compounding)).
- **NAD+:** a [January 2026 FDA warning letter](https://www.fda.gov/inspections-compliance-enforcement-and-criminal-investigations/warning-letters/genogenix-llc-718739-01202026) says NAD+ isn't eligible for 503B compounding; 503A status is unclear.
- **GLP-1 marketing:** FDA warning letters to [Hims & Hers (Sept 2025)](https://www.fda.gov/inspections-compliance-enforcement-and-criminal-investigations/warning-letters/hims-hers-health-inc-dba-hims-716567-09092025) and 30 telehealth firms (March 2026) over "same active ingredient" style claims. Our tirzepatide education must never imply equivalence to branded drugs.
- **"Research use only" isn't a defense:** FDA letters to peptide vendors in August 2026.
