#!/usr/bin/env python3
import json, re, sys
src = sys.argv[1] if len(sys.argv)>1 else 'theme-previews/index.json'
out = sys.argv[2] if len(sys.argv)>2 else 'theme-list.txt'
data = json.load(open(src, 'r', encoding='utf-8'))
names = []
def add(name_or_file):
    if not name_or_file: return
    n = re.sub(r'\.(png|jpg|jpeg|webp)$','', name_or_file, flags=re.I)
    if n: names.append(n)
if isinstance(data, list):
    for x in data:
        if isinstance(x, str): add(x)
        elif isinstance(x, dict): add(x.get('name') or x.get('slug') or x.get('file') or x.get('image') or x.get('path'))
elif isinstance(data, dict):
    arr = data.get('files') or data.get('themes') or []
    for x in arr:
        if isinstance(x, str): add(x)
        elif isinstance(x, dict): add(x.get('name') or x.get('slug') or x.get('file') or x.get('image') or x.get('path'))
open(out,'w',encoding='utf-8').write("\n".join(names))
print(f"Wrote {len(names)} names to {out}")
