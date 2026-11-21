/* 🧹 faxina.cjs — o motor do Faxina PC, já DENTRO do programa (sem Python, sem baixar nada).
   Fica em http://127.0.0.1:7721 e só aceita pedidos deste computador (127.0.0.1) e com o código secreto.
   REGRAS DE SEGURANÇA (de propósito):
     • Diagnóstico = só OLHA (ler tamanho, listar). Nunca muda nada.
     • Faxina = MOVE para uma pasta "Quarentena" (uma gaveta). NUNCA apaga. Você confere e esvazia quando quiser.
     • Backup = copia/zipa para onde você escolher.
     • NÃO mexe no antivírus, não desliga defesa nenhuma, não se esconde de nada. É um faxineiro honesto. */
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');
const { spawnSync } = require('child_process');
const WIN = process.platform === 'win32';

const PORTA = Number(process.env.FAXINA_PORTA || 7721);
const CODIGO = process.env.FAXINA_CODIGO || '';
let log = () => {};

// ── ferramentas de arquivo (puro Node: funciona igual no Windows) ──────────────
function tamanhoPasta(dir, limiteMs) {
  const fim = Date.now() + (limiteMs || 8000);
  let total = 0, arquivos = 0, pastas = 0; const maiores = [];
  const pilha = [dir];
  while (pilha.length) {
    if (Date.now() > fim) return { total, arquivos, pastas, maiores: ordenar(maiores), parou: true };
    const d = pilha.pop();
    let itens; try { itens = fs.readdirSync(d, { withFileTypes: true }); } catch { continue; }
    for (const it of itens) {
      const p = path.join(d, it.name);
      try {
        if (it.isSymbolicLink()) continue;
        if (it.isDirectory()) { pastas++; pilha.push(p); }
        else if (it.isFile()) { const st = fs.statSync(p); total += st.size; arquivos++; guardarMaior(maiores, p, st.size); }
      } catch { /* sem permissão: pula */ }
    }
  }
  return { total, arquivos, pastas, maiores: ordenar(maiores), parou: false };
}
function guardarMaior(lista, p, size) { if (lista.length < 30) lista.push({ p, size }); else { let mi = 0; for (let i = 1; i < lista.length; i++) if (lista[i].size < lista[mi].size) mi = i; if (size > lista[mi].size) lista[mi] = { p, size }; } }
const ordenar = (l) => l.sort((a, b) => b.size - a.size).slice(0, 20);

function acharPastas(dir, nomes, limiteMs, max) {
  const fim = Date.now() + (limiteMs || 8000); const achados = []; const pilha = [dir]; let visto = 0;
  const alvo = new Set(nomes.map((n) => n.toLowerCase()));
  while (pilha.length && achados.length < (max || 200)) {
    if (Date.now() > fim || visto > 60000) break;
    const d = pilha.pop(); let itens; try { itens = fs.readdirSync(d, { withFileTypes: true }); } catch { continue; }
    for (const it of itens) { visto++; if (!it.isDirectory() || it.isSymbolicLink()) continue; const p = path.join(d, it.name); if (alvo.has(it.name.toLowerCase())) achados.push(p); else pilha.push(p); }
  }
  return achados;
}

function duplicados(dirs, limiteMs) {
  const fim = Date.now() + (limiteMs || 12000);
  const porTamanho = new Map();
  for (const dir of dirs) {
    const pilha = [dir];
    while (pilha.length) {
      if (Date.now() > fim) break;
      const d = pilha.pop(); let itens; try { itens = fs.readdirSync(d, { withFileTypes: true }); } catch { continue; }
      for (const it of itens) {
        const p = path.join(d, it.name);
        try { if (it.isSymbolicLink()) continue; if (it.isDirectory()) { if (!/node_modules|\.git/i.test(it.name)) pilha.push(p); } else if (it.isFile()) { const st = fs.statSync(p); if (st.size > 4096) { if (!porTamanho.has(st.size)) porTamanho.set(st.size, []); porTamanho.get(st.size).push(p); } } } catch {}
      }
    }
  }
  const familias = [];
  for (const [size, lista] of porTamanho) {
    if (lista.length < 2) continue;
    const porHash = new Map();
    for (const p of lista) { if (Date.now() > fim) break; let h; try { h = hashCurto(p, size); } catch { continue; } if (!porHash.has(h)) porHash.set(h, []); porHash.get(h).push(p); }
    for (const [, f] of porHash) if (f.length > 1) familias.push({ tamanho: size, arquivos: f });
  }
  return familias.sort((a, b) => b.tamanho * (b.arquivos.length - 1) - a.tamanho * (a.arquivos.length - 1)).slice(0, 100);
}
function hashCurto(p, size) {
  const fd = fs.openSync(p, 'r'); try {
    const n = Math.min(size, 65536); const buf = Buffer.alloc(n); fs.readSync(fd, buf, 0, n, 0);
    const h = crypto.createHash('sha1').update(buf); if (size > 131072) { const buf2 = Buffer.alloc(65536); fs.readSync(fd, buf2, 0, 65536, size - 65536); h.update(buf2); }
    return size + ':' + h.digest('hex');
  } finally { fs.closeSync(fd); }
}

