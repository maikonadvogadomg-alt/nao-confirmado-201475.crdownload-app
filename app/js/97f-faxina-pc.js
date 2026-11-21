/* =========================================================================
   Mini SK — 97f-faxina-pc.js · 🖥️ FAXINA DO APARELHO (computador e celular)
   NO COMPUTADOR (Mini SK para PC): fala com o motor faxina.cjs que o próprio programa liga.
     🔎 Olhar · 🧹 Limpar (Quarentena → esvaziar de vez) · 💽 Copiar para o HD externo (com conferência)
     💾 Backup .zip · 📦 Programas de carona · 📋 Relatório → 📎 mandar para a 🤖 IA (Ollama ou chave) e 🗣 ler com a voz
     🛡️ Reabrir como administrador (o Windows pergunta "Sim?").
     A IA também pode pedir:  FAXINA: diagnóstico   → o Mini SK olha (só olha) e devolve o relatório para ela.
   NO CELULAR: o Android não deixa nenhum app limpar o sistema (nem com administrador). Aqui o painel usa o
     📱 Termux para olhar o que ocupa espaço, achar repetidos e fazer cópia — só nas pastas que você deixa.
   Nada é apagado sem você ver: primeiro vai para a Quarentena; o "esvaziar de vez" pergunta duas vezes.
   ========================================================================= */
