# Rx Learn pages: independent compliance and evidence audit

Audited 2026-11-10. Inputs: `claims.json` (96 rows) and `rendered/*.txt` (index, peptides, ldn, nad, mots-c). Every page was read in full, including visual text, image descriptions, tap-to-open details and interactive states.

**How the checks were done.** A direct fetch of pubmed.ncbi.nlm.nih.gov failed: the host did not resolve, so it is outside this session's allowed network. Following that error's guidance, I did not try the other NCBI or DailyMed hosts. Every check below rests on search-engine extracts: abstract text, journal mirrors (Springer, Nature, Frontiers, Aging), USC and Stanford summaries, RxList and medlibrary label mirrors, and FDA and govinfo listings. Nothing is marked verified from memory. Where an extract did not contain the claim, the row is marked "Could not verify" or "Fix needed".

---

## 1. Summary

| Verdict | Count |
|---|---|
| Pass | 72 |
| Fix needed | 19 |
| Could not verify | 5 |
| **Total rows** | **96** |

By page: peptides 17 / 3 / 2 · ldn 16 / 7 / 3 · nad 21 / 6 / 0 · mots-c 18 / 3 / 0 (Pass / Fix / Could not verify).

### Top risks (most serious first)

1. **Peptide regulatory status is unclear, so it is flagged here rather than passed.** The primer names member products built on BPC-157 ("Gut Peptides Rx", "Wolverine Recovery Rx"). The MOTS-c template carries a vial strength and a cycle plan. In FDA's September 2023 503A update, BPC-157, KPV, MOTS-c and injectable GHK-Cu were placed in Category 2 ("significant safety risks"). 2026 reports say FDA intends to remove 12 peptides from Category 2. Sources say that apart from GHK-Cu, none has been moved to Category 1, and the PCAC review of BPC-157, KPV, TB-500 and MOTS-c is still pending. Regulatory/legal must confirm the current 503A status before any member page names these products. Sources: [A4PC 2023 update](https://join.a4pc.org/hubfs/PDFs/503A-Categories-Update-for-September-2023-FINAL.docx.pdf), [Frier Levitt 2026](https://www.frierlevitt.com/articles/fda-peptides-do-not-compound-list-update-2026/), [FDA PCAC briefing](https://www.fda.gov/media/193343/download).
2. **The internal template test reaches members.** The member hub (`index`) shows a "MOTS-C RX · COMING NEXT" card with "Template test. Internal only." The MOTS-c page itself says "It isn't for members", yet its footer says "Educational content for Equilibria members". It also shows a dose concentration (2 mg/mL) and a cycle plan for a Category 2 substance.
3. **Rule 4 (approved-product equivalence) on the primer.** "Tirzepatide … The active ingredient in our GLP/GIP Rx options", cited to the Mounjaro label, and "PT-141 … Also called bremelanotide … Part of Intimacy Melt Rx", cited to the Vyleesi label. Neither line says the product is compounded and not FDA-approved. Read next to FDA-label citations, both imply equivalence to Mounjaro or Vyleesi. Compounding tirzepatide after the shortage ended is also a regulatory question to flag, not assume.
4. **Some citations do not support their claims, because the same research quotes were pasted across rows.** Examples:
   - ldn-21 "Nausea or dizziness" cites Gouda 2026, but its quote names neither symptom.
   - ldn-11 cites Gouda for vivid dreams, which the Gouda extracts do not mention.
   - nad-20 cites Martens but carries a Trammell quote.
   - ldn-14 attaches study-design quotes to morning-dosing guidance that no source supports.
   - mots-c-11 attributes movement into the nucleus to Lee 2015. Extracts place that finding in Kim et al., Cell Metab 2018.
5. **Guidance that sounds like a promise, with no source.**
   - ldn-12/13: "If it's going to help, plan on giving it about that long." Trial length is not an onset window.
   - nad-20: "If you notice a change, expect it to be gradual." The data are for oral NR, not nasal NAD+, and Martens did not report felt changes.
   - index: "why levels draw attention after 40." No source gives an age-40 threshold.
