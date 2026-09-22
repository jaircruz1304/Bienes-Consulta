#!/usr/bin/env python3
import json,re,sys
from pathlib import Path
p=Path(sys.argv[1] if len(sys.argv)>1 else 'data/assets.json')
d=json.loads(p.read_text(encoding='utf-8'))
assets=d.get('assets',d if isinstance(d,list) else [])
if not isinstance(assets,list) or not assets: raise SystemExit('ERROR: assets vacío o inválido')
codes=[]
for i,a in enumerate(assets,1):
    code=str(a.get('codigo') or '').strip()
    if not code: raise SystemExit(f'ERROR: registro {i} sin código')
    codes.append(code.upper())
    banned={'cedula_custodio','ruc_proveedor','CEDULA CUSTODIO','RUC DE PROVEEDOR'}
    if banned.intersection(a): raise SystemExit(f'ERROR: campo sensible publicado en {code}')
    for doc in a.get('documentos',[]):
        u=str(doc.get('url') or '')
        if u and not re.match(r'^https?://',u,re.I): raise SystemExit(f'ERROR: URL inválida en {code}: {u}')
dups=sorted({c for c in codes if codes.count(c)>1})
if dups: raise SystemExit('ERROR: códigos duplicados: '+', '.join(dups[:20]))
print(f'OK: {len(assets)} bienes; códigos únicos; sin campos sensibles prohibidos.')
