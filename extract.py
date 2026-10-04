import re, json
with open('scratch/rendered.html', 'r', encoding='utf-8') as f:
    html = f.read()
match = re.search(r'<div id=\"root\"[^>]*>(.*)</div>\s*</body>', html, re.DOTALL)
if match:
    inner = match.group(1)
    with open('frontend/src/homeHtml.js', 'w', encoding='utf-8') as out:
        out.write('export const homeHtml = ' + json.dumps(inner) + ';\n')
else:
    print('Could not find root div')
