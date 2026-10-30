"""One-off generator for templates R-013 to R-042 (Typst files plus registry entries). Kept for reference;
edit the .typ files and src/lib/resume/templates.ts directly from now on. Harbor, Field and Range were moved
to a right sidebar after generation: a left sidebar is written to the PDF first and failed the reading-order check."""
import json, re, pathlib

ROOT = pathlib.Path(__file__).resolve().parents[3]
FACES = {
    "Inter": ["Inter-400", "Inter-600", "Inter-700", "Inter-400-italic"],
    "Source Serif 4": ["SourceSerif4-400", "SourceSerif4-600", "SourceSerif4-700", "SourceSerif4-400-italic"],
    "Bricolage Grotesque": ["BricolageGrotesque-600", "BricolageGrotesque-700"],
    "IBM Plex Serif": ["IBMPlexSerif-400", "IBMPlexSerif-600", "IBMPlexSerif-700", "IBMPlexSerif-400-italic"],
    "Lato": ["Lato-400", "Lato-700", "Lato-400-italic"],
    "PT Serif": ["PTSerif-400", "PTSerif-700", "PTSerif-400-italic"],
    "PT Sans": ["PTSans-400", "PTSans-700", "PTSans-400-italic"],
    "Fira Sans": ["FiraSans-400", "FiraSans-600", "FiraSans-700", "FiraSans-400-italic"],
    "Crimson Text": ["CrimsonText-400", "CrimsonText-600", "CrimsonText-700", "CrimsonText-400-italic"],
}
ORDER = {"two-line": None, "one-line": "role-org-date", "date-gutter": "role-org-date", "org-first": "org-role-date"}