// ── coisas do Windows (PowerShell), com rede de segurança ───────────────────────
function ps(script, timeout) {
  if (!WIN) return '';
  try { const r = spawnSync('powershell', ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-Command', script], { windowsHide: true, encoding: 'utf8', timeout: timeout || 15000, maxBuffer: 20 * 1024 * 1024 }); return r.stdout || ''; } catch { return ''; }
}
function souAdmin() {
  if (!WIN) return true;
  try { return spawnSync('net', ['session'], { windowsHide: true, timeout: 4000 }).status === 0; } catch { return false; }
}
function discos() {
  if (!WIN) { const st = fs.statSync('/'); return [{ letra: '/', totalGB: 0, livreGB: 0, usadoPct: 0, obs: 'disco só no Windows' }]; }
  const out = ps("Get-CimInstance Win32_LogicalDisk -Filter 'DriveType=3' | ForEach-Object { $_.DeviceID + '|' + $_.Size + '|' + $_.FreeSpace }", 10000);
  return out.split(/\r?\n/).filter((l) => l.includes('|')).map((l) => { const [letra, size, livre] = l.trim().split('|'); const t = Number(size) || 0, lv = Number(livre) || 0; return { letra, totalGB: +(t / 1073741824).toFixed(1), livreGB: +(lv / 1073741824).toFixed(1), usadoPct: t ? Math.round((1 - lv / t) * 100) : 0 }; });
}
function programas() {
  if (!WIN) return [];
  const out = ps("$p='HKLM:\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\*','HKLM:\\Software\\WOW6432Node\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\*','HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\*'; Get-ItemProperty $p -ErrorAction SilentlyContinue | Where-Object { $_.DisplayName } | ForEach-Object { $_.DisplayName + '|' + $_.Publisher + '|' + $_.InstallDate }", 20000);
  const vistos = new Set();
  return out.split(/\r?\n/).filter((l) => l.includes('|')).map((l) => { const [nome, fab, data] = l.trim().split('|'); return { nome: (nome || '').trim(), fabricante: (fab || '').trim(), data: (data || '').trim() }; }).filter((x) => x.nome && !vistos.has(x.nome.toLowerCase()) && vistos.add(x.nome.toLowerCase())).sort((a, b) => a.nome.localeCompare(b.nome));
}
function inicializacao() {
  if (!WIN) return [];
  const out = ps("Get-CimInstance Win32_StartupCommand | ForEach-Object { $_.Name + '|' + $_.Command + '|' + $_.Location }", 15000);
  return out.split(/\r?\n/).filter((l) => l.includes('|')).map((l) => { const [nome, cmd, onde] = l.trim().split('|'); return { nome: (nome || '').trim(), comando: (cmd || '').trim(), onde: (onde || '').trim() }; });
}
function antivirus() {
  if (!WIN) return [];
  const out = ps("Get-CimInstance -Namespace root/SecurityCenter2 -Class AntiVirusProduct -ErrorAction SilentlyContinue | ForEach-Object { $_.displayName }", 10000);
  return out.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
}

// ── pastas comuns de lixo (só as conhecidas e seguras) ──────────────────────────
function pastasLixo() {
  const L = os.homedir(), env = process.env;
  const cand = [
    { nome: 'Lixo temporário (Temp)', p: env.TEMP || path.join(L, 'AppData', 'Local', 'Temp'), limpavel: true },
    { nome: 'Cache do Windows', p: path.join(L, 'AppData', 'Local', 'Microsoft', 'Windows', 'INetCache'), limpavel: true },
    { nome: 'Cache do npm', p: env.npm_config_cache || path.join(L, 'AppData', 'Roaming', 'npm-cache'), limpavel: true },
    { nome: 'Cache do pip (Python)', p: path.join(L, 'AppData', 'Local', 'pip', 'cache'), limpavel: true },
    { nome: 'Relatórios de erro', p: path.join(L, 'AppData', 'Local', 'CrashDumps'), limpavel: true },
    { nome: 'Downloads', p: path.join(L, 'Downloads'), limpavel: false },
  ];
  return cand.filter((c) => { try { return fs.existsSync(c.p); } catch { return false; } });
}

// ── mover para a quarentena (gaveta) — NUNCA apaga ──────────────────────────────
function quarentena(itens) {
  const base = path.join(os.homedir(), 'Faxina-PC', 'Quarentena', new Date().toISOString().slice(0, 10));
  fs.mkdirSync(base, { recursive: true });
  const feito = [], erros = [];
  for (const it of itens || []) {
    try {
      if (!fs.existsSync(it)) { erros.push({ p: it, erro: 'não existe mais' }); continue; }
      let destino = path.join(base, path.basename(it)); let k = 2;
      while (fs.existsSync(destino)) { const e = path.extname(it); destino = path.join(base, path.basename(it, e) + '-' + k + e); k++; }
      try { fs.renameSync(it, destino); } catch (e) { if (e.code === 'EXDEV') { copiarRecursivo(it, destino); apagarRecursivo(it); } else throw e; }
      feito.push({ de: it, para: destino });
    } catch (e) { erros.push({ p: it, erro: e.message }); }
  }
  return { gaveta: base, feito, erros };
}
function copiarRecursivo(o, d) { const st = fs.statSync(o); if (st.isDirectory()) { fs.mkdirSync(d, { recursive: true }); for (const n of fs.readdirSync(o)) copiarRecursivo(path.join(o, n), path.join(d, n)); } else fs.copyFileSync(o, d); }
function apagarRecursivo(p) { try { fs.rmSync(p, { recursive: true, force: true }); } catch {} }

// ── esvaziar a quarentena DE VEZ (apaga pra valer) — só dentro da pasta Quarentena ──
function esvaziarQuarentena() {
  const raiz = path.join(os.homedir(), 'Faxina-PC', 'Quarentena');
  const raizR = path.resolve(raiz);
  if (!fs.existsSync(raizR)) return { apagados: 0, bytes: 0, obs: 'a quarentena já está vazia' };
  let apagados = 0, bytes = 0; const erros = [];
  for (const nome of fs.readdirSync(raizR)) {
    const p = path.resolve(raizR, nome);
    // trava de segurança: só apaga o que está DENTRO da pasta Quarentena, nunca fora
    if (p !== raizR && !p.startsWith(raizR + path.sep)) continue;
    try { const t = tamanhoPasta(p, 4000); try { const st = fs.statSync(p); if (st.isFile()) bytes += st.size; else bytes += t.total; } catch {} fs.rmSync(p, { recursive: true, force: true }); apagados++; } catch (e) { erros.push({ p, erro: e.message }); }
  }
  return { apagados, bytes, erros, pasta: raizR };
}

// ── unidades (C:, D:, HD externo, pen drive) ──
function unidades() {
  if (!WIN) return [{ letra: '/', nome: 'raiz', tipo: 'local', totalGB: 0, livreGB: 0 }];
  const out = ps("Get-CimInstance Win32_LogicalDisk | ForEach-Object { $_.DeviceID + '|' + $_.VolumeName + '|' + $_.DriveType + '|' + $_.Size + '|' + $_.FreeSpace }", 10000);
  const TIPO = { 2: 'pen drive / removível', 3: 'disco (interno ou HD externo)', 4: 'rede', 5: 'CD/DVD' };
  return out.split(/\r?\n/).filter((l) => l.includes('|')).map((l) => { const [letra, nome, t, size, livre] = l.trim().split('|'); return { letra, nome: nome || '', tipo: TIPO[t] || 'outro', removivel: t === '2', totalGB: +((Number(size) || 0) / 1073741824).toFixed(1), livreGB: +((Number(livre) || 0) / 1073741824).toFixed(1) }; });
}

// ── copiar para o HD externo (trabalho em segundo plano, com conferência) ──
const TRABALHOS = new Map();
function listarArquivos(raiz) {
  const out = []; const pilha = [raiz]; let st0; try { st0 = fs.statSync(raiz); } catch { return out; }
  if (st0.isFile()) return [{ p: raiz, rel: path.basename(raiz), size: st0.size }];
  const base = path.dirname(raiz);
  while (pilha.length) {
    const d = pilha.pop(); let itens; try { itens = fs.readdirSync(d, { withFileTypes: true }); } catch { continue; }
    for (const it of itens) { const p = path.join(d, it.name); try { if (it.isSymbolicLink()) continue; if (it.isDirectory()) pilha.push(p); else if (it.isFile()) out.push({ p, rel: path.relative(base, p), size: fs.statSync(p).size }); } catch {} }
  }
  return out;
}
function copiar(pastas, destino) {
  if (!destino) throw new Error('Escolha para onde copiar (o HD externo).');
  const alvo = path.join(destino, 'Backup-Faxina-' + new Date().toISOString().slice(0, 10));
  const id = crypto.randomBytes(6).toString('hex');
  const job = { id, alvo, estado: 'listando', total: 0, bytes: 0, copiados: 0, bytesCopiados: 0, erros: [], conferidos: 0, diferentes: [] };
  TRABALHOS.set(id, job);
  (async () => {
    try {
      fs.mkdirSync(alvo, { recursive: true });
      const lista = []; for (const p of pastas || []) listarArquivos(p).forEach((x) => lista.push(x));
      job.total = lista.length; job.bytes = lista.reduce((s, x) => s + x.size, 0); job.estado = 'copiando';
      for (const x of lista) {
        const d = path.join(alvo, x.rel);
        try { await fs.promises.mkdir(path.dirname(d), { recursive: true }); await fs.promises.copyFile(x.p, d); job.copiados++; job.bytesCopiados += x.size; } catch (e) { job.erros.push({ p: x.p, erro: e.message }); }
      }
      job.estado = 'conferindo';
      for (const x of lista) { try { const st = await fs.promises.stat(path.join(alvo, x.rel)); if (st.size === x.size) job.conferidos++; else job.diferentes.push(x.p); } catch { job.diferentes.push(x.p); } }
      job.estado = 'pronto';
    } catch (e) { job.estado = 'erro'; job.erros.push({ p: alvo, erro: e.message }); }
  })();
  return { id, alvo };
}

function backup(pastas, destino) {
  if (!WIN) return { erro: 'o backup em .zip roda no Windows' };
  const dir = destino || path.join(os.homedir(), 'Faxina-PC', 'Backup');
  fs.mkdirSync(dir, { recursive: true });
  const zip = path.join(dir, 'backup-' + new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-') + '.zip');
  const lista = (pastas || []).filter((p) => { try { return fs.existsSync(p); } catch { return false; } });
  if (!lista.length) return { erro: 'nenhuma pasta válida para o backup' };
  const script = "$ErrorActionPreference='Stop'; Compress-Archive -Path " + lista.map((p) => "'" + p.replace(/'/g, "''") + "'").join(',') + " -DestinationPath '" + zip.replace(/'/g, "''") + "' -Force; (Get-Item '" + zip.replace(/'/g, "''") + "').Length";
  const out = ps(script, 120000).trim();
  if (!fs.existsSync(zip)) return { erro: 'não consegui criar o zip (talvez os arquivos sejam grandes demais ou estejam em uso)' };
  return { zip, tamanho: Number(out) || fs.statSync(zip).size };
}

// ── servidor ────────────────────────────────────────────────────────────────────
const json = (res, cod, obj) => { res.writeHead(cod, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*', 'Access-Control-Allow-Private-Network': 'true' }); res.end(JSON.stringify(obj)); };
function corpo(req) { return new Promise((ok) => { let c = ''; req.on('data', (d) => { c += d; if (c.length > 5e6) req.destroy(); }); req.on('end', () => { try { ok(JSON.parse(c || '{}')); } catch { ok({}); } }); }); }

function ligar(opcoes) {
  log = (opcoes && opcoes.log) || log;
  const srv = http.createServer(async (req, res) => {
    if (req.method === 'OPTIONS') { res.writeHead(204, { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*', 'Access-Control-Allow-Private-Network': 'true' }); return res.end(); }
    const u = new URL(req.url, 'http://127.0.0.1');
    if (CODIGO && req.headers['x-codigo'] !== CODIGO && u.searchParams.get('codigo') !== CODIGO) return json(res, 403, { erro: 'código errado' });
    const b = req.method === 'POST' ? await corpo(req) : {};
    try {
      switch (u.pathname) {
        case '/':
        case '/ping': return json(res, 200, { ok: true, app: 'faxina-pc', versao: 1, so: process.platform, admin: souAdmin(), casa: os.homedir() });
        case '/espaco': return json(res, 200, { discos: discos(), antivirus: antivirus() });
        case '/lixo': {
          const alvo = (b.pastas && b.pastas.length ? b.pastas.map((nome) => ({ nome, p: nome, limpavel: true })) : pastasLixo());
          const r = alvo.map((c) => { const t = tamanhoPasta(c.p, 6000); return { nome: c.nome, caminho: c.p, limpavel: c.limpavel, tamanho: t.total, arquivos: t.arquivos, maiores: t.maiores, parou: t.parou }; });
          return json(res, 200, { pastas: r });
        }
        case '/node-modules': {
          const base = b.pasta || os.homedir();
          const nm = acharPastas(base, ['node_modules'], 10000, 100).map((p) => { const t = tamanhoPasta(p, 2500); return { caminho: p, tamanho: t.total, arquivos: t.arquivos }; }).sort((a, b) => b.tamanho - a.tamanho);
          return json(res, 200, { pastas: nm });
        }
        case '/grandes': { const t = tamanhoPasta(b.pasta || path.join(os.homedir(), 'Downloads'), 10000); return json(res, 200, { total: t.total, arquivos: t.arquivos, maiores: t.maiores, parou: t.parou }); }
        case '/duplicados': return json(res, 200, { familias: duplicados(b.pastas || [path.join(os.homedir(), 'Downloads'), path.join(os.homedir(), 'Documents')], 14000) });
        case '/programas': return json(res, 200, { programas: programas() });
        case '/inicializacao': return json(res, 200, { itens: inicializacao() });
        case '/quarentena': return json(res, 200, quarentena(b.itens));
        case '/esvaziar': return json(res, 200, esvaziarQuarentena());
        case '/unidades': return json(res, 200, { unidades: unidades() });
        case '/copiar': return json(res, 200, copiar(b.pastas, b.destino));
        case '/trabalho': { const j = TRABALHOS.get(u.searchParams.get('id') || b.id); return j ? json(res, 200, j) : json(res, 404, { erro: 'trabalho não existe' }); }
        case '/pastas-comuns': { const L = os.homedir(); return json(res, 200, { pastas: ['Documents', 'Desktop', 'Pictures', 'Downloads', 'Videos', 'Music'].map((n) => ({ nome: n, caminho: path.join(L, n) })).filter((x) => fs.existsSync(x.caminho)).concat(WIN && fs.existsSync('C:\\Mini-SK') ? [{ nome: 'Mini-SK (projetos)', caminho: 'C:\\Mini-SK' }] : []) }); }
        case '/ver-quarentena': { const raiz = path.join(os.homedir(), 'Faxina-PC', 'Quarentena'); let itens = []; try { for (const dia of fs.readdirSync(raiz)) { const dd = path.join(raiz, dia); for (const n of fs.readdirSync(dd)) { const p = path.join(dd, n); let tam = 0; try { const st = fs.statSync(p); tam = st.isFile() ? st.size : tamanhoPasta(p, 2000).total; } catch {} itens.push({ nome: n, caminho: p, tamanho: tam }); } } } catch {} return json(res, 200, { itens, pasta: raiz }); }
        case '/backup': return json(res, 200, backup(b.pastas, b.destino));
        case '/salvar': { try { const dir = path.join(os.homedir(), 'Faxina-PC', 'Relatorios'); fs.mkdirSync(dir, { recursive: true }); const f = path.join(dir, b.nome || ('relatorio-' + Date.now() + '.md')); fs.writeFileSync(f, String(b.conteudo || '')); return json(res, 200, { salvo: f }); } catch (e) { return json(res, 500, { erro: e.message }); } }
        case '/abrir-pasta': { if (b.caminho && fs.existsSync(b.caminho)) { try { require('electron').shell.openPath(b.caminho); } catch { if (WIN) spawnSync('explorer', [b.caminho], { windowsHide: true }); } } return json(res, 200, { ok: true }); }
        default: return json(res, 404, { erro: 'não existe: ' + u.pathname });
      }
    } catch (e) { log('faxina: ' + e.message); json(res, 500, { erro: e.message }); }
  });
  srv.on('error', (e) => log('faxina: porta ' + PORTA + ' ocupada (' + e.code + ')'));
  srv.listen(PORTA, '127.0.0.1', () => log('🧹 Faxina ligada em ' + PORTA + (souAdmin() ? ' (administrador ✓)' : ' (sem administrador)')));
  return srv;
}

module.exports = { ligar, PORTA, _teste: { tamanhoPasta, acharPastas, duplicados, quarentena, pastasLixo } };
if (require.main === module) {
  ligar({ log: (...a) => console.log(...a) });
  // ligado pelo Mini SK (processo separado): se o Mini SK fechar ou cair, este fecha junto
  if (process.send) process.on('disconnect', () => process.exit(0));
}
