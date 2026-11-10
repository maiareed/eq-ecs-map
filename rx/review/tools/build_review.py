"""Build review artifacts from the content records.

  python3 -I rx/review/tools/build_review.py

Writes:
  rx/review/claims.json      one row per (rendered claim, source)
  rx/review/pending.json     clinician-owned items per page
  rx/review/copy-deck.md     rendered copy in reading order (needs rx/review/rendered/*.txt from extract.js)
"""
import json, os, re

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
C = os.path.join(ROOT, 'content')
R = os.path.join(ROOT, 'review')
PAGES = ['peptides', 'ldn', 'nad', 'mots-c']

# content source_id -> research claim ids (rx/review/research/*.json), so the auditor sees the quote we relied on
RESEARCH_MAP = {
    's_label_naltrexone': ['L1', 'L2', 'L3'], 's_label_naltrexone_contra': ['L9'], 's_label_naltrexone_liver': ['L10'],
    's_toljan_2018': ['L4'], 's_moura_2016': ['L5'], 's_younger_2014': ['L6', 'L7'], 's_gouda_2026': ['L7', 'L8'],
    's_younger_2009': ['L8', 'L12'], 's_younger_2013': ['L12', 'L13'], 's_mdedge_ldn': ['L11'],
    's_covarrubias_2021': ['N1', 'N2'], 's_massudi_2012': ['N3'], 's_camacho_2016': ['N4'], 's_trammell_2016': ['N5'],
    's_martens_2018': ['N5'], 's_natmetab_2025': ['N6'], 's_ying_2007': ['N7'], 's_iv_2026': ['N8'],
    's_fda_protein_2020': ['A10'], 's_kpv': ['A1'], 's_ghk': ['A2'], 's_pt141': ['A4'], 's_oxytocin': ['A3'], 's_bpc': ['A5'],
    's_lee_2015': ['M1', 'M2', 'A6'], 's_tirzepatide': ['A7'], 's_insulin': ['A8'], 's_albumin': ['A9'],
    's_nad_pubchem': ['N9'], 's_naltrexone_pubchem': ['N10'], 's_reynolds_2021': ['M3'], 's_dsouza_2020': ['M4'], 's_cohbar_2021': ['M5'],
}
TIER_LABEL = {'t1': 'Established', 't2': 'Early human studies', 't3': 'Lab and animal research', 't4': 'Leading theory'}


def research():
    out = {}
    for f in ('ldn.json', 'nad-motsc-scale.json'):
        p = os.path.join(R, 'research', f)
        if os.path.exists(p):
            for c in json.load(open(p)):
                if isinstance(c, dict) and c.get('id'):
                    out[c['id']] = c
    return out


def render(s, rec):
    s = re.sub(r'\{\{\s*([a-z0-9_]+)\s*\}\}', lambda m: str(rec.get(m.group(1), m.group(0))), str(s or ''))
    return re.sub(r'\*([^*]+)\*', r'\1', s)


def walk(rec):
    """Yield (location, text, tier, source_ids, pending) for every claim-bearing piece of copy."""
    for f in ('lede', 'reframe', 'viz_caption'):
        if rec.get(f):
            yield f, rec[f], None, rec.get(f + '_source_ids', []), False
    if rec.get('gauge_states'):
        yield 'gauge_scale_note', rec['gauge_scale_note'], rec.get('gauge_tier'), rec.get('gauge_source_ids', []), False
        for i, st in enumerate(rec['gauge_states']):
            yield f'gauge_states[{i}]', st['state_note'], rec.get('gauge_tier'), rec.get('gauge_source_ids', []), False
    if rec.get('threshold_label'):
        yield 'viz_intro', rec['viz_intro'], 't1', rec.get('threshold_source_ids', []), False
    groups = [('viz_nodes', 'node_detail'), ('scale_rows', 'row_note'), ('scale_takeaways', 'step_body'),
              ('mechanism_steps', 'step_body'), ('notice_items', 'notice_text'), ('route_steps', 'route_text'),
              ('not_for_you_if', 'item_text'), ('what_to_watch', 'item_text')]
    for g, field in groups:
        for i, it in enumerate(rec.get(g) or []):
            text = it.get(field, '')
            if g == 'scale_rows':
                text = f"{it['row_label']}: {it['count_label']}. {text}"
            pending = bool(it.get('pending_clinician')) or g in ('not_for_you_if', 'what_to_watch')
            yield f'{g}[{i}]', text, it.get('tier'), it.get('source_ids', []), pending
    for i, st in enumerate(rec.get('viz_scrub_states') or []):
        yield f'viz_scrub_states[{i}]', st['state_text'], 't4', [], False


