/* =========================================================================
   Mini SK — 00-core.js
   Base de tudo: atalhos, eventos, avisos, janelas de confirmação e o
   banco de dados do navegador (IndexedDB), onde os projetos ficam salvos.
   ========================================================================= */
window.SK = window.SK || {};
(function (SK) {
  'use strict';

  SK.version = '2026.11.15-i';
  SK.versaoTexto = '20/11-C — 🚀 Forçar abrir não força mais a porta 5000 (o SK Jurídico 1.7.6 usa servidor 8080 + tela 5173: forçar separava os dois e dava erro de fetch). ⚡ Comandos prontos já aparecem abertos. Antes: 20/11-B — ⚡ os comandos prontos do Caça-Bug no terminal (npm, git, lixo e peso, senhas esquecidas, 🚀 Vercel/Netlify), rodando na pasta do projeto. Antes: 20/11-A — 📐 Esquema do projeto (as tabelas certas que o código espera, prontas para criar no 🗄 Banco) e 🏷 tecnologias em etiquetas coloridas; 🧰 15 ferramentas sem IA (divisor, juntador, conversor de imagem, leitor universal…). Antes: 18/11-D — 🗄 Banco: 🔎 Reconhecer o banco (diz de qual app é cada tabela, baixa cada parte, 📐 baixa o formato) e a 🤖 IA do banco agora vê o formato e exemplos antes de criar tabela (não cria duplicada). Antes: 18/11-C — 🧰 Kits com um toque no 📱/💻 Terminal (igual à voz Francisco, sem digitar nada): 🔗 Juntar num HTML só (volta para a árvore), 🌐 Servir (app montado), 🚀 Forçar abrir projeto com servidor (instala, liga; pede o banco Neon se o projeto usar), 🗂 Organizar o celular · 18/11-B — 🎨 Cores: botão 🎨 na barra de cima — Escuro, Claro, Alto contraste ou Papel (sépia) · 18/11-A — 🔔 Avisar na barra da IA: quando ela terminar (Ollama, código grande), apita, vibra e mostra notificação; 🔆 Tela acesa enquanto escreve · 📄 README.md: a documentação completa do Mini SK (para qualquer IA entender o projeto) · 17/11-C — 🧭 Guia econômico: o guia dos seus outros apps só vai para a IA quando você pergunta de um app (antes ia em toda mensagem e gastava mais); para mandar sempre, ligue 🧭 Guia sempre na barra da IA · 17/11-B — 🤖 Pedir à IA no 🗄 Banco: fale o que quer ("tabela de clientes com nome e CPF"), a IA vê as suas tabelas, monta o comando, explica em português e você toca em ▶ Rodar; se der erro, ela corrige; o que apaga pede CONFIRMO · 17/11-A — 🗄 Banco de Dados (Neon) dentro do Mini SK (botão 🗄 Banco na barra de cima): ver as tabelas, criar tabela do seu jeito, acrescentar campo, baixar tudo; o endereço fica lembrado neste aparelho; comando que apaga pede CONFIRMO · 15/11-I — no 💻 Terminal: 🧰 Verificar e instalar o que falta (Node, Python, Git, Java 17, Flask, voz edge-tts — só instala o que falta; no PC pelo winget), 🗣 Ligar a voz Francisco no Termux e 🩺 Terminal parado? (manda Ctrl+C e um teste; se a conexão caiu, liga de novo). Antes (14/11-H): no Termux o ▶ Rodar agora pula o Electron (programa de PC) que derrubava o npm install do jurídico; 🧭 Guia das ferramentas novo (13/11): todas as ferramentas na versão de hoje, as palavras que confundem (servidor, terminal de verdade, sandbox, "do lado", PWA/APK/.exe, voz Francisco), qual usar para quê e a lista do que testar · 13/11-F — 📖 O guia da IA se atualiza sozinho a cada versão (ela sabe a versão e as novidades) e diz claramente que o terminal é DE VERDADE (nunca mais "simulação"); o Ollama do celular também recebe o guia curto · 13/11-E — 🖥️ Faxina do computador DENTRO do Mini SK: olhar, limpar (Quarentena → esvaziar de vez), copiar para o HD externo com conferência, backup .zip, programas de carona, relatório para a IA e voz; 🛡️ reabrir como administrador · no celular, faxina pelo Termux · 13/11-D — 🧩 O Montar agora vem DENTRO do Mini SK (sem Python): a IA junta as suas ferramentas HTML num app só e cria o ferramentas/hub.html para testar no 👁 Preview · 13/11-C — 📋 A IA agora sempre diz ✅ o que fez, ❌ o que não fez e ➡️ o próximo passo; se ela prometer e não fizer, aparece o aviso e o botão 👉 Cobrar (com o 🤖 Agente ligado, ela é cobrada sozinha) · 13/11-B — 📝 Os pacotes, módulos e conversas agora saem em .md (não .txt), cada arquivo num bloco de código; o ⤵ Montar lê os dois · 13/11-A — 🗣 PC: a voz Francisco grátis já vem dentro do programa do PC (sem Python) · 🤖 Agente: a IA roda comandos no terminal ligado, lê o resultado e continua (o que apaga sempre pergunta) · 💰 Claude com cache (fica mais barato a partir da 2ª pergunta) e modelo novo (Sonnet 5.5) · 💻 PC: 🌐 Abrir como app (o projeto abre numa janela própria que usa o terminal e a ponte do computador — o Laboratório usa isso) · 🌐 Navegador de verdade no APK e no PC (abre qualquer site aqui dentro: YouTube, GitHub, npm…; ◀ ▶, endereço, guarda os endereços; o voltar do celular volta a página) · 💻 PC: 🩺 Saúde do computador (discos, memória, portas, peças, limpeza e 💾 backup para o HD externo) · 🎮 usa a placa de vídeo (fica liso e bonito; se abrir preto, desliga sozinho) · barra de título escura · 📱 Cara de celular / 🖥 Tela cheia · a janela abre do tamanho que você deixou · 💻 PC: o instalador fecha sozinho o Mini SK antigo (acabou o "está sendo usado") · ao fechar, o Mini SK para tudo o que o terminal ligou · terminal e ponte escolhem uma porta livre sozinhos · se um Mini SK antigo ficou preso segurando a porta, ele é fechado sozinho · 👁 ⛶ Tela cheia na visualização do terminal (Termux e PC) · 🎤 microfone e 🔊 som liberados dentro da visualização (o app aberto ali já pode ditar e falar) · 🤖 quando a IA falha, mostra o erro de CADA chave (ex.: Gemini no limite + OpenRouter com chave apagada) · 🧪 Testar API não chama de "rota não achada" o que é de outro servidor (Ollama) · 🛡 PC: a pasta viva nunca mais apaga o conteúdo da árvore com arquivo vazio (era o package.json vazio) · comandos de pastas de sobra (push-force) escondidos · 💻 PC: o 🚀 Ligar tudo confere se a peça (vite, tsx…) existe de verdade e instala se faltar (acabou o "vite não é reconhecido" depois de instalação quebrada) · 🤖 a IA enxerga o terminal (caixinha 💻 Terminal) e o botão 🤖 Perguntar à IA no terminal do PC e do Termux · 💻 PC: o npm install mostra cada peça baixando (não parece mais travado) e já resolve peças que brigam (--legacy-peer-deps) · 🐙 Projetos no GitHub igual à Replit (lista com pesquisa, abre com um toque, ✅/✏️/⚠ em cada projeto, ⬆ mandar todos, 🧹 liberar espaço, backup leve) · 💻 PC: 🚀 Ligar tudo, ⏹ Parar, 🦙 Ollama e 👁 portas · ◀ ▶ na barra de cima';
  SK.$ = (s, r) => (r || document).querySelector(s);
  SK.$$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  SK.esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  SK.uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  SK.fmt = (n) => Number(n || 0).toLocaleString('pt-BR');
  SK.bytes = (n) => n < 1024 ? n + ' B' : n < 1048576 ? (n / 1024).toFixed(1) + ' KB' : (n / 1048576).toFixed(1) + ' MB';
  SK.debounce = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };

  // ── Eventos entre módulos (cada módulo conversa pelos eventos, não direto) ──
  const listeners = {};
  SK.on = (name, fn) => { (listeners[name] = listeners[name] || []).push(fn); return () => { listeners[name] = listeners[name].filter((f) => f !== fn); }; };
  SK.emit = (name, data) => { (listeners[name] || []).slice().forEach((fn) => { try { fn(data); } catch (e) { console.error('[evento ' + name + ']', e); } }); };

  // ── Aviso rápido na parte de baixo ──────────────────────────────────────────
  let toastTimer;
  SK.toast = (msg, kind) => {
    let el = SK.$('#toast');
    if (!el) { el = document.createElement('div'); el.id = 'toast'; el.setAttribute('role', 'status'); document.body.appendChild(el); }
    el.textContent = msg;
    el.className = 'toast show' + (kind ? ' ' + kind : '');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { el.className = 'toast'; }, kind === 'error' ? 6000 : 3200);
  };

  // ── Janela própria (confirm/prompt do navegador falham em alguns celulares) ──
  function modal({ title, message, input, value, okText, cancelText, danger, senha }) {
    return new Promise((resolve) => {
      const wrap = document.createElement('div');
      wrap.className = 'modal-wrap';
      wrap.innerHTML =
        '<div class="modal" role="dialog" aria-modal="true">' +
        (title ? '<h3>' + SK.esc(title) + '</h3>' : '') +
        (message ? '<p>' + SK.esc(message) + '</p>' : '') +
        (input ? '<input class="inp" type="' + (senha ? 'password' : 'text') + '" spellcheck="false" autocomplete="' + (senha ? 'new-password' : 'off') + '">' : '') +
        '<div class="row end"><button class="btn" data-x="no">' + SK.esc(cancelText || 'Cancelar') + '</button>' +
        '<button class="btn ' + (danger ? 'danger' : 'primary') + '" data-x="ok">' + SK.esc(okText || 'OK') + '</button></div></div>';
      document.body.appendChild(wrap);
      const inp = SK.$('input', wrap);
      if (inp) { inp.value = value || ''; setTimeout(() => { inp.focus(); const dot = inp.value.lastIndexOf('.'); inp.setSelectionRange(0, dot > 0 ? dot : inp.value.length); }, 30); }
      else setTimeout(() => SK.$('[data-x="ok"]', wrap).focus(), 30);
      const done = (ok) => { wrap.remove(); resolve(input ? (ok ? inp.value : null) : ok); };
      wrap.addEventListener('click', (e) => { const x = e.target.closest('[data-x]'); if (x) done(x.dataset.x === 'ok'); else if (e.target === wrap) done(false); });
      wrap.addEventListener('keydown', (e) => { if (e.key === 'Escape') done(false); if (e.key === 'Enter' && (input || e.target.tagName !== 'BUTTON')) { e.preventDefault(); done(true); } });
    });
  }
  SK.confirm = (message, opts) => modal(Object.assign({ message, okText: 'Confirmar' }, opts || {}));
  SK.prompt = (message, value, opts) => modal(Object.assign({ message, input: true, value }, opts || {}));

  // ── Baixar arquivo ──────────────────────────────────────────────────────────
  SK.download = (name, data, mime) => {
    const blob = data instanceof Blob ? data : new Blob([data], { type: mime || 'text/plain;charset=utf-8' });
    // Dentro do APK (WebView) o navegador não baixa sozinho: o app Android salva em Downloads.
    if (window.AndroidBridge && window.AndroidBridge.salvar) {
      const r = new FileReader();
      r.onload = () => { const res = window.AndroidBridge.salvar(name, String(r.result).split(',')[1] || '', blob.type || ''); if (res !== 'ok') SK.toast('Não consegui salvar: ' + res, 'error'); };
      r.readAsDataURL(blob);
      return;
    }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 10000);
  };
  // ── Mandar para o Drive / WhatsApp / e-mail (o "Compartilhar" do celular) ──
  // Abre a lista do aparelho e você escolhe o Drive. Sem cadastro no Google.
  // Onde não existe (PC antigo, APK sem ponte): baixa o arquivo.
  SK.compartilhar = async (name, data, mime) => {
    const blob = data instanceof Blob ? data : new Blob([data], { type: mime || 'application/octet-stream' });
    try {
      const file = new File([blob], name, { type: blob.type || mime || 'application/octet-stream' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], title: name }); return 'compartilhado'; }
    } catch (e) { if (e && e.name === 'AbortError') return 'cancelado'; }
    SK.download(name, blob, mime);
    SK.toast('Este aparelho não abriu o "Compartilhar": o arquivo foi baixado. Mande para o Drive pelo app do Drive (＋ → Enviar).');
    return 'baixado';
  };
  SK.copy = async (text) => {
    try { await navigator.clipboard.writeText(text); SK.toast('Copiado'); }
    catch { const ta = document.createElement('textarea'); ta.value = text; ta.style.cssText = 'position:fixed;opacity:0'; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); SK.toast('Copiado'); } catch { SK.toast('Não consegui copiar', 'error'); } ta.remove(); }
  };

  // ── Configurações pequenas (localStorage) ───────────────────────────────────
  SK.pref = {
    get(k, def) { try { const v = localStorage.getItem('minisk:' + k); return v == null ? def : JSON.parse(v); } catch { return def; } },
    set(k, v) { try { localStorage.setItem('minisk:' + k, JSON.stringify(v)); } catch {} },
  };

  // ── Banco do navegador (IndexedDB): aguenta projetos grandes ────────────────
  const DB_NAME = 'mini-sk', DB_VER = 1;
  let dbPromise = null;
  function openDB() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VER);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains('projects')) db.createObjectStore('projects', { keyPath: 'name' });
        if (!db.objectStoreNames.contains('checkpoints')) {
          const s = db.createObjectStore('checkpoints', { keyPath: 'id' });
          s.createIndex('project', 'project');
        }
        if (!db.objectStoreNames.contains('kv')) db.createObjectStore('kv');
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    return dbPromise;
  }
  function tx(store, mode, fn) {
    return openDB().then((db) => new Promise((resolve, reject) => {
      const t = db.transaction(store, mode);
      fn(t.objectStore(store));
      t.oncomplete = () => resolve(true);
      t.onerror = () => reject(t.error);
      t.onabort = () => reject(t.error || new Error('Não consegui salvar (o espaço do navegador pode estar cheio)'));
    }));
  }
  const reqP = (r) => new Promise((res, rej) => { r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
  SK.db = {
    get: (store, key) => openDB().then((db) => reqP(db.transaction(store).objectStore(store).get(key))),
    all: (store) => openDB().then((db) => reqP(db.transaction(store).objectStore(store).getAll())),
    allByIndex: (store, index, value) => openDB().then((db) => reqP(db.transaction(store).objectStore(store).index(index).getAll(value))),
    put: (store, value, key) => tx(store, 'readwrite', (s) => { key === undefined ? s.put(value) : s.put(value, key); }),
    del: (store, key) => tx(store, 'readwrite', (s) => { s.delete(key); }),
  };
  SK.storageInfo = async () => {
    try { const e = await navigator.storage.estimate(); return e; } catch { return null; }
  };
  // Pede ao navegador para não apagar os dados quando faltar espaço
  SK.persistStorage = async () => { try { if (navigator.storage && navigator.storage.persist) return await navigator.storage.persist(); } catch {} return false; };
})(window.SK);