# id, name, layout line, best for, comment, options, showcase
T = [
 ("r013-margin", "Margin", "Dates in a left column, serif", "Engineers, scientists and EU applications.",
  "Dates in a narrow left column, the CurVe and moderncv pattern, set so the role still reads before its dates.",
  dict(font="PT Serif", entry="date-gutter"), ["lukas", "daniel", "tomas"]),
 ("r014-harbor", "Harbor", "Sidebar on the left, main column read first", "Software, data and marketing people with long skill lists.",
  "A left sidebar for skills and languages, the AltaCV look, with the main column first in the text.",
  dict(font="Lato", layout="side-left", heading="square", header="split", side_width="30%"), ["priya", "tomas", "hannah"]),
 ("r015-bedside", "Bedside", "Shaded section bars, accent rule under the name", "Nurses and allied health professionals.",
  "Shaded section bars and an accent rule under the name; licences and certifications read as their own section.",
  dict(font="Lato", heading="bar", header="rule"), ["lena", "emily", "fatima"]),
 ("r016-counter", "Counter", "Centred header, skills on one line", "Retail, customer service and front-of-house roles.",
  "Centred header, capital heads over a hairline, and skills run together on one line to save space.",
  dict(font="PT Sans", header="center", skills="inline"), ["jake", "carlos", "nina"]),
 ("r017-shift", "Shift", "One line per role, heading rules run to the margin", "Hospitality, warehouse and logistics roles.",
  "One line per role and headings followed by a rule to the margin; fits many short jobs on one page.",
  dict(font="Fira Sans", heading="line-after", entry="one-line", header="split"), ["fatima", "carlos", "rahul"]),
 ("r018-brief", "Brief", "Centred capitals, double-ruled heads, firm first", "Lawyers, paralegals and compliance roles.",
  "Name in centred capitals, double-ruled heads, and the firm before the role, as legal CVs are read.",
  dict(font="Crimson Text", header="center", name_upper=True, name_tracking="0.04em", heading="double-rule", entry="org-first"), ["aoife", "sarah", "robert"]),
 ("r019-folio", "Folio", "Serif, short accent rule under each head", "Finance, accounting and consulting.",
  "IBM Plex Serif with a short accent rule under each heading and contact details stacked on the right.",
  dict(font="IBM Plex Serif", header="split", heading="accent-underline"), ["ananya", "meera", "robert"]),
 ("r020-transit", "Transit", "Labels in a side column, rule under the name", "Operations, supply chain and project roles.",
  "Section labels in a side column and an accent rule under the name; reads like an operations report.",
  dict(font="Fira Sans", heading="side", header="rule", gutter="22%"), ["rahul", "fatima", "chloe"]),
 ("r021-lecture", "Lecture", "Serif, dates left, summary as a lead", "Teachers, lecturers and trainers.",
  "Crimson Text with dates in a left column and the summary set as a lead paragraph without a heading.",
  dict(font="Crimson Text", heading="bold-rule", entry="date-gutter", summary_label=None), ["emily", "mei", "maya"]),
 ("r022-atelier", "Atelier", "Display name in the accent, sidebar on the right", "Designers, architects and creative leads.",
  "Bricolage Grotesque name in the accent colour, sentence-case heads, and a right sidebar for tools.",
  dict(font="Inter", head_font="Bricolage Grotesque", layout="side-right", heading="plain", accent_name=True), ["noor", "mateo", "grace"]),
 ("r023-signal", "Signal", "Rules to the margin, skills two to a row", "Data, IT and analytics roles.",
  "Headings followed by a rule to the margin, dash bullets and skill groups two to a row.",
  dict(font="Inter", heading="line-after", skills="grid", marker="–"), ["tomas", "kwame", "daniel"]),
 ("r024-docket", "Docket", "Serif labels in a side column, organisation first", "Administration, government and office roles.",
  "PT Serif, section labels in a side column, and the organisation leading each entry.",
  dict(font="PT Serif", heading="side", entry="org-first", gutter="22%"), ["sarah", "aoife", "chloe"]),
 ("r025-ward", "Ward", "Shaded header band, shaded section bars", "Pharmacy, medical assistants and clinic staff.",
  "A shaded band behind the header and shaded section bars; calm and easy to scan on a busy ward.",
  dict(font="PT Sans", header="banner", heading="bar"), ["lena", "emily", "maya"]),
 ("r026-site", "Site", "One line per job, square markers, accent rule", "Construction, trades and electricians.",
  "One line per job, square heading markers and an accent rule under the name; built for many short contracts.",
  dict(font="Fira Sans", header="rule", heading="square", entry="one-line"), ["lukas", "fatima", "kwame"]),
 ("r027-quarter", "Quarter", "Centred serif header, dates in a left column", "Banking, audit and insurance.",
  "IBM Plex Serif, centred header and dates in a left column; the quiet layout banks expect.",
  dict(font="IBM Plex Serif", header="center", entry="date-gutter"), ["robert", "ananya", "meera"]),
 ("r028-pitch", "Pitch", "Header band, accent underlines, skills on one line", "Sales and business development.",
  "A shaded header band, accent underlines on sentence-case heads, and skills on one line so results lead.",
  dict(font="Lato", header="banner", heading="accent-underline", skills="inline"), ["jake", "omar", "nina"]),
 ("r029-campus", "Campus", "Header band, rules to the margin", "Students, graduates and interns.",
  "A shaded header band and headings that rule off to the margin; Education reads first if you put it first.",
  dict(font="Inter", header="banner", heading="line-after"), ["sneha", "arjun", "priya"]),
 ("r030-clinic", "Clinic", "Serif labels in a side column", "Doctors, dentists and clinical researchers.",
  "Source Serif labels in a side column; a medical CV runs long and each section stays easy to find.",
  dict(font="Source Serif 4", heading="side", gutter="23%"), ["mei", "lena", "emily"]),
 ("r031-tally", "Tally", "One line per role, capital heads", "Bookkeepers, accounts clerks and payroll.",
  "PT Sans, capital heads over a hairline and one line per role; dense and orderly.",
  dict(font="PT Sans", entry="one-line"), ["meera", "ananya", "sneha"]),
 ("r032-field", "Field", "Sidebar on the left, capital heads", "Field engineers, technicians and sales reps.",
  "Fira Sans with a left sidebar for certifications and skills; the main column is first in the text.",
  dict(font="Fira Sans", layout="side-left", side_width="30%"), ["kwame", "lukas", "jake"]),
 ("r033-atlas", "Atlas", "Centred header, languages in a right sidebar", "Consultants and multilingual roles.",
  "Centred header and a right sidebar that holds languages and certifications next to the history.",
  dict(font="Lato", header="center", layout="side-right"), ["nina", "tomas", "carlos"]),
 ("r034-notebook", "Notebook", "Serif, sentence-case heads, dash bullets", "Writers, journalists and editors.",
  "Crimson Text with sentence-case heads and dash bullets; reads like a well-edited page.",
  dict(font="Crimson Text", heading="plain", marker="–", head_scale=1.05), ["grace", "noor", "maya"]),
 ("r035-kernel", "Kernel", "Centred sans header, organisation first", "Software engineers and computer science students.",
  "The single-page engineering pattern in Fira Sans: centred header, ruled heads, organisation first.",
  dict(font="Fira Sans", header="center", entry="org-first", contact_sep="|"), ["daniel", "arjun", "kwame"]),
 ("r036-cadence", "Cadence", "Accent rule under the name, accent underlines", "Product and project managers.",
  "An accent rule under the name and short accent underlines on each head; outcomes lead every role.",
  dict(font="Inter", header="rule", heading="accent-underline"), ["hannah", "rahul", "sofia"]),
 ("r037-mercy", "Mercy", "Centred serif header, shaded section bars", "Social work, charities and community roles.",
  "PT Serif, a centred header and shaded section bars; warm without decoration.",
  dict(font="PT Serif", header="center", heading="bar"), ["maya", "emily", "sarah"]),
 ("r038-bench", "Bench", "Dates in a left column, rules to the margin", "Lab scientists, QA and research technicians.",
  "IBM Plex Serif with dates in a left column and heads that rule off to the margin.",
  dict(font="IBM Plex Serif", heading="line-after", entry="date-gutter"), ["mei", "lukas", "tomas"]),
 ("r039-range", "Range", "Sidebar on the left, shaded heads", "Marketing and brand managers.",
  "PT Sans with a left sidebar and shaded section bars; the main column is first in the text.",
  dict(font="PT Sans", layout="side-left", heading="bar", side_width="30%"), ["sofia", "omar", "grace"]),
 ("r040-crew", "Crew", "Centred capitals, one line per role", "Cabin crew, guest services and customer-facing roles.",
  "Name in centred capitals, heads that rule off to the margin, and one line per role.",
  dict(font="Lato", header="center", name_upper=True, name_tracking="0.03em", heading="line-after", entry="one-line"), ["carlos", "nina", "jake"]),
 ("r041-civic", "Civic", "Serif, accent rule under the name, double-ruled heads", "Public sector and government roles.",
  "Source Serif with an accent rule under the name and double-ruled heads, close to civil service CVs.",
  dict(font="Source Serif 4", header="rule", heading="double-rule"), ["sarah", "emily", "aoife"]),
 ("r042-thread", "Thread", "Display heads, contact on the right", "Fashion, retail buying and merchandising.",
  "Bricolage Grotesque heads with rules to the margin and contact details stacked on the right.",
  dict(font="Inter", head_font="Bricolage Grotesque", header="split", heading="line-after", head_scale=1.1), ["mateo", "grace", "noor"]),
]