6. **Tiers overstate the evidence on statements that no evidence exists.** mots-c-16 and mots-c-17 carry "Early human studies" on items that say no published human studies of MOTS-c exist; the only data are a press release on an analog. Clinician-practice notes (ldn-14) and oral-precursor data applied to a nasal product (nad-20) also carry human-study tiers.
7. **Citation titles were edited.** The LDN and MOTS-c source lists present rewritten or shortened titles in citation format, dropping words like "treatment", "fibromyalgia", "obesity and insulin resistance". Examples: Younger 2014's real title is "The use of low-dose naltrexone (LDN) as a novel anti-inflammatory treatment for chronic pain". Lee 2015's title ends "…and reduces obesity and insulin resistance". This misstates the sources. Either label these lines as descriptions or get a legal ruling on using the real titles.
8. **LDN mechanism evidence is weaker than presented.** A July 2026 correction to the Gouda review says some key mechanistic studies for ultra-low-dose naltrexone have been retracted. The rebound theory (ldn-06) rests on a narrative review in *Research Inventy*, a low-tier journal.
9. **"Wolverine Recovery Rx" uses a Marvel character name** (trademark risk), and "Recovery" next to BPC-157 leans toward an injury-repair use. This is outside the evidence rules but worth routing to legal.

---

## 2. Claim-by-claim table

Tier verdict: "OK", "should be X", or "n/a" for untiered framing copy or clinician-owned items.

### Peptides primer

| id | Verdict | Tier verdict | Reason (evidence seen) |
|---|---|---|---|
| peptides-01 | Pass | n/a | 85 FR 10057 defines protein as an alpha amino acid polymer of more than 40 aa (govinfo listing). Saying a peptide is a short chain is fair framing. |
| peptides-02 | Pass | n/a | Instructional framing. No factual claim. |
| peptides-03 | Pass | n/a | Legend. No factual claim. |
| peptides-04 | Pass | OK | The rule text confirms "greater than 40 amino acids". "a chain longer than 40 counts as a protein" matches. |
| peptides-05 | Pass | OK | Extracts give KPV as α-MSH(11–13), the C-terminal tripeptide. PMC2431115 itself was not retrieved. |
| peptides-06 | Pass | OK | GHK is a tripeptide that binds Cu(II) (quote). Pickart isolated it from human plasma in 1973 (secondary: Wikipedia, citing Pickart & Thaler 1973). The 1973 date is not in the attached quote, so add it to the record. |
| peptides-07 | **Fix needed** | OK | The sequence is Ac-Nle-cyclo[Asp-His-D-Phe-Arg-Trp-Lys]-OH, so the ring holds 6 of the 7 residues and Nle sits outside it. "Seven beads closed into a ring" is inaccurate. The source is RxList, not the FDA label. Also a rule 4 risk: see section 3. |
| peptides-08 | Pass | OK | A Cys1–Cys6 disulfide forms a six-residue ring in the nonapeptide (J Phys Chem B and Imperial extracts). PMC2689929 itself was not retrieved. |
| peptides-09 | **Could not verify** | OK | No search returned PMC13210877. Other sources confirm a 15-residue peptide from gastric juice (Pharmaceuticals 2025 review, Wikipedia), but the cited source is unconfirmed. Regulatory flag: Category 2 (2023). |
| peptides-10 | **Fix needed** | OK | 16 aa and an sORF in mitochondrial 12S rRNA are confirmed (Lee 2015 abstract). The wording "the DNA of your mitochondria" is kinship framing on the primer (rule 6). |
| peptides-11 | **Fix needed** | OK | "39-amino-acid modified peptide" is confirmed (Mounjaro label via RxList mirror). The source is a mirror, not FDA. "One short of the FDA's protein line" is loose: 40 aa is still not a protein, so 39 is two short of qualifying. Rule 4: does not say compounded or not FDA-approved. |
| peptides-12 | Pass | OK | 51 aa (A21 + B30), per the quote. Labeled "Shown for scale" (rule 6 met). |
| peptides-13 | Pass | OK | The final rule counts "all polypeptide chains that are associated with each other in a manner that occurs in nature" (govinfo and law-firm extracts), so insulin counts as a protein. |
| peptides-14 | Pass | OK | UniProt P02768 mature chain is residues 25–609, so 585 (Expasy and datasheet extracts). UniProt itself not reached. Labeled for scale. |
| peptides-15 | Pass | OK | C21H27N7O14P2, 663.4 g/mol (RCSB, American Elements). Dinucleotide. |
| peptides-16 | **Could not verify** | OK | My search returned nothing for PubChem CID 5360515 or 341.4 g/mol. Only the author's mirror check stands. |
| peptides-17 | Pass | OK | Reasonable framing. The FDA definition is about size only. |
| peptides-18 | Pass | OK | PT-141 is cyclic (lactam). Fine at this summary level. |
| peptides-19 | Pass | OK | Oxytocin ring confirmed. |
| peptides-20 | Pass | OK | GHK-Cu copper complex confirmed. |
| peptides-21 | Pass | OK | NAD+ is not an amino acid polymer (formula above). |
| peptides-22 | Pass | OK | Naltrexone is a small molecule. The claim does not depend on the MW that could not be confirmed. |

### LDN