def main():
    res = research()
    claims, pending = [], {}
    for slug in PAGES:
        rec = json.load(open(os.path.join(C, slug + '.json')))
        src = {s['source_id']: s for s in rec.get('sources', [])}
        n = 0
        pend = []
        for loc, text, tier, sids, is_pending in walk(rec):
            txt = render(text, rec)
            if is_pending:
                pend.append({'location': loc, 'text': txt})
            if not sids:
                if loc.startswith('viz_scrub_states'):
                    status = 'illustrative: restates the theory shown in the visual (see mechanism_steps)'
                elif is_pending:
                    status = 'clinician-owned: drafted, no external source'
                else:
                    status = 'no_source: instruction or framing, not a factual claim'
                n += 1
                claims.append({'id': f'{slug}-{n:02d}', 'treatment': slug, 'location': loc, 'text': txt,
                               'tier': TIER_LABEL.get(tier, 'untiered framing copy'), 'source_url': None,
                               'source_type': None, 'status': status})
                continue
            for sid in sids:
                s = src[sid]
                n += 1
                q = [{'research_id': r, 'quote': res.get(r, {}).get('quote'), 'research_status': res.get(r, {}).get('status')}
                     for r in RESEARCH_MAP.get(sid, [])]
                claims.append({'id': f'{slug}-{n:02d}', 'treatment': slug, 'location': loc, 'text': txt,
                               'tier': TIER_LABEL.get(tier, 'untiered framing copy'), 'source_id': sid,
                               'source_citation': s['citation'], 'source_url': s['url'], 'source_type': s['source_type'],
                               'research_quotes': q,
                               'status': 'draft: quote matched from search extracts; full-text check blocked (see DECISIONS)'})
        for k in ('dose_standard_value', 'dose_low_range', 'dose_eq_strengths', 'dose_concentration', 'dose_spray_pattern'):
            if k in rec:
                pend.append({'location': k, 'text': f'{k} = {rec[k]}'})
        if rec.get('cadence_pending'):
            pend.append({'location': 'cadence', 'text': f"Ships: {rec['cadence_ships']} | Re-check: {rec['cadence_recheck']} | Refills: {rec['cadence_refills']}"})
        pending[slug] = pend
    json.dump(claims, open(os.path.join(R, 'claims.json'), 'w'), indent=2, ensure_ascii=False)
    json.dump(pending, open(os.path.join(R, 'pending.json'), 'w'), indent=2, ensure_ascii=False)

    names = {'index': 'Learn hub (rx/index.html)', 'peptides': 'Bead String primer (rx/peptides.html)', 'ldn': 'LDN explainer (rx/ldn.html)',
             'nad': 'NAD+ explainer (rx/nad.html)', 'mots-c': 'MOTS-c template test (rx/mots-c.html), internal only'}
    deck = ['# Equilibria Rx Learn: copy deck', '',
            'All rendered copy, in reading order, for clinician and Kendel review. Generated from the live pages by `rx/review/tools/extract.js`.',
            'Footnote markers like [3] point to the numbered Sources list at the end of each page. "Pending clinician review" marks clinician-owned items.', '']
    for p in ['index'] + PAGES:
        f = os.path.join(R, 'rendered', p + '.txt')
        if not os.path.exists(f):
            continue
        deck += ['', '---', '', f'## {names[p]}', '', open(f).read().strip(), '']
    open(os.path.join(R, 'copy-deck.md'), 'w').write('\n'.join(deck) + '\n')
    print(len(claims), 'claim rows;', sum(len(v) for v in pending.values()), 'pending items')


if __name__ == '__main__':
    main()
