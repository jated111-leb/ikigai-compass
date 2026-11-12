#!/usr/bin/env python3
"""Convert a Daily Compass issue (markdown) into inline-styled email HTML.

Usage: python3 md2email.py issue.md out.html
"""
import re, sys, html

ACC = "#8a4b08"
A_STYLE = f'style="color:{ACC};"'
H2 = ('<h2 style="font-family:Helvetica,Arial,sans-serif;text-transform:uppercase;letter-spacing:2px;'
      f'font-size:14px;color:{ACC};border-bottom:1px solid #e0d5c0;padding-bottom:6px;margin-top:34px;">{{}}</h2>')
H3 = '<h3 style="font-size:19px;margin-top:26px;margin-bottom:8px;">{}</h3>'
SECTION_NAMES = {"THE BRIEFS": "The Briefs", "RAPID FIRE": "Rapid Fire", "THE QUEUE": "The Queue", "CODA": "Coda"}


def inline(text):
    text = html.escape(text, quote=False)
    links = []

    def keep_link(m):
        links.append((m.group(1), m.group(2)))
        return f"\x00{len(links)-1}\x00"

    text = re.sub(r"\[([^\]]+)\]\(([^)\s]+)\)", keep_link, text)
    text = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", text)
    text = re.sub(r"(?<![\w*])\*(?!\s)(.+?)(?<!\s)\*(?![\w*])", r"<em>\1</em>", text)

    def put_link(m):
        label, url = links[int(m.group(1))]
        label = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", label)
        label = re.sub(r"(?<![\w*])\*(?!\s)(.+?)(?<!\s)\*(?![\w*])", r"<em>\1</em>", label)
        return f'<a href="{url}" {A_STYLE}>{label}</a>'

    return re.sub(r"\x00(\d+)\x00", put_link, text)


def main(src, dst):
    lines = open(src, encoding="utf-8").read().split("\n")
    title_m = re.match(r"#\s+The Daily Compass #(\d+)\s+[—-]\s+(.+)", lines[0])
    num, title = title_m.group(1), title_m.group(2).strip()
    # paragraphs = blocks separated by blank lines
    blocks, cur = [], []
    for ln in lines[1:]:
        if ln.strip() == "":
            if cur:
                blocks.append(cur); cur = []
        else:
            cur.append(ln)
    if cur:
        blocks.append(cur)

    out = [f'<div style="max-width:640px;margin:0 auto;padding:0 16px;font-family:Georgia,\'Times New Roman\',serif;color:#222;line-height:1.6;">',
           f'<div style="border-top:3px double {ACC};border-bottom:3px double {ACC};padding:14px 0;text-align:center;margin-bottom:6px;"><div style="font-family:Helvetica,Arial,sans-serif;font-size:15px;letter-spacing:6px;font-weight:bold;color:{ACC};">THE DAILY COMPASS</div></div>']
    cold_open_done = False
    for b in blocks:
        first = b[0].strip()
        joined = " ".join(l.strip() for l in b)
        if first == "---":
            continue
        dm = re.match(r"^\*(\w+day, .+?) · ~(\d+) minute read\*$", joined)
        if dm:
            out.append(f'<div style="text-align:center;font-size:13px;color:#777;font-style:italic;margin-bottom:26px;">&#8470; {num} &middot; {dm.group(1)} &middot; ~{dm.group(2)} min read</div>')
            out.append(f'<h1 style="text-align:center;font-size:26px;font-weight:bold;margin:0 0 20px;line-height:1.3;">{html.escape(title, quote=False)}</h1>')
            continue
        if first.startswith("## "):
            name = re.sub(r"[─\s]+", " ", first[3:]).strip()
            out.append(H2.format(SECTION_NAMES.get(name, name.title())))
            cold_open_done = True
            continue
        if first.startswith("### "):
            out.append(H3.format(inline(first[4:].strip())))
            continue
        if not cold_open_done:
            out.append(f'<p style="font-style:italic;font-size:17px;color:#333;">{inline(joined)}</p>')
            cold_open_done = True
            continue
        if joined.startswith("*Source:") and joined.endswith("*"):
            out.append(f'<p style="font-size:14px;color:#777;font-style:italic;">{inline(joined[1:-1])}</p>')
            continue
        if joined.startswith("*Reply to this email"):
            body = joined.strip("*")
            body = re.sub(r"\s+— The Daily Compass$", "", body)
            out.append(f'<div style="border-top:3px double {ACC};margin-top:30px;padding-top:14px;text-align:center;font-size:13px;color:#777;font-style:italic;">{inline(body)}<br>— The Daily Compass</div>')
            continue
        if len(b) > 1 and b[0].strip().startswith("**"):
            out.append("<p>" + inline(b[0].strip()) + "<br>" + inline(" ".join(l.strip() for l in b[1:])) + "</p>")
            continue
        out.append(f"<p>{inline(joined)}</p>")
    out.append("</div>")
    open(dst, "w", encoding="utf-8").write("\n".join(out))
    print(len("\n".join(out)))


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