| id | Verdict | Tier verdict | Reason (evidence seen) |
|---|---|---|---|
| ldn-01 | Pass | n/a | 50 mg once daily appears in the label trial text (quote). Hedged "researchers think". |
| ldn-02 | Pass | n/a | Toljan 2018: "LDN, considered in a daily dose of 1 to 5 mg". |
| ldn-03 | **Fix needed** | should carry "Leading theory" or be hedged | "At that size it isn't doing the standard job" states a mechanism as fact. Toljan says LDN has shown effects. Neither source says low doses fail to block opioid receptors. Dose values also lack the Pending label (rule 3). |
| ldn-04 | **Fix needed** | same | Same text as ldn-03. The label half (50 mg is the approved tablet) is supported. The unhedged "isn't doing the standard job" is not. |
| ldn-05 | Pass | OK | Half-life of 4 h, and 13 h for 6-β-naltrexol (label mirrors via ndclist and AvKare). "Illustration, not measured data" is disclosed. |
| ldn-06 | Pass | OK (Leading theory) | The Moura 2016 quote supports a compensatory rise in endorphins/enkephalins and receptors. "Most of the support … animal and cell research" is not in the quote, and the source is a low-tier journal. Add a stronger review. |
| ldn-07 | **Could not verify** | OK | TLR4 on microglia is confirmed in the Younger 2014 PMC extract. The dextro-naltrexone sentence appears in PMC text, but the search could not tie it to this review. "Researchers note the data don't fit this explanation perfectly" is in no extract; the attached L7 quote is about sample size. The Gouda 2026 correction notes that some ULDN mechanistic studies were retracted. |
| ldn-08 | Pass | OK | Younger 2014: "Published trials have low sample sizes, and few replications have been performed." |
| ldn-09 | **Fix needed** | OK | Gouda 2026 (Springer abstract): 105 studies, 15 RCTs, LDN "generally safe… well tolerated", evidence "lack[s] methodological strength". The replication point is quoted second-hand as early findings from *uncontrolled* studies "rarely replicated in placebo-controlled trials". The copy says "larger trials", which is a different claim. "Low-risk" stands in for "safe" (rule 7 spirit). The citation's volume and pages (43:2852-2870) could not be confirmed. |
| ldn-10 | Pass | OK | Younger & Mackey 2009 (Stanford release): 2 participants had vivid dreams, 1 had nausea and insomnia "during the first few nights", effects "mild and brief". |
| ldn-11 | **Could not verify** | OK | Same text, cited to Gouda 2026. No Gouda extract names vivid dreams or any specific adverse event, and the attached L8 quote is only partly verified. Cite Younger 2009 instead. |
| ldn-12 | **Fix needed** | OK | The 8-week drug phase is confirmed (Younger 2009 quote). "If it's going to help, plan on giving it about that long before judging it" is onset guidance that no source gives. Trial length is not an expected-response window. |
| ldn-13 | **Fix needed** | OK | Same text. The 12-week LDN phase in Younger 2013 is confirmed (PMC review extract: "12 weeks with LDN vis-à-vis 4 weeks with placebo"). The guidance sentence is still unsupported. |
| ldn-14 | **Fix needed** | should be untiered (clinician practice note), not "Early human studies" | "Some guidance suggests moving the dose to the morning if sleep is affected" has no source. "No study has compared bedtime and morning head to head yet" is a claim that no evidence exists, with no source. Bedtime dosing in Younger 2013 was **not** confirmed: the extracts mention evening symptom logging, not dose timing. This also edges toward dosing guidance (rule 8). |
| ldn-15 | Pass | n/a | Clinician-owned. "Pending clinician review" is shown. |
| ldn-16 | Pass | n/a | Half-lives confirmed (label mirrors). |
| ldn-17 | Pass | n/a | MDedge: "LDN is not approved by the Food and Drug Administration and must be custom compounded". Off-label is disclosed (rule 4 met). Optional precision: "No FDA-approved naltrexone product comes in these strengths." |
| ldn-18 | Pass | n/a | The label contraindications quote covers opioid analgesics, methadone and buprenorphine maintenance, and acute withdrawal. Pending label is shown at the end of the section. |
| ldn-19 | **Could not verify** | n/a | Some DailyMed naltrexone tablet labels list "acute hepatitis or liver failure". Search could not confirm the cited setid 3c7da2bc's current Contraindications section, and labels vary. The attached quote is old hepatotoxicity language and is only partly verified. |
| ldn-20 | Pass | n/a | Younger 2009: vivid dreams and insomnia in the first nights. |
| ldn-21 | **Fix needed** | n/a | "Nausea or dizziness" is cited to Gouda, but the attached quote mentions only insomnia and vivid dreams. Younger 2009 supports transient nausea. No extract found dizziness. |
| ldn-22 | Pass | n/a | Label patient information (medlibrary mirror): "If you require medical treatment, be sure to tell the treating physician that you are receiving naltrexone." The attached quote is the contraindication text, so attach this one instead. |
| ldn-23 | Pass | OK (rendered via legend) | Receptor binding at hour 0 is label-level fact. The illustration is disclosed. |
| ldn-24 | Pass | OK | Illustrative and disclosed. |
| ldn-25 | Pass | OK | Hedged: "the theory says". |
| ldn-26 | Pass | OK | Hedged: "any rebound … would be". |

