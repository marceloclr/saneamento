#!/usr/bin/env python3
"""Grava no topo da página e no <title> a versão publicada (V-DDMMAAAA-HHMM, horário de Fortaleza).

Rodar logo antes do commit que publica a página, para o carimbo bater com o nome
index-DDMMAAAA-HHMM.html que essa versão vai receber quando for substituída.
Uso: python3 ferramentas/carimbar-versao.py index.html [simplificado/index.html]
"""
import re, sys
from datetime import datetime
from zoneinfo import ZoneInfo

agora = datetime.now(ZoneInfo('America/Fortaleza'))
carimbo = agora.strftime('%d%m%Y-%H%M')
legivel = agora.strftime('%d/%m/%Y, às %Hh%M')
for arq in sys.argv[1:] or ['index.html']:
    s = open(arq, encoding='utf-8').read()
    linha = re.compile(r'<span class="versao-sistema" id="versaoSistema"[^\n]*</span>')
    if not linha.search(s):
        sys.exit(f'{arq}: elemento #versaoSistema não encontrado')
    novo = ('<span class="versao-sistema" id="versaoSistema" data-versao="' + carimbo + '"'
            ' data-tip="Versão publicada em ' + legivel + ' (horário de Fortaleza).&#10;'
            'Formato: V-DDMMAAAA-HHMM. A versão anterior fica no repositório como index-DDMMAAAA-HHMM.html."'
            ' data-tip-t="Versão do sistema">V-' + carimbo + '</span>')
    s = linha.sub(lambda m: novo, s, count=1)
    # <title>: troca a versão existente ou acrescenta " · V-DDMMAAAA-HHMM" ao fim
    t = re.search(r'<title>([^<]*)</title>', s)
    if t:
        base = re.sub(r'\s*·\s*V-\d{8}-\d{4}$', '', t.group(1).rstrip())
        s = s[:t.start(1)] + base + ' · V-' + carimbo + s[t.end(1):]
    open(arq, 'w', encoding='utf-8').write(s)
    print(arq, carimbo)