def typ_value(v):
    if v is None: return "none"
    if isinstance(v, bool): return "true" if v else "false"
    if isinstance(v, (int, float)): return str(v)
    if isinstance(v, str):
        if re.fullmatch(r"-?[\d.]+(em|%|mm|pt)", v): return v
        if v in ("|", "–"): return "[%s]" % ("#h(0.5em)|#h(0.5em)" if v == "|" else "–")
        return json.dumps(v)
    raise ValueError(v)

reg = []
for tid, name, layout, best, comment, opts, show in T:
    no = "R-" + tid[1:4]
    kv = []
    for k, v in opts.items():
        key = k.replace("_", "-")
        if k == "contact_sep": kv.append(f"{key}: [#h(0.5em)|#h(0.5em)]"); continue
        if k == "marker": kv.append(f"{key}: [{v}]"); continue
        kv.append(f"{key}: {typ_value(v)}")
    src = f"// {no} {name}. {comment}\n#import \"kit.typ\": *\n\n#render(load(), (\n" + "".join(f"  {x},\n" for x in kv) + "))\n"
    (ROOT / "src/resume/typst" / f"{tid}.typ").write_text(src)
    faces = [opts.get("font", "Inter")] + [opts[k] for k in ("head_font",) if k in opts]
    fonts = [f for face in dict.fromkeys(faces) for f in FACES[face]]
    cols = 2 if opts.get("layout", "single") != "single" else 1
    order = ORDER[opts.get("entry", "two-line")]
    entry = f'''  {{
    id: "{tid}",
    no: "{no}",
    name: "{name}",
    layout: "{layout}",
    bestFor: "{best}",
    columns: {cols},
    fonts: {json.dumps(fonts).replace('","', '", "')},
    showcase: {json.dumps(show).replace('","', '", "')},
'''
    if order: entry += f'    order: "{order}",\n'
    entry += "    version: 1,\n  },\n"
    reg.append(entry)

p = ROOT / "src/lib/resume/templates.ts"
s = p.read_text()
marker = "]\n\nexport const DEFAULT_TEMPLATE_ID"
assert marker in s and "r013-margin" not in s
s = s.replace(marker, "".join(reg) + marker)
p.write_text(s)
print(len(T), "templates")