### NAD+ (Energy Spray Rx)

| id | Verdict | Tier verdict | Reason (evidence seen) |
|---|---|---|---|
| nad-01 | Pass | n/a | Covarrubias 2021 abstract: coenzyme for redox reactions, and "ageing is accompanied by a gradual decline in tissue and cellular NAD+ levels … including rodents and humans". |
| nad-02 | Pass | n/a | Massudi 2012: negative correlation with age in males (r = −0.706) and females (r = −0.537). |
| nad-03 | Pass | n/a | Covarrubias abstract supports "central to energy metabolism". |
| nad-04 | Pass | n/a | Massudi supports "appear to fall". |
| nad-05 | Pass | n/a | Nat Metab 2025: "human clinical trials have shown limited efficacy". |
| nad-06 | Pass | n/a | Framing. |
| nad-07 | Pass | OK | A disclosure. |
| nad-08 | Pass | OK | Massudi. |
| nad-09 | **Fix needed** | OK | "Read it as a strong clue" overstates. Nat Metab 2025 says an age-related NAD+ decline in humans "has been consistently observed only in a limited number of studies". Massudi is one cross-sectional study of non-sun-exposed surgical skin. |
| nad-10 | Pass | OK | Covarrubias: redox coenzyme (NAD+ to NADH). Textbook-level, so Established is fair. |
| nad-11 | Pass | OK | Same source. Simplified but accurate. |
| nad-12 | Pass | OK | Covarrubias: sirtuins, CD38 and PARPs consume NAD+. |
| nad-13 | Pass | OK | Same. |
| nad-14 | **Fix needed** | OK | Massudi sample: "patients aged between 15–77 and newborn babies (0–1 year old)". "Aged from newborn to 77" implies continuous coverage of ages 1–14, which the study did not have. |
| nad-15 | Pass | OK | Nat Metab 2025 supports "only a handful". |
| nad-16 | Pass | OK | Camacho-Pereira 2016 abstract: CD38 rises with age and is "required for" NAD decline (in mice). Human adipose data are noted only in secondary sources, consistent with "still being worked out". |
| nad-17 | Pass | OK | Trammell 2016: single NR doses of 100, 300 and 1,000 mg gave dose-dependent increases in the blood NAD+ metabolome. |
| nad-18 | Pass | OK | Martens 2018: 2 × 6-week crossover, n = 30, "elevates NAD+". Do not use the 60% figure. |
| nad-19 | **Fix needed** | OK | The review says "limited efficacy", meaning trial endpoints. "The effects people actually experience" turns that into felt effects, which the review does not say. |
| nad-20 | **Fix needed** | should be "Lab and animal research" for this route, or state plainly that the human data are oral NR | "6 weeks … 30 adults" is confirmed (Martens), but the attached quote is Trammell's. "If you notice a change, expect it to be gradual" has no source, implies a change will be felt, and applies oral-NR data to nasal NAD+. |
| nad-21 | Pass | OK | An extended search found no published human intranasal NAD+ study; only rodent work. Wording note: "so what you notice is real information" frames the member as a data source (see suggested wording). |
| nad-22 | Pass | n/a | Clinician-owned. Pending label shown. |
| nad-23 | Pass | n/a | Clinician-owned. Pending label shown. |
| nad-24 | **Fix needed** | OK | One rat study is cited (Ying 2007, a brain ischemia model), but the copy says "rat studies". Brain NAD+ rose (quote). |
| nad-25 | Pass | n/a | Consistent with no human intranasal data found. |
| nad-26 | **Fix needed** | n/a | Frontiers in Aging 2026 (PMC12907335 extract): the NAD+ IV group had "moderate to severe gastrointestinal symptoms, increased heart rate, and chest pressure". **Cramping was reported in the NR group**, not the NAD+ group. "Too quickly" is an inference from participants slowing the rate. The study is retrospective, at 500 mg IV, and industry-funded (Restore Hyper Wellness, Niagen). |
| nad-27 | Pass | n/a | Clinician-owned watch item. Pending label shown. Research note N8 says nasal irritation is unsourced; acceptable as a watch item. |

