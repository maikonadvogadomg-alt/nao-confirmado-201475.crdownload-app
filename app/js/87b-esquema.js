/* Mini SK — 87b-esquema.js · 📐 ESQUEMA DO PROJETO + 🏷 TECNOLOGIAS (20/11)
   Lê o projeto aberto (sem IA, sem gastar nada) e:
   🏷 mostra as tecnologias que ele usa, em etiquetas coloridas (React, Express, SQLite, Neon…),
      como o CodeLens da Replit, e o comando para instalar o que ele pede;
   📐 acha as tabelas que o CÓDIGO espera (Drizzle shared/schema.ts, Prisma, arquivos .sql)
      e monta o comando que CRIA essas tabelas do jeito certo (create table if not exists —
      nunca apaga nada). Um toque leva para o 🗄 Banco já preenchido, e a 🤖 IA do banco
      passa a ver esse esquema antes de criar qualquer tabela (não inventa formato).
   (Ideia do "Caça Esquema SQL", feita para entender o esquema e não só achar os arquivos.) */
(function (SK) {
  'use strict';
  const E = SK.esc;
  // ---------- 🏷 tecnologias ----------
  const TEC = [
    ['React', '#61dafb', /"react"\s*:/], ['Vite', '#a259ff', /"vite"\s*:/], ['TypeScript', '#3178c6', /"typescript"\s*:/],
    ['Express', '#888888', /"express"\s*:/], ['Tailwind', '#38bdf8', /"tailwindcss"\s*:/], ['Drizzle', '#c5f74f', /"drizzle-orm"\s*:/],
    ['Prisma', '#5a67d8', /"@?prisma\/?client"?\s*:|"prisma"\s*:/], ['Neon', '#00e599', /"@neondatabase\/serverless"\s*:/],
    ['Postgres', '#336791', /"pg"\s*:|"postgres"\s*:/], ['SQLite', '#0f80cc', /"better-sqlite3"\s*:|"sqlite3"\s*:|"@libsql\/client"\s*:/],
    ['PGlite', '#2f6f9f', /"@electric-sql\/pglite"\s*:/], ['Supabase', '#3ecf8e', /"@supabase\/supabase-js"\s*:/],
    ['Gemini', '#8e75ff', /"@google\/(generative-ai|genai)"\s*:/], ['OpenAI', '#10a37f', /"openai"\s*:/], ['Anthropic', '#d97757', /"@anthropic-ai\/sdk"\s*:/],
    ['Electron', '#47848f', /"electron"\s*:/], ['Capacitor', '#119eff', /"@capacitor\/core"\s*:/], ['Next.js', '#000000', /"next"\s*:/],
    ['Passport (login)', '#34e27a', /"passport"\s*:/], ['Multer (envio de arquivo)', '#ff9800', /"multer"\s*:/], ['PDF', '#e53935', /"pdf-parse"|"pdfjs-dist"|"pdf-lib"/],
    ['Word', '#2b579a', /"mammoth"|"docx"\s*:/], ['ZIP', '#795548', /"jszip"|"adm-zip"|"archiver"/],
  ];
  function tecnologias() {
    const fs = SK.fs, arqs = fs.list(); const pkg = arqs.find((p) => /(^|\/)package\.json$/.test(p) && !/node_modules/.test(p));
    const txt = pkg ? fs.read(pkg) || '' : ''; const achou = TEC.filter((t) => t[2].test(txt)).map((t) => ({ nome: t[0], cor: t[1] }));
    const tem = (re) => arqs.some((p) => re.test(p));
    if (tem(/\.py$/)) achou.push({ nome: 'Python', cor: '#3776ab' });
    const req = arqs.find((p) => /requirements\.txt$/.test(p)); if (req && /flask/i.test(fs.read(req) || '')) achou.push({ nome: 'Flask', cor: '#cccccc' });
    if (!pkg && tem(/\.html?$/)) achou.push({ nome: 'HTML puro (abre sem servidor)', cor: '#e44d26' });
    let cmd = [];
    if (pkg) { cmd.push('npm install'); if (/"db:push"\s*:/.test(txt)) cmd.push('npm run db:push   (cria as tabelas — precisa do DATABASE_URL)'); if (/"dev"\s*:/.test(txt)) cmd.push('npm run dev   (liga)'); }
    if (req) cmd.push('pip install -r ' + req);
    const servidor = /"express"|"fastify"|"koa"|"@hono/.test(txt) || tem(/(^|\/)server\/(index|app)\.(t|j)s$/);
    const banco = /DATABASE_URL/.test(arqs.filter((p) => /\.(t|j)s$/.test(p) && !/node_modules/.test(p)).slice(0, 400).map((p) => fs.read(p) || '').join('\n'));
    return { achou, cmd, servidor, banco, pkg };
  }
  // ---------- 📐 esquema ----------
  function blocoEntre(s, i) { // devolve o texto entre a chave { em i e a } que fecha
    let n = 0, q = null;
    for (let j = i; j < s.length; j++) {
      const c = s[j];
      if (q) { if (c === '\\') { j++; continue; } if (c === q) q = null; continue; }
      if (c === '"' || c === "'" || c === '`') { q = c; continue; }
      if (c === '{' || c === '(' || c === '[') n++;
      else if (c === '}' || c === ')' || c === ']') { n--; if (n === 0) return s.slice(i + 1, j); }
    }
    return s.slice(i + 1);
  }
  function partirTopo(s) { const out = []; let n = 0, q = null, ini = 0; for (let j = 0; j < s.length; j++) { const c = s[j]; if (q) { if (c === '\\') { j++; continue; } if (c === q) q = null; continue; } if (c === '"' || c === "'" || c === '`') { q = c; continue; } if ('{(['.includes(c)) n++; else if ('})]'.includes(c)) n--; else if (c === ',' && n === 0) { out.push(s.slice(ini, j)); ini = j + 1; } } out.push(s.slice(ini)); return out.map((x) => x.trim()).filter(Boolean); }
  const TIPOS = { serial: 'serial', bigserial: 'bigserial', smallserial: 'smallserial', text: 'text', varchar: 'varchar', char: 'char', integer: 'integer', int: 'integer', smallint: 'smallint', bigint: 'bigint', boolean: 'boolean', timestamp: 'timestamp', date: 'date', time: 'time', json: 'json', jsonb: 'jsonb', numeric: 'numeric', decimal: 'numeric', real: 'real', doublePrecision: 'double precision', uuid: 'uuid', blob: 'bytea' };
  function drizzle(codigo, origem) {
    const tabelas = []; const vars = {};
    const re = /(?:export\s+)?const\s+(\w+)\s*=\s*(pg|sqlite|mysql)Table\s*\(\s*["'`]([\w.-]+)["'`]\s*,\s*\{/g; let m;
    while ((m = re.exec(codigo))) {
      vars[m[1]] = m[3];
      const corpo = blocoEntre(codigo, re.lastIndex - 1); const cols = [];
      for (const ent of partirTopo(corpo)) {
        const c = ent.match(/^["']?(\w+)["']?\s*:\s*(\w+)\s*\(\s*(?:["'`]([\w.-]+)["'`])?\s*,?\s*(\{[^}]*\})?\s*\)([\s\S]*)$/); if (!c) continue;
        const [, chave, fn, nomeCol, opts, cadeia] = c; let tipo = TIPOS[fn]; if (!tipo) continue;
        const o = opts || ''; const len = o.match(/length\s*:\s*(\d+)/), prec = o.match(/precision\s*:\s*(\d+)/), esc = o.match(/scale\s*:\s*(\d+)/);
        if (len && /char/.test(tipo)) tipo += '(' + len[1] + ')';
        if (tipo === 'numeric' && prec) tipo += '(' + prec[1] + (esc ? ',' + esc[1] : '') + ')';
        if (tipo === 'timestamp' && /withTimezone\s*:\s*true/.test(o)) tipo = 'timestamptz';
        if (m[2] === 'sqlite' && fn === 'integer' && /mode\s*:\s*["']boolean/.test(o)) tipo = 'boolean';
        if (m[2] === 'sqlite' && fn === 'integer' && /mode\s*:\s*["']timestamp/.test(o)) tipo = 'timestamptz';
        if (/\.array\(\)/.test(cadeia)) tipo += '[]';
        const extra = [];
        if (/\.primaryKey\(/.test(cadeia)) extra.push('primary key');
        if (m[2] === 'sqlite' && /autoIncrement\s*:\s*true/.test(o + cadeia) && /primaryKey/.test(cadeia)) tipo = 'serial';
        if (/\.notNull\(\)/.test(cadeia)) extra.push('not null');
        if (/\.unique\(\)/.test(cadeia)) extra.push('unique');
        if (/\.defaultNow\(\)/.test(cadeia)) extra.push('default now()');
        if (/\.defaultRandom\(\)/.test(cadeia)) extra.push('default gen_random_uuid()');
        const ds = cadeia.match(/\.default\(\s*sql`([^`]*)`\s*\)/); if (ds) extra.push('default ' + ds[1]);
        const d = ds ? null : cadeia.match(/\.default\(\s*([^()]*?)\s*\)/); if (d) { let v = d[1].trim(); if (/^["'`]/.test(v)) v = "'" + v.slice(1, -1).replace(/'/g, "''") + "'"; else if (/^(\{|\[)/.test(v)) v = "'" + v.replace(/'/g, "''") + "'"; extra.push('default ' + v); }
        const r = cadeia.match(/\.references\(\s*\(\)\s*=>\s*(\w+)\.(\w+)/); if (r) extra.push('references §' + r[1] + '.' + r[2]);
        cols.push({ nome: nomeCol || chave, chave, tipo, extra });
      }
      tabelas.push({ nome: m[3], var: m[1], cols, origem });
    }
    return { tabelas, vars };
  }
  function prisma(codigo, origem) {
    const tabelas = []; const modelos = [...codigo.matchAll(/model\s+(\w+)\s*\{/g)].map((x) => x[1]);
    const re = /model\s+(\w+)\s*\{([^}]*)\}/g; let m;
    const P = { String: 'text', Int: 'integer', BigInt: 'bigint', Boolean: 'boolean', DateTime: 'timestamptz', Json: 'jsonb', Float: 'double precision', Decimal: 'numeric', Bytes: 'bytea' };
    while ((m = re.exec(codigo))) {
      const mapa = m[2].match(/@@map\(\s*"([^"]+)"/); const cols = [];
      for (const l of m[2].split('\n')) {
        const c = l.trim().match(/^(\w+)\s+(\w+)(\[\])?(\?)?\s*(.*)$/); if (!c || c[1].startsWith('@@')) continue;
        if (modelos.includes(c[2])) continue; let tipo = P[c[2]]; if (!tipo) continue; const a = c[5] || '', extra = [];
        if (/@default\(autoincrement\(\)\)/.test(a)) tipo = 'serial';
        if (c[3]) tipo += '[]';
        if (/@id\b/.test(a)) extra.push('primary key');
        if (!c[4] && !/@id\b/.test(a)) extra.push('not null');
        if (/@unique\b/.test(a)) extra.push('unique');
        if (/@default\(now\(\)\)/.test(a)) extra.push('default now()');
        if (/@default\((uuid|cuid)\(\)\)/.test(a)) extra.push('default gen_random_uuid()::text');
        const d = a.match(/@default\(("?[^()"]*"?)\)/); if (d && !/\(/.test(d[1])) extra.push('default ' + (d[1].startsWith('"') ? "'" + d[1].slice(1, -1) + "'" : d[1]));
        const mc = a.match(/@map\(\s*"([^"]+)"/);
        cols.push({ nome: mc ? mc[1] : c[1], tipo, extra });
      }
      tabelas.push({ nome: mapa ? mapa[1] : m[1], cols, origem });
    }
    return tabelas;
  }
  function sqlArquivos(codigo, origem) {
    return [...codigo.matchAll(/create\s+table\s+(?:if\s+not\s+exists\s+)?["`]?([\w.]+)["`]?\s*\(([\s\S]*?)\)\s*;/gi)].map((x) => ({ nome: x[1], sqlPronto: x[0].replace(/create\s+table\s+(?!if\s+not\s+exists)/i, 'create table if not exists '), cols: partirTopo(x[2]).filter((l) => !/^(primary|foreign|unique|constraint|check)\b/i.test(l)).map((l) => ({ nome: l.split(/\s+/)[0].replace(/["`]/g, ''), tipo: l.split(/\s+/).slice(1).join(' '), extra: [] })), origem }));
  }
  function lerEsquema() {
    const fs = SK.fs; const arqs = fs.list().filter((p) => !/node_modules|(^|\/)dist\//.test(p));
    let tabelas = [], vars = {};
    for (const p of arqs) {
      if (!/\.(ts|js|mjs|prisma|sql)$/.test(p)) continue;
      const t = fs.read(p); if (!t || t.length > 600000) continue;
      if (/\.(ts|js|mjs)$/.test(p) && /(pg|sqlite|mysql)Table\s*\(/.test(t)) { const r = drizzle(t, p); tabelas = tabelas.concat(r.tabelas); Object.assign(vars, r.vars); }
      else if (/\.prisma$/.test(p)) tabelas = tabelas.concat(prisma(t, p));
      else if (/\.sql$/.test(p) && !/drop\s+table/i.test(t)) tabelas = tabelas.concat(sqlArquivos(t, p));
    }
    const vistos = new Set(); tabelas = tabelas.filter((t) => (vistos.has(t.nome) ? false : vistos.add(t.nome)));
    const nomeDe = (v) => vars[v] || v;
    const q = (n) => (/^[a-z_][a-z0-9_]*$/.test(n) ? n : '"' + n.replace(/"/g, '""') + '"');
    // ordem: quem é referenciado vem antes
    const deps = (t) => (t.cols || []).flatMap((c) => c.extra.filter((x) => x.startsWith('references §')).map((x) => nomeDe(x.slice(12).split('.')[0])));
    const ordem = []; const feito = new Set(); const visita = (t, pilha) => { if (feito.has(t.nome) || pilha.has(t.nome)) return; pilha.add(t.nome); deps(t).forEach((d) => { const o = tabelas.find((x) => x.nome === d); if (o) visita(o, pilha); }); feito.add(t.nome); ordem.push(t); };
    tabelas.forEach((t) => visita(t, new Set()));
    const sql = ordem.map((t) => t.sqlPronto ? t.sqlPronto : 'create table if not exists ' + q(t.nome) + ' (\n' + t.cols.map((c) => '  ' + q(c.nome) + ' ' + c.tipo + (c.extra.length ? ' ' + c.extra.map((x) => (x.startsWith('references §') ? (() => { const [v, k] = x.slice(12).split('.'); const alvo = tabelas.find((y) => y.nome === nomeDe(v)); const col = alvo && alvo.cols.find((cc) => cc.chave === k); return 'references ' + q(nomeDe(v)) + '(' + q(col ? col.nome : k) + ')'; })() : x)).join(' ') : '')).join(',\n') + '\n);').join('\n\n');
    return { tabelas: ordem, sql };
  }
  function resumoParaIA(r) { return r.tabelas.map((t) => '- ' + t.nome + ' (' + t.cols.map((c) => c.nome + ' ' + c.tipo).join(', ') + ')  ← ' + t.origem).join('\n'); }
  function abrir() {
    if (!SK.fs || !SK.fs.list().length) { SK.toast('Abra um projeto primeiro (a árvore está vazia).', 'warn'); return; }
    const tec = tecnologias(), r = lerEsquema();
    try { localStorage.setItem('sk:esquemaProjeto', r.tabelas.length ? resumoParaIA(r) : ''); } catch (e) {}
    const w = document.createElement('div'); w.className = 'modal-wrap'; w.id = 'esquema-wrap';
    w.innerHTML = '<div class="modal" style="max-width:720px;max-height:92vh;overflow:auto"><div class="row" style="justify-content:space-between;align-items:center"><b>📐 Esquema e 🏷 tecnologias do projeto</b><button class="icon-btn" data-e="x" aria-label="Fechar">✕</button></div>' +
      '<p class="small"><b>🏷 O que ele usa:</b></p><div class="row wrap" style="gap:6px">' + (tec.achou.length ? tec.achou.map((t) => '<span style="display:inline-block;padding:3px 10px;border-radius:999px;font-size:12px;font-weight:600;background:' + t.cor + '22;color:var(--fg);border:1px solid ' + t.cor + '"><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:' + t.cor + ';margin-right:5px"></span>' + E(t.nome) + '</span>').join('') : '<span class="small muted">Não reconheci (sem package.json).</span>') + '</div>' +
      (tec.servidor ? '<p class="small">⚙️ <b>Tem servidor</b>: precisa ligar (🚀 Forçar abrir no terminal). Não roda só no Netlify/GitHub Pages.</p>' : '') +
      (tec.banco ? '<p class="small">🗄 <b>Usa banco</b> (DATABASE_URL): precisa do endereço do Neon/Supabase para funcionar.</p>' : '') +
      (tec.cmd.length ? '<p class="small"><b>📦 Para instalar o que ele pede</b> (no terminal, dentro da pasta do projeto):</p><pre class="small" style="white-space:pre-wrap;background:var(--bg2,#0001);padding:8px;border-radius:8px">' + E(tec.cmd.join('\n')) + '</pre><button class="btn small" data-e="cmd">📋 Copiar os comandos</button>' : '') +
      '<hr><p class="small"><b>📐 Tabelas que o código espera:</b> ' + (r.tabelas.length ? r.tabelas.length + ' tabela(s)' : 'nenhuma achada (não tem Drizzle, Prisma nem .sql)') + '</p>' +
      (r.tabelas.length ? '<ul class="small">' + r.tabelas.map((t) => '<li><b>' + E(t.nome) + '</b> — ' + t.cols.length + ' campo(s): ' + E(t.cols.map((c) => c.nome).join(', ')) + ' <span class="muted">(' + E(t.origem) + ')</span></li>').join('') + '</ul>' +
        '<details><summary class="small">Ver o comando que cria (só cria se não existir — não apaga nada)</summary><pre class="small" style="white-space:pre-wrap;max-height:260px;overflow:auto">' + E(r.sql) + '</pre></details>' +
        '<div class="row wrap" style="gap:6px;margin-top:8px"><button class="btn small primary" data-e="banco">🗄 Criar estas tabelas no banco</button><button class="btn small" data-e="copiar">📋 Copiar o comando</button><button class="btn small" data-e="baixar">⤓ Baixar .sql</button></div>' +
        '<p class="small muted">A 🤖 IA do 🗄 Banco agora vê este esquema antes de criar tabela — assim ela não inventa formato.</p>' : '') + '</div>';
    w.addEventListener('click', (e) => {
      const b = e.target.closest('[data-e]'); if (!b && e.target !== w) return; const a = b ? b.dataset.e : 'x';
      if (a === 'x') w.remove();
      if (a === 'cmd') SK.copy ? SK.copy(tec.cmd.join('\n')) : navigator.clipboard.writeText(tec.cmd.join('\n'));
      if (a === 'copiar') SK.copy ? SK.copy(r.sql) : navigator.clipboard.writeText(r.sql);
      if (a === 'baixar') { const bl = new Blob([r.sql], { type: 'text/plain' }); const l = document.createElement('a'); l.href = URL.createObjectURL(bl); l.download = 'tabelas-do-projeto.sql'; l.click(); }
      if (a === 'banco') { try { localStorage.setItem('sk:sqlPronto', r.sql); } catch (er) {} w.remove(); SK.banco.abrir(); }
    });
    document.body.appendChild(w);
  }
  SK.esquema = { abrir, lerEsquema, tecnologias, drizzle, prisma };
  document.addEventListener('DOMContentLoaded', () => {
    const b = document.getElementById('btn-banco'); if (!b || document.getElementById('btn-esquema')) return;
    const n = document.createElement('button'); n.className = 'icon-btn'; n.id = 'btn-esquema'; n.textContent = '📐'; n.title = 'Esquema e tecnologias do projeto: o que ele usa (React, Express, SQLite…) e as tabelas certas para criar no banco'; n.setAttribute('aria-label', 'Esquema do projeto'); n.onclick = abrir; b.after(n);
  });
})(window.SK);
