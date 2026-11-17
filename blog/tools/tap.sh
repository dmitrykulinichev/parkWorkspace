#!/bin/sh
# tap.sh "<текст>" — тап по першому елементу екрана емулятора, чий text чи content-desc містить <текст> (дерево uiautomator).
# Регістр важливий як у дереві: кнопка тосту «СКАСУВАТИ» там — «Скасувати». Не знайдено — NOT FOUND і код 1.
ADB=~/Library/Android/sdk/platform-tools/adb
$ADB shell uiautomator dump /sdcard/ui.xml >/dev/null 2>&1
$ADB exec-out cat /sdcard/ui.xml > /tmp/ui.xml
python3 - "$1" <<'PY'
import sys,re,subprocess
t=sys.argv[1]; x=open('/tmp/ui.xml',encoding='utf-8').read()
for m in re.finditer(r'<node [^>]*>', x):
    n=m.group(0)
    txt=(re.search(r'text="([^"]*)"',n) or [None,''])[1]; desc=(re.search(r'content-desc="([^"]*)"',n) or [None,''])[1]
    if t in txt or t in desc:
        b=list(map(int,re.findall(r'\d+',re.search(r'bounds="([^"]*)"',n)[1])))
        cx,cy=(b[0]+b[2])//2,(b[1]+b[3])//2
        print('tap',repr(txt or desc),cx,cy)
        subprocess.run([__import__('os').path.expanduser('~/Library/Android/sdk/platform-tools/adb'),'shell','input','tap',str(cx),str(cy)])
        break
else:
    print('NOT FOUND', t); sys.exit(1)
PY