### MOTS-c (internal template test)

| id | Verdict | Tier verdict | Reason (evidence seen) |
|---|---|---|---|
| mots-c-01 | Pass | n/a | Lee 2015 describes a mitochondrial-encoded, hormone-like peptide. Evidence is mostly cell and mouse. |
| mots-c-02 | Pass | n/a | No published human trial of native MOTS-c was found. |
| mots-c-03 | Pass | n/a | Reynolds 2021: muscle about 12-fold after exercise (USC and ScienceDaily). |
| mots-c-04 | Pass | n/a | Lee 2015 abstract: AMPK activation. |
| mots-c-05 | Pass | n/a | CB4211 data come only from the press release. |
| mots-c-06 | Pass | n/a | A disclosure. |
| mots-c-07 | Pass | OK | 10 young men, all male (Reynolds design extract). |
| mots-c-08 | Pass | OK | Baseline state. |
| mots-c-09 | Pass | OK | 10 sedentary young males, acute cycling. Muscle 11.9-fold. Plasma "approximately 50%" (USC summary) or about 1.5-fold. One vendor says 1.6-fold. Checking against the paper's figure is still advised. |
| mots-c-10 | Pass | OK | Lee 2015: sORF in 12S rRNA, 16 aa. |
| mots-c-11 | **Fix needed** | OK | AMPK activation and glucose/fat use are supported by Lee 2015. "Under stress it moved into the nucleus" is a Kim et al. 2018 (Cell Metab) finding, per the extracts, and is not shown in Lee 2015. Wrong citation. |
| mots-c-12 | Pass | OK | mtDNA encoding is confirmed. |
| mots-c-13 | Pass | OK | Lee 2015 mouse data (diet- and age-related metabolic effects through AMPK). |
| mots-c-14 | Pass | OK | Reynolds. |
| mots-c-15 | Pass | OK | D'Souza 2020: plasma lower and muscle about 1.5-fold higher with age, in men. |
| mots-c-16 | **Fix needed** | should be "Lab and animal research", or untiered "no human data" | The fact is right: CB4211 Phase 1a/1b, 65 healthy volunteers plus 20 in 1b, press release only. But an "Early human studies" tier on a heading that says "No published human trials of MOTS-c itself" signals evidence that does not exist. |
| mots-c-17 | **Fix needed** | should be untiered / "No human data yet" | A "What you might notice" item that says no human data exist is tiered "Early human studies" and sourced to a press release about a different molecule. |
| mots-c-18 | Pass | n/a | Clinician-owned. Pending label shown. See rules on member exposure. |
| mots-c-19 | Pass | n/a | Pending label shown. |
| mots-c-20 | Pass | n/a | Pending label shown. |
| mots-c-21 | Pass | n/a | Pending label shown. |

**Claims on rendered pages that have no claim row** (add to `claims.json`):
- index: "why levels draw attention after 40". No source. This is a fix (see section 4).
- ldn: "a decades-old medicine".
- ldn: "a medicine best known from addiction care".
- ldn: visual caption "Solid edge: naltrexone blocks opioid receptors. Established, from the FDA label."

---

## 3. Rules 3–8: violations and risks

### Rule 3: clinician-owned items must show "Pending clinician review"
- **ldn, lede and visual: dose values with no Pending label.** "Standard naltrexone is a 50 mg daily tablet. Low-dose naltrexone uses a small fraction of that." / "LDN is naltrexone at roughly 1 to 5 mg a day" / visual labels "50 mg" and "1 to 5 mg". These are literature and label values, not the member's dose, but they are dose values with no Pending label. Either add the label or say plainly that they are study ranges and that the clinician sets the member's strength.
- **ldn, route heading:** "One capsule a day, compounded for you." Frequency is stated in the heading with no Pending label. The step below it has one.
- **ldn, "Weeks, not days":** "If it's going to help, plan on giving it about that long before judging it." The Pending label is present, but this is onset and continuation guidance written as advice.
- "Clinically reviewed": **not found** anywhere. Pass.

### Rule 4: compounded and off-label
- **peptides (Tirzepatide tap detail):** "Thirty-nine beads, one short of the FDA's protein line. The active ingredient in our GLP/GIP Rx options." Cited to the Mounjaro label. It does not say the product is compounded or not FDA-approved, so it implies equivalence.
- **peptides (PT-141 tap detail):** "Also called bremelanotide. … Part of Intimacy Melt Rx." Cited to the Vyleesi label. Same issue.
- **peptides (BPC-157, MOTS-c, GHK-Cu, KPV rows):** they name products built on substances in FDA's 503A Category 2 as of 2023, and their status in 2026 is unclear. **Flagged, not passed** (see risk 1).
- LDN and NAD pages: off-label and compounded status are disclosed well ("No FDA-approved low-dose product exists…", "isn't an FDA-approved product"). Pass.