(function (SK) {
  'use strict';
  const E = (s) => SK.esc(String(s == null ? '' : s));
  const PC = () => window.miniskPC && window.miniskPC.faxina;
  const mb = (n) => { n = Number(n) || 0; return n < 1048576 ? Math.round(n / 1024) + ' KB' : n < 1073741824 ? (n / 1048576).toFixed(1).replace('.', ',') + ' MB' : (n / 1073741824).toFixed(2).replace('.', ',') + ' GB'; };
  let box = null, aba = 'olhar';
  const D = {}; // resultado do diagnóstico

  async function chamar(rota, corpo, seg) {
    const c = new AbortController(); const t = setTimeout(() => c.abort(), (seg || 30) * 1000);
    try {
      const r = await fetch('http://127.0.0.1:' + window.miniskPC.faxina + rota, { method: corpo ? 'POST' : 'GET', headers: { 'Content-Type': 'application/json', 'X-Codigo': window.miniskPC.codigo || '' }, body: corpo ? JSON.stringify(corpo) : undefined, signal: c.signal });
      const j = await r.json(); if (j && j.erro) throw new Error(j.erro); return j;
    } catch (e) { if (e.name === 'AbortError') throw new Error('demorou demais'); if (/Failed to fetch/i.test(e.message)) throw new Error('o motor da faxina não respondeu — feche e abra o Mini SK de novo'); throw e; } finally { clearTimeout(t); }
  }

  // ── 🔎 diagnóstico (só olha) ──
  async function diagnosticar(progresso) {
    const passos = [
      ['espaço no disco', async () => { const r = await chamar('/espaco', null, 20); D.discos = r.discos; D.antivirus = r.antivirus; }],
      ['lixo temporário', async () => { D.lixo = (await chamar('/lixo', {}, 60)).pastas; }],
      ['pastas node_modules', async () => { D.nodeModules = (await chamar('/node-modules', {}, 40)).pastas; }],
      ['Downloads grandes', async () => { const p = await chamar('/pastas-comuns', null, 10); const dl = (p.pastas || []).find((x) => x.nome === 'Downloads'); if (dl) D.downloads = await chamar('/grandes', { pasta: dl.caminho }, 30); }],
      ['arquivos repetidos', async () => { D.duplicados = (await chamar('/duplicados', {}, 45)).familias; }],
      ['programas instalados', async () => { D.programas = (await chamar('/programas', null, 40)).programas; D.inicializacao = (await chamar('/inicializacao', null, 30)).itens; }],
    ];
    D.quando = new Date().toLocaleString('pt-BR'); D.erros = [];
    for (let i = 0; i < passos.length; i++) { if (progresso) progresso(i, passos.length, passos[i][0]); try { await passos[i][1](); } catch (e) { D.erros.push(passos[i][0] + ': ' + e.message); } }
    return relatorio();
  }
  const somaLixo = () => (D.lixo || []).filter((p) => p.limpavel).reduce((s, p) => s + p.tamanho, 0);
  const somaNM = () => (D.nodeModules || []).reduce((s, x) => s + x.tamanho, 0);
  const somaDup = () => (D.duplicados || []).reduce((s, f) => s + f.tamanho * (f.arquivos.length - 1), 0);
  const SUSPEITO = /(toolbar|search ?(bar|protect|app)|coupon|shopping|web ?companion|driver ?(booster|updater|pack)|pc ?(accelerat|speedup|optimiz|cleaner|boost|tuneup|fixer)|registry|wondershare|mcafee|avast|avg|norton|advanced ?systemcare|iobit|yandex|baidu|opencandy|babylon|conduit|mindspark)/i;
  function relatorio() {
    if (!D.quando) return '';
    const L = ['# 🖥️ Relatório da Faxina do computador', '', 'Feito em: ' + D.quando, ''];
    if (D.discos) { L.push('## 💽 Disco'); D.discos.forEach((x) => L.push('- ' + x.letra + ': ' + x.livreGB + ' GB livres de ' + x.totalGB + ' GB (' + x.usadoPct + '% usado)' + (x.usadoPct >= 90 ? ' ⚠ QUASE CHEIO' : ''))); if (D.antivirus && D.antivirus.length) L.push('- Antivírus ativo: ' + D.antivirus.join(', ')); L.push(''); }
    L.push('## ✅ Dá para liberar ~' + mb(somaLixo() + somaNM() + somaDup()), '- lixo temporário: ' + mb(somaLixo()), '- node_modules: ' + mb(somaNM()), '- repetidos: ' + mb(somaDup()), '');
    if (D.lixo) { L.push('## 🧹 Lixo temporário'); D.lixo.forEach((p) => L.push('- ' + p.nome + ': ' + mb(p.tamanho) + (p.limpavel ? '' : ' (só aviso)'))); L.push(''); }
    if (D.nodeModules && D.nodeModules.length) { L.push('## 📦 node_modules (' + D.nodeModules.length + ')'); D.nodeModules.slice(0, 20).forEach((x) => L.push('- ' + mb(x.tamanho) + ' — ' + x.caminho)); L.push(''); }
    if (D.downloads && D.downloads.maiores) { L.push('## ⬇️ Maiores em Downloads'); D.downloads.maiores.slice(0, 15).forEach((m) => L.push('- ' + mb(m.size) + ' — ' + m.p)); L.push(''); }
    if (D.duplicados && D.duplicados.length) { L.push('## 👯 Repetidos (' + D.duplicados.length + ' grupos)'); D.duplicados.slice(0, 15).forEach((f) => { L.push('- ' + mb(f.tamanho) + ' cada:'); f.arquivos.forEach((p) => L.push('  - ' + p)); }); L.push(''); }
    if (D.programas) { const s = D.programas.filter((p) => SUSPEITO.test(p.nome + ' ' + (p.fabricante || ''))); L.push('## 📦 Programas instalados: ' + D.programas.length); if (s.length) { L.push('Possíveis "de carona":'); s.forEach((p) => L.push('- ⚠ ' + p.nome + (p.fabricante ? ' — ' + p.fabricante : ''))); } L.push(''); }
    if (D.inicializacao && D.inicializacao.length) { L.push('## 🚀 Liga junto com o Windows (' + D.inicializacao.length + ')'); D.inicializacao.slice(0, 25).forEach((x) => L.push('- ' + x.nome)); L.push(''); }
    if (D.erros && D.erros.length) { L.push('## ⚠ O que não deu para olhar'); D.erros.forEach((e) => L.push('- ' + e)); L.push(''); }
    L.push('_Nada foi apagado. A limpeza manda para a Quarentena; o "esvaziar de vez" é você que aperta._');
    return L.join('\n');
  }
  function mandarParaIA(titulo, texto, pergunta) {
    SK.app.openSide('ai');
    setTimeout(() => { const i = SK.$('#ai-in'); if (!i) return SK.copy(texto); i.value = '### ' + titulo + '\n\n' + texto + '\n\n---\n' + (pergunta || 'Me explique em português simples o que dá para limpar, o que é perigoso mexer e o que você recomenda fazer primeiro.'); i.focus(); SK.toast('📎 O relatório foi para a caixa da IA. Toque em enviar.'); }, 150);
  }

  // ── tela ──
  function build(container) { box = container; pintar(); }
  function pintar() {
    if (!box) return;
    if (!PC()) return pintarCelular();
    const abas = [['olhar', '🔎 Olhar'], ['limpar', '🧹 Limpar'], ['hd', '💽 Copiar p/ HD'], ['zip', '💾 Backup .zip'], ['prog', '📦 Programas'], ['rel', '📋 Relatório']];
    box.innerHTML = '<div id="fp-admin" class="muted small">verificando administrador…</div>' +
      '<div class="row wrap" style="margin:6px 0">' + abas.map(([k, t]) => '<button class="btn small' + (aba === k ? ' primary' : '') + '" data-fp="' + k + '">' + t + '</button>').join('') + '</div><div id="fp-corpo"></div>';
    box.querySelector('.row').onclick = (e) => { const b = e.target.closest('[data-fp]'); if (b) { aba = b.dataset.fp; pintar(); } };
    window.miniskPC.souAdmin && window.miniskPC.souAdmin().then((adm) => { const a = SK.$('#fp-admin', box); if (!a) return; a.innerHTML = adm ? '🛡️ <b>Aberto como administrador</b> — posso fazer a faxina completa.' : '🛡️ Sem administrador: eu vejo tudo, mas algumas pastas do Windows só mexo como administrador. <button class="btn small" id="fp-elevar">🛡️ Reabrir como administrador</button>'; const el = SK.$('#fp-elevar', box); if (el) el.onclick = async () => { if (!(await SK.confirm('O Mini SK vai fechar e abrir de novo como administrador. O Windows vai perguntar "Sim?". Os seus projetos ficam salvos.', { okText: 'Reabrir' }))) return; window.miniskPC.elevar(); }; }).catch(() => {});
    ({ olhar: telaOlhar, limpar: telaLimpar, hd: telaHD, zip: telaZip, prog: telaProg, rel: telaRel })[aba]();
  }
  const corpo = (h) => { const c = SK.$('#fp-corpo', box); c.innerHTML = h; return c; };

  function telaOlhar() {
    if (!D.quando) {
      const c = corpo('<p>Eu olho o computador e digo, em palavras simples, o que dá para limpar. <b>Só olho — não mexo em nada.</b></p><button class="btn primary" id="fp-ir" style="width:100%">🔎 Olhar o meu computador agora</button><p class="muted small">Dica: a 🤖 IA também pode pedir isso sozinha (ela escreve FAXINA: diagnóstico).</p>');
      SK.$('#fp-ir', c).onclick = rodar; return;
    }
    const disco = (D.discos || [])[0];
    const c = corpo('<p class="small">✅ Olhei em ' + E(D.quando) + '</p>' + (disco && disco.usadoPct >= 90 ? '<p class="bad-txt small">⚠ O disco ' + E(disco.letra) + ' está ' + disco.usadoPct + '% cheio.</p>' : '') +
      '<p>Dá para liberar uns <b>' + mb(somaLixo() + somaNM() + somaDup()) + '</b> sem perder nada seu:</p><ul class="small"><li>🧹 lixo temporário: ' + mb(somaLixo()) + '</li><li>📦 node_modules: ' + mb(somaNM()) + '</li><li>👯 repetidos: ' + mb(somaDup()) + '</li></ul>' +
      '<div class="row wrap"><button class="btn primary" data-ir="limpar">🧹 Limpar</button><button class="btn" data-ir="rel">📋 Relatório / 🤖 IA</button><button class="btn small" id="fp-de-novo">🔄 Olhar de novo</button></div>');
    c.querySelectorAll('[data-ir]').forEach((b) => { b.onclick = () => { aba = b.dataset.ir; pintar(); }; });
    SK.$('#fp-de-novo', c).onclick = rodar;
  }
  async function rodar() {
    const c = corpo('<p class="muted" id="fp-prog">começando…</p>');
    await diagnosticar((i, n, nome) => { const p = SK.$('#fp-prog', c); if (p) p.textContent = '🔎 ' + (i + 1) + ' de ' + n + ': olhando ' + nome + '… (pode demorar, é só esperar)'; });
    SK.toast('✅ Terminei de olhar'); aba = 'olhar'; pintar();
  }

  function telaLimpar() {
    if (!D.quando) { const c = corpo('<p>Faça o 🔎 Olhar primeiro.</p><button class="btn primary" id="fp-ir">🔎 Olhar agora</button>'); SK.$('#fp-ir', c).onclick = rodar; return; }
    const marc = new Set();
    let h = '<p class="small ok-txt">🛟 Limpar aqui <b>não apaga</b>: vai para a gaveta <b>Quarentena</b>. Você confere e, se quiser, esvazia de vez lá embaixo.</p>';
    if ((D.lixo || []).some((p) => p.limpavel && p.tamanho)) h += '<p class="small"><b>🧹 Lixo temporário</b> — o Windows recria sozinho, é seguro.</p>' + D.lixo.filter((p) => p.limpavel && p.tamanho).map((p, i) => '<label class="chk"><input type="checkbox" data-k="lx' + i + '" data-p="' + E(p.caminho) + '"> ' + E(p.nome) + ' · ' + mb(p.tamanho) + '</label>').join('<br>');
    if ((D.nodeModules || []).length) h += '<p class="small" style="margin-top:8px"><b>📦 node_modules</b> — peças de projetos; voltam com "npm install".</p>' + D.nodeModules.slice(0, 40).map((x, i) => '<label class="chk"><input type="checkbox" data-k="nm' + i + '" data-p="' + E(x.caminho) + '"> ' + E(x.caminho) + ' · ' + mb(x.tamanho) + '</label>').join('<br>');
    if ((D.duplicados || []).length) h += '<p class="small" style="margin-top:8px"><b>👯 Repetidos</b> — a ⭐ fica; marque as cópias.</p>' + D.duplicados.slice(0, 40).map((f, g) => '<div class="small" style="margin:4px 0">' + mb(f.tamanho) + ' cada:<br>⭐ ' + E(f.arquivos[0]) + '<br>' + f.arquivos.slice(1).map((p, j) => '<label class="chk"><input type="checkbox" data-k="dp' + g + '_' + j + '" data-p="' + E(p) + '"> cópia: ' + E(p) + '</label>').join('<br>') + '</div>').join('');
    h += '<div class="row wrap" style="margin-top:8px"><button class="btn primary" id="fp-mover">🧹 Mandar os marcados para a Quarentena</button></div>' +
      '<hr><p class="small"><b>🗑️ Esvaziar a Quarentena (apaga de vez)</b> — só depois de conferir. Só mexe dentro da gaveta.</p><div id="fp-qt" class="muted small"></div><div class="row wrap"><button class="btn small" id="fp-abrir-qt">📂 Abrir a gaveta</button><button class="btn small danger" id="fp-esvaziar">🗑️ Esvaziar de vez</button></div>';
    const c = corpo(h);
    c.addEventListener('change', (e) => { const t = e.target.closest('[data-k]'); if (t) (t.checked ? marc.add(t.dataset.p) : marc.delete(t.dataset.p)); });
    const verQt = async () => { try { const r = await chamar('/ver-quarentena', null, 20); SK.$('#fp-qt', c).textContent = r.itens.length ? 'Na gaveta: ' + r.itens.length + ' item(ns) · ' + mb(r.itens.reduce((s, x) => s + x.tamanho, 0)) : 'A gaveta está vazia.'; SK.$('#fp-esvaziar', c).disabled = !r.itens.length; D.gaveta = r.pasta; } catch (e) { SK.$('#fp-qt', c).textContent = e.message; } };
    verQt();
    SK.$('#fp-mover', c).onclick = async () => {
      if (!marc.size) return SK.toast('Marque pelo menos um', 'error');
      if (!(await SK.confirm('Mandar ' + marc.size + ' item(ns) para a Quarentena? (não apaga — fica na gaveta)', { okText: 'Mandar' }))) return;
      try { const r = await chamar('/quarentena', { itens: [...marc] }, 300); SK.toast('✅ ' + r.feito.length + ' foram para a gaveta' + (r.erros.length ? ' · ' + r.erros.length + ' não deu (em uso ou sem permissão)' : '')); const foi = new Set(r.feito.map((x) => x.de)); D.nodeModules = (D.nodeModules || []).filter((x) => !foi.has(x.caminho)); D.duplicados = (D.duplicados || []).map((f) => Object.assign({}, f, { arquivos: f.arquivos.filter((p) => !foi.has(p)) })).filter((f) => f.arquivos.length > 1); telaLimpar(); } catch (e) { SK.toast(e.message, 'error'); }
    };
    SK.$('#fp-abrir-qt', c).onclick = () => chamar('/abrir-pasta', { caminho: D.gaveta || '' }).catch(() => {});
    SK.$('#fp-esvaziar', c).onclick = async () => {
      if (!(await SK.confirm('ATENÇÃO: isto apaga DE VEZ tudo que está na Quarentena. Não dá para desfazer. Você já conferiu?', { okText: 'Já conferi', danger: true }))) return;
      if (!(await SK.confirm('Tem certeza mesmo? Vou apagar para sempre o que está na gaveta.', { okText: 'Apagar de vez', danger: true }))) return;
      try { const r = await chamar('/esvaziar', {}, 600); SK.toast('🗑️ Apaguei ' + r.apagados + ' item(ns) · ' + mb(r.bytes) + ' liberados'); verQt(); } catch (e) { SK.toast(e.message, 'error'); }
    };
  }

  async function telaHD() {
    const c = corpo('<p>Copia as suas pastas para o <b>HD externo</b> (ou pen drive) e <b>confere</b> se chegou tudo inteiro. Não apaga nada do computador — depois de conferir, você decide se manda os originais para a 🧹 Quarentena.</p><p class="muted small">Ligue o HD externo no computador antes. Se ele não aparecer, toque em 🔄.</p><div id="fp-un" class="small">procurando os discos…</div><p class="small"><b>📂 O que copiar</b></p><div id="fp-ps" class="small"></div><div class="row wrap"><input class="inp grow" id="fp-outra" placeholder="ou cole o caminho de outra pasta (ex.: C:\\Users\\voce\\Documents\\Processos)"><button class="btn small" id="fp-add">➕</button></div><button class="btn primary" id="fp-copiar" style="width:100%;margin-top:8px">💽 Copiar e conferir</button><div id="fp-hdres"></div>');
    const escolhidas = new Set(); let destino = '';
    const pintaPs = (lista) => { SK.$('#fp-ps', c).innerHTML = lista.map((p) => '<label class="chk"><input type="checkbox" data-pp="' + E(p.caminho) + '"' + (escolhidas.has(p.caminho) ? ' checked' : '') + '> ' + E(p.nome) + ' <span class="muted">(' + E(p.caminho) + ')</span></label>').join('<br>'); };
    let comuns = [];
    try { const [u, p] = await Promise.all([chamar('/unidades', null, 15), chamar('/pastas-comuns', null, 10)]); comuns = p.pastas || [];
      SK.$('#fp-un', c).innerHTML = '<b>💽 Para onde (o HD externo):</b><br>' + (u.unidades || []).filter((x) => !/^C:/i.test(x.letra)).map((x) => '<label class="chk"><input type="radio" name="fp-dest" value="' + E(x.letra + '\\') + '"> ' + E(x.letra) + ' ' + E(x.nome || '') + ' — ' + E(x.tipo) + ' · ' + x.livreGB + ' GB livres</label>').join('<br>') + ((u.unidades || []).filter((x) => !/^C:/i.test(x.letra)).length ? '' : '<span class="bad-txt">Não achei HD externo nem pen drive ligado. Ligue e toque em 🔄.</span>') + ' <button class="btn small" id="fp-re">🔄</button>';
      pintaPs(comuns);
    } catch (e) { SK.$('#fp-un', c).textContent = e.message; }
    c.addEventListener('change', (e) => { const d = e.target.closest('[name="fp-dest"]'); if (d) destino = d.value; const p = e.target.closest('[data-pp]'); if (p) (p.checked ? escolhidas.add(p.dataset.pp) : escolhidas.delete(p.dataset.pp)); });
    c.addEventListener('click', (e) => { if (e.target.id === 'fp-re') telaHD(); });
    SK.$('#fp-add', c).onclick = () => { const v = SK.$('#fp-outra', c).value.trim(); if (!v) return; comuns.push({ nome: v.split(/[\\/]/).pop() || v, caminho: v }); escolhidas.add(v); pintaPs(comuns); SK.$('#fp-outra', c).value = ''; };
    SK.$('#fp-copiar', c).onclick = async () => {
      if (!destino) return SK.toast('Escolha o HD externo', 'error'); if (!escolhidas.size) return SK.toast('Escolha pelo menos uma pasta', 'error');
      const res = SK.$('#fp-hdres', c);
      try {
        const j = await chamar('/copiar', { pastas: [...escolhidas], destino }, 30);
        const passo = async () => {
          let t; try { t = await chamar('/trabalho?id=' + j.id, null, 15); } catch (e) { res.innerHTML = '<p class="bad-txt small">' + E(e.message) + '</p>'; return; }
          const pct = t.bytes ? Math.round(t.bytesCopiados / t.bytes * 100) : 0;
          res.innerHTML = '<p class="small">' + ({ listando: '📋 Listando os arquivos…', copiando: '💽 Copiando… ' + t.copiados + ' de ' + t.total + ' (' + pct + '%) · ' + mb(t.bytesCopiados) + ' de ' + mb(t.bytes), conferindo: '🔍 Conferindo se chegou tudo…', pronto: '', erro: '❌ Deu erro.' }[t.estado] || t.estado) + '</p>';
          if (t.estado === 'pronto' || t.estado === 'erro') {
            const ok = t.conferidos === t.total && !t.erros.length;
            res.innerHTML = '<p class="small ' + (ok ? 'ok-txt' : 'bad-txt') + '">' + (ok ? '✅ Copiei e conferi <b>' + t.total + ' arquivo(s)</b> (' + mb(t.bytes) + ') para <b>' + E(t.alvo) + '</b>. Está tudo lá, inteiro.' : '⚠ Copiei ' + t.copiados + ' de ' + t.total + '. ' + t.erros.length + ' deram erro (arquivo em uso ou sem permissão) e ' + t.diferentes.length + ' não conferiram. NÃO apague os originais ainda.') + '</p>' + (t.erros.length ? '<details class="small"><summary>Ver os que deram erro</summary>' + t.erros.slice(0, 50).map((x) => E(x.p) + ' — ' + E(x.erro)).join('<br>') + '</details>' : '') + '<button class="btn small" id="fp-abrir-hd">📂 Abrir no HD</button>';
            SK.$('#fp-abrir-hd', c).onclick = () => chamar('/abrir-pasta', { caminho: t.alvo }).catch(() => {});
            return;
          }
          setTimeout(passo, 1200);
        };
        passo();
      } catch (e) { res.innerHTML = '<p class="bad-txt small">' + E(e.message) + '</p>'; }
    };
  }

  async function telaZip() {
    const c = corpo('<p>Junta pastas num arquivo <b>.zip</b> (fica em <i>Faxina-PC\\Backup</i>). Bom para mandar pela internet ou guardar na nuvem.</p><div id="fp-zps" class="small">…</div><button class="btn primary" id="fp-zip" style="width:100%;margin-top:8px">💾 Fazer o .zip</button><div id="fp-zres" class="small"></div>');
    const esc = new Set();
    try { const p = await chamar('/pastas-comuns', null, 10); SK.$('#fp-zps', c).innerHTML = (p.pastas || []).map((x) => '<label class="chk"><input type="checkbox" data-zp="' + E(x.caminho) + '"> ' + E(x.nome) + '</label>').join('<br>'); } catch (e) { SK.$('#fp-zps', c).textContent = e.message; }
    c.addEventListener('change', (e) => { const p = e.target.closest('[data-zp]'); if (p) (p.checked ? esc.add(p.dataset.zp) : esc.delete(p.dataset.zp)); });
    SK.$('#fp-zip', c).onclick = async () => { if (!esc.size) return SK.toast('Escolha pelo menos uma pasta', 'error'); SK.$('#fp-zres', c).textContent = '💾 Compactando… (pode demorar vários minutos)'; try { const r = await chamar('/backup', { pastas: [...esc] }, 1800); SK.$('#fp-zres', c).innerHTML = '✅ ' + mb(r.tamanho) + ' em <b>' + E(r.zip) + '</b>'; } catch (e) { SK.$('#fp-zres', c).textContent = '⚠ ' + e.message; } };
  }

  function telaProg() {
    if (!D.programas) { const c = corpo('<button class="btn primary" id="fp-pg">📦 Ver os programas instalados</button>'); SK.$('#fp-pg', c).onclick = async () => { corpo('<p class="muted">lendo…</p>'); try { D.programas = (await chamar('/programas', null, 40)).programas; D.inicializacao = (await chamar('/inicializacao', null, 30)).itens; } catch (e) { SK.toast(e.message, 'error'); } telaProg(); }; return; }
    const s = D.programas.filter((p) => SUSPEITO.test(p.nome + ' ' + (p.fabricante || '')));
    corpo('<p class="small">' + D.programas.length + ' programas instalados.</p>' + (s.length ? '<p class="small bad-txt">🔎 ' + s.length + ' que você talvez não reconheça (podem ter vindo de carona). Para tirar: Configurações do Windows → Aplicativos. Na dúvida, mande o relatório para a 🤖 IA antes.</p><ul class="small">' + s.map((p) => '<li>⚠ ' + E(p.nome) + (p.fabricante ? ' — ' + E(p.fabricante) : '') + '</li>').join('') + '</ul>' : '<p class="small ok-txt">✅ Nenhum nome claramente estranho.</p>') +
      (D.inicializacao && D.inicializacao.length ? '<p class="small"><b>🚀 Liga junto com o Windows (' + D.inicializacao.length + '):</b> ' + D.inicializacao.map((x) => E(x.nome)).join(' · ') + '</p>' : '') +
      '<details class="small"><summary>Ver todos</summary>' + D.programas.map((p) => E(p.nome)).join('<br>') + '</details>');
  }

  function telaRel() {
    const md = relatorio();
    if (!md) { const c = corpo('<p>Faça o 🔎 Olhar primeiro.</p><button class="btn primary" id="fp-ir">🔎 Olhar agora</button>'); SK.$('#fp-ir', c).onclick = rodar; return; }
    const c = corpo('<div class="row wrap"><button class="btn primary" id="fp-ia">📎 Mandar para a 🤖 IA</button><button class="btn" id="fp-voz">🗣 Ler o resumo</button><button class="btn" id="fp-baixar">⤓ Baixar .md</button><button class="btn small" id="fp-copiar">📋 Copiar</button></div><pre class="mono small" style="white-space:pre-wrap;max-height:50vh;overflow:auto">' + E(md) + '</pre>');
    SK.$('#fp-ia', c).onclick = () => mandarParaIA('Relatório da faxina do meu computador', md);
    SK.$('#fp-voz', c).onclick = () => { const disco = (D.discos || [])[0]; const t = 'Terminei de olhar o computador. ' + (disco ? 'O disco ' + disco.letra.replace(':', '') + ' está com ' + disco.usadoPct + ' por cento usado. ' : '') + 'Dá para liberar cerca de ' + mb(somaLixo() + somaNM() + somaDup()).replace(',', ' vírgula ') + ' sem perder nada seu. Nada foi apagado.'; if (SK.voz) SK.voz.falar(t); else SK.toast('A voz não está ligada', 'error'); };
    SK.$('#fp-baixar', c).onclick = () => SK.download('relatorio-faxina-' + new Date().toISOString().slice(0, 10) + '.md', md, 'text/markdown;charset=utf-8');
    SK.$('#fp-copiar', c).onclick = () => SK.copy(md);
  }

  // ── 📱 celular: o que o Android deixa (pelo Termux) ──
  const CMD_CEL = [
    ['🔓 Deixar o Termux ver as pastas do celular (1ª vez)', 'termux-setup-storage', 'Aparece um pedido do Android: aperte Permitir.'],
    ['📏 O que mais ocupa espaço', 'du -sh ~/storage/shared/* 2>/dev/null | sort -h | tail -15', 'Mostra as 15 pastas mais pesadas do celular.'],
    ['📥 Os maiores arquivos do Download', 'find ~/storage/shared/Download -type f -size +20M -exec du -h {} + 2>/dev/null | sort -h | tail -20', 'Arquivos com mais de 20 MB.'],
    ['👯 Repetidos no Download', 'cd ~/storage/shared/Download && find . -type f -size +100k -exec md5sum {} + 2>/dev/null | sort | awk \'{ if ($1==a) { print "REPETIDO: " $2 } a=$1 }\'', 'Lista as cópias iguaizinhas (só mostra; não apaga).'],
    ['💾 Cópia do Download num .zip (fica em MiniSK)', 'mkdir -p ~/storage/shared/MiniSK && cd ~/storage/shared && tar -czf MiniSK/backup-download-$(date +%Y%m%d).tar.gz Download && ls -lh MiniSK | tail -3', 'Junta a pasta Download num arquivo só, para levar ao computador ou ao HD.'],
  ];
  function pintarCelular() {
    const lig = SK.termux && SK.termux.ligado;
    box.innerHTML = '<p class="small">📱 <b>No celular</b>, o Android não deixa nenhum app limpar o sistema (nem com administrador — ele protege o aparelho de propósito). O que dá para fazer é olhar e copiar <b>as pastas que você deixa</b>, pelo 📱 Termux:</p>' +
      (lig ? '' : '<p class="small bad-txt">Ligue o Termux primeiro (📱 Termux → ▶ Ligar tudo). Enquanto isso, os botões copiam o comando.</p>') +
      CMD_CEL.map((x, i) => '<div style="margin:6px 0"><button class="btn small" data-cc="' + i + '">' + x[0] + '</button><div class="muted small">' + E(x[2]) + '</div></div>').join('') +
      '<p class="small">Depois, toque em <b>🤖 Perguntar à IA</b> no 📱 Termux para ela explicar o resultado. A faxina completa (apagar, copiar para o HD, programas) é no <b>Mini SK do computador</b>.</p>';
    box.addEventListener('click', (e) => { const b = e.target.closest('[data-cc]'); if (!b) return; const c = CMD_CEL[+b.dataset.cc][1]; if (SK.termux && SK.termux.ligado && SK.termux.mandar(c)) { SK.toast('▶ Mandei para o Termux'); SK.app.openSide('termux'); } else { SK.copy(c); SK.toast('📋 Comando copiado — cole no Termux'); } });
  }

  // ── a 🤖 IA pede "FAXINA: diagnóstico" ──
  async function paraIA() {
    if (!PC()) return 'A faxina do computador só funciona no Mini SK para PC. No celular, use os botões do painel 🖥️ Faxina (pelo Termux).';
    await diagnosticar(); return relatorio();
  }

  SK.faxinaPC = { build, pintar, paraIA, relatorio, get pc() { return !!PC(); } };
})(window.SK);
