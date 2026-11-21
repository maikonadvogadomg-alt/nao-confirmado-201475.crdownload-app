/* Mini SK — 86i-comandos-cb.js · ⚡ OS BOTÕES DO CAÇA-BUG DENTRO DO MINI SK (20/11)
   Os mesmos comandos prontos do terminal do Caça-Bug, num toque, rodando NA PASTA DO PROJETO:
   📦 npm install · 🏗 build · 🔢 versões · 📋 npm list · ⏫ desatualizados · 🛡 falhas · 🧪 testes · 🧹 pacotes sem uso
   🐙 git status/log/diff · 📦 o que pesa · 🐘 arquivos grandes · 🗑 restos da Replit · 🧾 logs · 🔑 senhas esquecidas
   🚀 Publicar na Vercel/Netlify (escreve o arquivo de configuração e manda o comando).
   Dica: os erros que aparecem no terminal (ex.: "GET /api/templates 404") são o PRÓPRIO servidor do
   projeto contando cada pedido e a resposta (200 = deu certo, 400/404/500 = deu errado). */
(function (SK) {
  'use strict';
  const PC = window.miniskPC || null;
  const CD = () => (PC ? 'cd /d "' + ((PC && PC.pasta) || 'C:\\Mini-SK') + '\\__P__" && ' : "cd ~/minisk/'__P__' && ");
  const G = {
    '⚡ Básicos': [
      ['📦 npm install', (PC ? '' : 'ELECTRON_SKIP_BINARY_DOWNLOAD=1 ') + 'npm install --legacy-peer-deps --loglevel http', 'Instala as peças do projeto'],
      ['🏗 npm run build', 'npm run build', 'Monta o app (cria a pasta dist)'],
      ['🔢 versões', 'node -v && npm -v', 'Versão do Node e do npm'],
      [PC ? '📂 dir' : '📂 ls', PC ? 'dir' : 'ls -la', 'O que tem na pasta do projeto'],
    ].concat(PC ? [] : [['🔋 não deixar o Android fechar', 'termux-wake-lock', 'Impede o Android de fechar o Termux']]),
    '📦 Pacotes': [
      ['📋 instalados', 'npm list --depth=0', 'Os pacotes que o projeto usa'],
      ['🧹 sem uso', 'npx --yes depcheck', 'Pacotes no package.json que o código não usa'],
      ['⏫ desatualizados', 'npm outdated', 'Pacotes com versão nova'],
      ['🛡 falhas', 'npm audit', 'Pacotes com problema de segurança conhecido'],
      ['🧪 testes', 'npm test', 'Roda os testes do projeto, se tiver'],
    ],
    '🐙 Histórico (git)': [
      ['📜 git log', 'git log --oneline --graph -25', 'As últimas 25 mudanças'],
      ['📋 git status', 'git status --short', 'Novos (??), mudados (M), apagados (D)'],
      ['🔀 o que mudou', 'git diff --stat', 'Arquivos mexidos e não guardados'],
      ['🔀 última mudança', 'git diff HEAD~1 --stat', 'O que a última mudança alterou'],
    ],
    '🔎 Lixo e peso': PC ? [
      ['🗑 restos da Replit', 'dir /a /b .replit replit.nix .upm .cache .local .config attached_assets node_modules dist .git 2>nul', 'O que a Replit deixa e não faz falta'],
    ] : [
      ['📦 o que pesa', 'du -sh * .[!.]* 2>/dev/null | sort -h | tail -20', 'As 20 pastas/arquivos mais pesados'],
      ['🐘 maiores que 1 MB', "find . -type f -size +1M -not -path './node_modules/*' -not -path './.git/*' -exec ls -lh {} + 2>/dev/null | awk '{print $5, $9}' | sort -h", 'Arquivos grandes fora do node_modules'],
      ['🗑 restos da Replit', 'ls -d .replit replit.nix .upm .cache .local .config .pythonlibs attached_assets node_modules dist .git 2>/dev/null', 'O que a Replit deixa e não faz falta'],
      ['🧾 logs e temporários', "find . \\( -name '*.log' -o -name '*.tmp' -o -name '__pycache__' \\) -not -path './node_modules/*' 2>/dev/null | head -50", 'Arquivos de registro e temporários'],
      ['🔑 senhas esquecidas', "grep -rIl --exclude-dir=node_modules --exclude-dir=.git -E 'AIza[0-9A-Za-z_-]{20}|sk-[A-Za-z0-9_-]{20}|ghp_[A-Za-z0-9]{20}|postgres(ql)?://[^ ]+@' . 2>/dev/null | head -30", 'Arquivos que parecem ter chave ou senha (só mostra o nome do arquivo)'],
    ],
  };
  const E = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  function mandar(cmd) { const T = SK.termux; if (!T || !T.mandar) { SK.toast('Abra o 💻 Terminal primeiro.', 'warn'); return; } if (!T.mandar(CD() + cmd, true)) SK.toast('Conecte o terminal primeiro (▶ Ligar tudo).', 'warn'); }
  function planoPublicar() {
    const fs = SK.fs; const k = fs.list().filter((c) => /(^|\/)package\.json$/.test(c) && !/node_modules/.test(c)).sort((a, b) => a.length - b.length)[0];
    let j = null; try { j = k ? JSON.parse(fs.read(k)) : null; } catch (e) {}
    const sc = (j && j.scripts) || {}, d = Object.assign({}, j && j.dependencies, j && j.devDependencies);
    const temServidor = !!(d.express || d.fastify || d.koa || d['@hono/node-server']);
    let saida = d.next ? '.next' : d['react-scripts'] ? 'build' : sc.build ? 'dist' : '.';
    const vc = fs.list().find((c) => /vite\.config\.[cm]?[jt]s$/.test(c)); const m = vc && /outDir\s*:\s*['"`]([^'"`]+)['"`]/.exec(fs.read(vc) || ''); if (m) saida = m[1].replace(/^\.\//, '').replace(/^.*\.\.\//, '');
    return { build: sc.build ? 'npm run build' : '', saida, temServidor, next: !!d.next };
  }
  async function publicar(alvo) {
    if (!SK.fs.list().length) return SK.toast('Abra um projeto primeiro.', 'warn');
    const pl = planoPublicar();
    if (pl.temServidor && !confirm('Este projeto tem SERVIDOR próprio (Express): na ' + alvo + ' só a TELA funciona — as rotas /api dão erro. Para o servidor, o caminho é VPS/Render. Publicar só a tela mesmo assim?')) return;
    if (alvo === 'Netlify') SK.fs.write('netlify.toml', '# feito pelo Mini SK\n[build]\n' + (pl.build ? '  command = "' + pl.build + '"\n' : '') + '  publish = "' + pl.saida + '"\n\n[[redirects]]\n  from = "/*"\n  to = "/index.html"\n  status = 200\n');
    else if (!pl.next) SK.fs.write('vercel.json', JSON.stringify({ buildCommand: pl.build || undefined, outputDirectory: pl.saida, rewrites: [{ source: '/(.*)', destination: '/index.html' }] }, null, 2) + '\n');
    try { await SK.termux.mandarProjeto(); } catch (e) { return SK.toast('⚠ ' + e.message, 'error'); }
    mandar(alvo === 'Netlify' ? (pl.build ? 'npm install && ' + pl.build + ' && ' : '') + 'npx --yes netlify-cli deploy --prod --dir=' + pl.saida : 'npx --yes vercel --prod');
    SK.toast('🚀 Publicando na ' + alvo + '… Na 1ª vez ele pede para entrar na sua conta e faz perguntas: responda com Enter. No fim aparece o endereço do site.', 'ok');
  }
  function botoes() {
    const kits = document.getElementById('kits-sk'); if (!kits || document.getElementById('cmd-cb')) return;
    const d = document.createElement('details'); d.id = 'cmd-cb'; d.open = true; d.style.cssText = 'margin:6px 0';
    d.innerHTML = '<summary class="small"><b>⚡ Comandos prontos (os do Caça-Bug)</b> — rodam na pasta do projeto</summary>' +
      Object.entries(G).map(([t, l]) => '<div class="row wrap" style="gap:6px;margin:6px 0;align-items:center"><span class="small muted">' + t + ':</span>' + l.map((c) => '<button class="btn small" data-cmd="' + E(c[1]) + '" title="' + E(c[2]) + '">' + c[0] + '</button>').join('') + '</div>').join('') +
      '<div class="row wrap" style="gap:6px;margin:6px 0;align-items:center"><span class="small muted">🚀 Publicar (site de tela):</span><button class="btn small" data-pub="Vercel">▲ Vercel</button><button class="btn small" data-pub="Netlify">◆ Netlify</button></div>' +
      '<p class="small muted" style="margin:4px 0">Os "GET /api/... 200 / 404" que aparecem no terminal são o servidor do projeto contando cada pedido: 200 = deu certo; 400, 404, 500 = deu errado (o número diz o tipo). Toque no 🐞 para juntar e mandar para a IA.</p>';
    d.addEventListener('click', (e) => { const b = e.target.closest('[data-cmd],[data-pub]'); if (!b) return; if (b.dataset.pub) publicar(b.dataset.pub); else mandar(b.dataset.cmd); });
    kits.after(d);
  }
  new MutationObserver(botoes).observe(document.documentElement, { childList: true, subtree: true });
  SK.comandosCB = { mandar, publicar };
})(window.SK);