### Rule 5: no conditions as uses; theories presented as theories
- **ldn:** "Then you looked it up and found a medicine best known from addiction care." This names a condition-linked use, though for standard naltrexone rather than LDN. Low risk, but it can go.
- **ldn:** "At that size it isn't doing the standard job." A mechanism stated as fact instead of as a theory.
- **Source lists (ldn, mots-c):** rewritten or shortened titles hide condition names that appear in the real titles (Younger 2009, 2013 and 2014; Lee 2015). They should not be presented as titles. See risk 7.
- **Product names:** "Wolverine Recovery Rx" next to BPC-157 suggests an injury-recovery use. Route to legal (also a trademark question).

### Rule 6: Bead String primer
- **peptides (MOTS-c tap detail):** "Sixteen beads, coded in the DNA of your mitochondria rather than the cell's nucleus." The possessive "your" is kinship framing.
- **peptides (GHK tap detail):** "It was first isolated from human plasma in 1973." This is factual, but it reads as "your body already makes this". Low risk. Keep it if it stays neutral.
- Hub and MOTS-c page (outside the primer, same pattern): "A signal sent from your mitochondria", "A message your mitochondria send out", "a small peptide your mitochondria make". This implies natural means harmless for an injected Category 2 peptide.
- Insulin and albumin are both labeled "Shown for scale". Pass.

### Rule 7: banned words and fear mechanics
- No exact banned word appears in rendered copy (grep for treat, cure, prevent, diagnose, heal, repair, safe, proven, guaranteed; the only "safe" hits are in claims.json quotes, not rendered).
- **ldn:** "A 2026 review of 105 studies called it low-risk". This stands in for "safe" (the source says "generally safe"). Avoid safety reassurance.
- **nad, What to watch:** "people have reported cramping, nausea, chest pressure and a racing heart" on a nasal-spray page, about a different route at 500 mg IV. Borderline alarming, and partly misattributed (nad-26).
- **nad, notice item:** "so what you notice is real information." Not fear, but it casts the member as a test subject.

### Rule 8: audience is "member"; Wellness Advocates give no dosing or prescription guidance
- **index:** the member hub shows "MOTS-C RX · COMING NEXT … Template test. Internal only." Internal content is exposed to members.
- **mots-c:** "This page exists to check that a new Rx renders from a content record alone. It isn't for members." The footer says "Educational content for Equilibria members." The two contradict each other, and a dose strength (2 mg/mL) and cycle plan are visible.
- **ldn-14:** "Some guidance suggests moving the dose to the morning if sleep is affected." Unsourced dose-timing advice addressed to the member. It belongs to the clinician.
- The Wellness Advocate wording is correct on all Rx pages ("will route any dosing or prescription question to your clinician"). Pass.

---

## 4. Suggested replacement wording (every "Fix needed")

**peptides-07 (PT-141)**
> Also called bremelanotide. Seven beads, six of them closed into a ring, including two building blocks you won't find in everyday proteins. Part of Intimacy Melt Rx, a compounded preparation that is not an FDA-approved product.

Also swap the RxList URL for the FDA or DailyMed Vyleesi label.

**peptides-10 (MOTS-c)**
> Sixteen beads, coded in mitochondrial DNA rather than nuclear DNA.

**peptides-11 (Tirzepatide)**
> Thirty-nine beads, just under the FDA's 40-bead line, so it is regulated as a peptide, not a protein. Used in our compounded GLP/GIP Rx options, which are not FDA-approved products.

Regulatory/legal must confirm compounding status before publishing. Swap the globalrph URL for the FDA label.

**ldn-03 / ldn-04 (lede)**
> LDN is naltrexone at doses studied around 1 to 5 mg a day, compared with the 50 mg tablet the FDA approved. Your clinician sets your strength. Researchers think a dose this small may act differently: a short, light touch on the same receptors. The leading theory is that your body responds to the touch.

Add "Pending clinician review" to the dose figures, or keep the "studied" framing.

**ldn-09 (human studies)**
> Most human studies of LDN have been small, with few repeats. A 2026 review of 105 studies, 15 of them randomized trials, found it was generally well tolerated, but the evidence lacks methodological strength. Early positive results from uncontrolled studies were rarely repeated in placebo-controlled trials. That is the honest state of the science, and it's why a clinician decides whether it's worth trying for you.

Confirm the volume and pages; add the 2026 correction notice to the record.

