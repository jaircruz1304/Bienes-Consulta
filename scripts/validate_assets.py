#!/usr/bin/env python3
import json,re,sys
from pathlib import Path

p=Path(sys.argv[1] if len(sys.argv)>1 else 'data/assets.json')
d=json.loads(p.read_text(encoding='utf-8'))
assets=d.get('assets',d if isinstance(d,list) else [])
if not isinstance(assets,list) or not assets:
    raise SystemExit('ERROR: assets vacío o inválido')

SAFE_LOCAL = re.compile(r'^(?:\./)?assets/bienes/[A-Za-z0-9._-]+\.webp(?:\?.*)?$', re.I)
SAFE_HTTP = re.compile(r'^https?://', re.I)

def safe_href(u: str) -> bool:
    return bool(SAFE_HTTP.match(u) or SAFE_LOCAL.match(u))

codes=[]
for i,a in enumerate(assets,1):
    code=str(a.get('codigo') or '').strip()
    if not code:
        raise SystemExit(f'ERROR: registro {i} sin código')
    codes.append(code.upper())
    banned={'cedula_custodio','ruc_proveedor','CEDULA CUSTODIO','RUC DE PROVEEDOR'}
    if banned.intersection(a):
        raise SystemExit(f'ERROR: campo sensible publicado en {code}')
    photo=str(a.get('foto_url') or '')
    if photo and not SAFE_LOCAL.match(photo):
        raise SystemExit(f'ERROR: fotografía no local en {code}: {photo}')
    for doc in a.get('documentos',[]):
        u=str(doc.get('url') or '')
        if u and not safe_href(u):
            raise SystemExit(f'ERROR: URL/ruta inválida en {code}: {u}')

dups=sorted({c for c in codes if codes.count(c)>1})
if dups:
    raise SystemExit('ERROR: códigos duplicados: '+', '.join(dups[:20]))
print(f'OK: {len(assets)} bienes; códigos únicos; fotos locales; sin campos sensibles prohibidos.')