**ldn-12 / ldn-13 (Weeks, not days)**
> Studies have followed LDN for 8 to 12 weeks. Your clinician will tell you when to check in on how it's going.

Keep "Pending clinician review".

**ldn-14 (Along the way)**
> Your clinician may adjust your strength or the time of day you take it. Tell them about any sleep changes.

Drop the morning-dosing and "no head-to-head study" sentences unless a source is added. Remove the "Early human studies" tier; this is a clinician note. Keep Pending.

**ldn-21 (What to watch)**
> Nausea, especially in the first few nights.[6]

Cite Younger 2009. Drop "dizziness" unless a source is found.

**nad-09 (gauge state)**
> Skin samples from older people had lower NAD+, in women and men alike. It's one study of 49 people, and few human studies have measured this, so read it as an early clue rather than the final word.

**nad-14 (mechanism)**
> In skin samples from 49 people, newborns and adults aged 15 to 77, NAD+ was lower in older skin, in women and men. Only a handful of human studies have measured this directly.

**nad-19 (mechanism)**
> Small human trials show that oral NAD+ building blocks can raise NAD+ in the blood. A 2025 review found that measurable benefits in people have been limited so far.

**nad-20 (The first weeks)**
> Studies of oral NAD+ building blocks, a different form from a nasal spray, ran for weeks: for example, 6 weeks in one trial of 30 adults. There are no human studies of nasal NAD+ yet, so your clinician will set expectations with you.

Retier to "Lab and animal research" (nasal route) and fix the attached quote to Martens. Keep Pending.

**nad-21 (Throughout), recommended but not required**
> Nasal NAD+ hasn't been studied in people yet. Tell your clinician about anything new, including nasal discomfort, headache or sleep changes.

**nad-24 (route)**
> There are no published human studies of nasal NAD+ yet. In a rat study, NAD+ given through the nose raised NAD+ levels in the brain.

**nad-26 (What to watch)**
> In one small study of NAD+ given by IV drip, a different route and a much larger dose, people reported stomach upset, a faster heart rate and chest pressure during the drip, which stopped once it ended. Nasal sprays haven't been studied this way. Tell your clinician about anything new.

Note in the record that the study is retrospective and industry-funded.

**mots-c-11 (Acts here)**
> In cells and mice, MOTS-c switched on AMPK, an energy sensor, and cells used more sugar and fat.[2] A later lab study found that under stress it moved into the nucleus.[Kim 2018]

Add Kim KH, et al. Cell Metab. 2018 as a source, or drop the sentence.

**mots-c-16 (mechanism rung)**
Keep the text. Change the tier to "Lab and animal research", or show an untiered "No human data yet" marker:
> No published human trials of MOTS-c itself. A modified version was tested in a small early trial, with results shared only in a company press release.

**mots-c-17 (To be set)**
Keep the text. Remove the "Early human studies" tier and replace it with a "No human data yet" marker. Keep Pending.

**Unregistered claim: index (NAD+ card)**
> What NAD+ actually does, why researchers are interested in how its levels change with age, and what we still don't know about a nasal spray.

**Rule 4 and 8 fixes with no claim row**
- index: remove the MOTS-c "Template test. Internal only." card from any member-facing build.
- mots-c: keep it non-public until the 503A status is cleared, and fix the contradictory member footer.
- ldn: "found a medicine best known from addiction care" → "found a medicine best known at a much higher dose, for a very different purpose."
- ldn: "called it low-risk" → "found it was generally well tolerated" (already covered in ldn-09).
- Source lists: either cite the real titles (legal call), or label each line as a description, e.g. "Younger J, Mackey S. Pain Med. 2009. Pilot study, n=10, 8 weeks."

---

### Sources consulted (search extracts)
[Gouda 2026, Springer](https://link.springer.com/article/10.1007/s12325-026-03612-5) · [Gouda correction](https://link.springer.com/article/10.1007/s12325-026-03709-x) · [s4me Gouda thread](https://s4me.info/threads/low-dose-naltrexone-what-is-the-evidence-a-narrative-review-2026-gouda.50109/) · [Massudi 2012](https://pmc.ncbi.nlm.nih.gov/articles/PMC3407129/) · [Reynolds 2021](https://www.nature.com/articles/s41467-020-20790-0) · [USC summary](https://gero.usc.edu/2021/01/20/exercise-protein-running-capacity-mice-mots-c/) · [D'Souza 2020](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7138593/) · [Lee 2015 PubMed listing](https://pubmed.ncbi.nlm.nih.gov/25738453/) · [CohBar coverage](https://www.biospace.com/cohbar-announces-positive-topline-results-from-the-phase-1a-1b-study-of-cb4211-under-development-for-nash-and-obesity) · [DailyMed naltrexone](https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=3c7da2bc-e2c1-48f6-8c3f-287119b427e2) · [naltrexone label mirror](https://ndclist.com/ndc/53401-008/label) · [medlibrary naltrexone](https://medlibrary.org/lib/rx/meds/naltrexone-hydrochloride/page/3/) · [Stanford 2009 release](https://med.stanford.edu/news/all-news/2009/04/inexpensive-drug-appears-to-relieve-fibromyalgia-pain-in-stanford-pilot-study.html) · [Younger 2013 via PMC review](https://pmc.ncbi.nlm.nih.gov/articles/PMC10189400/) · [Younger 2014](https://pmc.ncbi.nlm.nih.gov/articles/PMC3962576/) · [Martens 2018](https://doaj.org/article/c9be7355fafc4bd8a56ea5d212f30477) · [Trammell 2016](https://doaj.org/article/e34c321832984f148c714a8f86a0f42b) · [Camacho-Pereira 2016](https://pubmed.ncbi.nlm.nih.gov/27304511/) · [Nat Metab 2025](https://pubmed.ncbi.nlm.nih.gov/41083806/) · [Covarrubias 2021](https://www.nature.com/articles/s41580-020-00313-x.pdf) · [IV NAD+ 2026](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC12907335/) · [Ying 2007 coverage](https://www.sciencedaily.com/releases/2006/12/061230110309.htm) · [85 FR 10057](https://www.govinfo.gov/content/pkg/FR-2020-02-21/html/2020-03505.htm) · [Mounjaro label mirror](https://globalrph.com/rx-list/mounjaro-drug/) · [Vyleesi, RxList](https://www.rxlist.com/vyleesi-drug.htm) · [Albumin, Expasy](https://web.expasy.org/variant_pages/VAR_000513.html) · [NAD ligand, RCSB](https://www1.rcsb.org/ligand/NAD) · [GHK-Cu, Wikipedia](https://en.wikipedia.org/wiki/Copper_peptide_GHK-Cu) · [BPC-157, Wikipedia](https://en.wikipedia.org/wiki/BPC-157) · [A4PC 503A 2023](https://join.a4pc.org/hubfs/PDFs/503A-Categories-Update-for-September-2023-FINAL.docx.pdf) · [Frier Levitt 2026](https://www.frierlevitt.com/articles/fda-peptides-do-not-compound-list-update-2026/) · [FDA PCAC briefing](https://www.fda.gov/media/193343/download)


---

## 5. Resolution (added by the builder after the audit)

Claim ids above refer to the audited build; claims.json was regenerated after fixes, so ids may have shifted.

### Fixed
- peptides-07 PT-141 ring wording and compounded note
- peptides-10 MOTS-c kinship wording
- peptides-11 tirzepatide line wording and compounded note
- ldn-03/04 dose framed as studied range; clinician sets strength; theory hedged
- ldn-09 human-studies wording per 2026 review; 'low-risk' removed
- ldn-12/13 onset guidance removed
- ldn-14 unsourced timing advice removed; retiered to 'No human data yet'
- ldn-21 nausea re-sourced to Younger 2009; dizziness dropped
- nad-09 'strong clue' softened
- nad-14 sample ages corrected
- nad-19 'experience' reworded to measurable benefits
- nad-20 oral vs nasal made explicit; retiered
- nad-24 'rat studies' to 'a rat study'
- nad-26 IV study symptoms corrected (cramping removed)
- mots-c-11 nucleus sentence dropped (Kim 2018 not sourced)
- mots-c-16/17 retiered to 'No human data yet'
- hub NAD+ card: unsourced 'after 40' removed
- hub: MOTS-c moved to an Internal section
- mots-c footer no longer says members
- LDN recognition: 'addiction care' removed
- hub/MOTS-c kinship phrasing removed
- source lists: rewritten titles labeled 'description, not title'

### Still open
- Regulatory: FDA 503A Category 2 status of BPC-157, KPV, MOTS-c, GHK-Cu (Q15). Owner: legal.
- Product name 'Wolverine Recovery Rx' trademark/implied-use risk (Q16). Owner: legal.
- Swap RxList/GlobalRPh label mirrors for DailyMed URLs. Blocked: DailyMed outside session network allowlist.
- Confirm Gouda 2026 volume/pages and the July 2026 correction notice.
- Could not verify (5): BPC-157 PMC source, naltrexone MW, LDN TLR4 'mirror-image' and 'data don't fit' sentences, 2026 review support for vivid dreams, current label wording on acute hepatitis/liver failure.
- All quotes rest on search extracts; re-run audit with pubmed/pmc/dailymed/pubchem/uniprot allowed.
