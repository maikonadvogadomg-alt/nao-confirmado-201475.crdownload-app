/* Mini SK — 87c-ferramentas.js · 🧰 FERRAMENTAS SEM IA (20/11)
   As ferramentas que o outro Claude fez (divisor, juntador, conversor de imagem, leitor universal…)
   agora moram DENTRO do Mini SK: tocou, abre por cima, sem gastar nada de IA. ✕ volta para o editor. */
(function (SK) {
  'use strict';
  const LISTA = [["desmontador-backup", "♻️", "Restaurador Universal", "Escolha backups de qualquer app seu (.json, .zip, .csv, .tsv): descobre o que é, mostra ao vivo, devolve no formato original e restaura aqui. Uma peça por tipo: seus apps, projetos da Replit, AI Code Studio, ChatGPT."], ["divisor-html", "✂️", "Divisor de HTML", "Corta um HTML gigante em partes (CSS, JS, seções) para mandar à IA aos pedaços."], ["juntador", "🔧", "Juntador de projeto", "Junta index + CSS + JS num HTML único que abre sozinho."], ["procurar-substituir", "🔍", "Procurar e substituir", "Troca palavras/trechos em todo o código de uma vez, com contagem."], ["leitor-universal", "📂", "Leitor universal", "Abre qualquer arquivo (JSON, backups de conversa, códigos) e mostra organizado."], ["colecionador-codigo", "📦", "Colecionador de código", "Resume vários arquivos (só funções, mapa) para colar na IA gastando menos."], ["detector-api", "🩺", "Detector de API", "Acha chamadas de API quebradas no código e corrige."], ["analisador-v2", "🧪", "Analisador de projetos V2", "Lê uma pasta/arquivos, mostra o relatório e exporta em Markdown."], ["analisador", "🔎", "Analisador de projetos", "Analisa um projeto enviado e mostra cada arquivo."], ["caca-sql", "🗃", "Caça esquema SQL", "Acha num .zip os arquivos de banco (schema, migration, .sql)."], ["conversor-imagem", "🖼️", "Conversor de imagem", "Comprime imagem (gasta menos na IA) e tira o texto (OCR)."], ["montador-modulos", "🧩", "Montador de módulos", "Guarda módulos de código e monta um HTML final com eles."], ["comandos-termux", "📦", "Comandos do Termux", "Banco de comandos prontos para copiar."], ["cofre-config", "⚖️", "Cofre de configurações", "Guarda itens e links por especialidade."], ["monica-guia", "🤖", "Guia API Monica", "Modelos e custos da API Monica."], ["monica-passo", "🔑", "Monica passo a passo", "Como pegar e usar a chave da Monica."]];
  function abrirUma(id, nome) {
    const w = document.createElement('div'); w.className = 'modal-wrap'; w.style.padding = '0';
    w.innerHTML = '<div style="position:absolute;inset:0;display:flex;flex-direction:column;background:var(--bg)"><div class="panel-head" style="display:flex;align-items:center;justify-content:space-between;padding:6px 10px"><b>' + SK.esc(nome) + '</b><span><button class="icon-btn" data-f="fora" title="Abrir numa aba">↗</button><button class="icon-btn" data-f="x" aria-label="Fechar">✕</button></span></div><iframe src="ferramentas/cloud/' + id + '.html" title="' + SK.esc(nome) + '" style="flex:1;border:0;width:100%;background:#fff" allow="clipboard-read; clipboard-write"></iframe></div>';
    w.addEventListener('click', (e) => { const b = e.target.closest('[data-f]'); if (!b) return; if (b.dataset.f === 'x') w.remove(); else window.open('ferramentas/cloud/' + id + '.html', '_blank'); });
    document.body.appendChild(w);
  }
  function abrir() {
    const w = document.createElement('div'); w.className = 'modal-wrap';
    w.innerHTML = '<div class="modal" style="max-width:720px;max-height:92vh;overflow:auto"><div class="row" style="justify-content:space-between;align-items:center"><b>🧰 Ferramentas (não gastam IA)</b><button class="icon-btn" data-f="x" aria-label="Fechar">✕</button></div>' +
      '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:8px;margin-top:8px">' + LISTA.map((t) => '<button class="btn" data-id="' + t[0] + '" style="text-align:left;display:block;white-space:normal;height:auto;padding:10px"><b>' + t[1] + ' ' + SK.esc(t[2]) + '</b><br><span class="small muted">' + SK.esc(t[3]) + '</span></button>').join('') + '</div></div>';
    w.addEventListener('click', (e) => { const b = e.target.closest('[data-id],[data-f]'); if (!b && e.target !== w) return; if (!b || b.dataset.f === 'x') { w.remove(); return; } const t = LISTA.find((x) => x[0] === b.dataset.id); w.remove(); abrirUma(t[0], t[1] + ' ' + t[2]); });
    document.body.appendChild(w);
  }
  SK.ferramentas = { abrir, abrirUma, LISTA };
  document.addEventListener('DOMContentLoaded', () => {
    const b = document.getElementById('btn-banco'); if (!b || document.getElementById('btn-ferr')) return;
    const n = document.createElement('button'); n.className = 'icon-btn'; n.id = 'btn-ferr'; n.textContent = '🧰'; n.title = 'Ferramentas que não gastam IA: divisor, juntador, conversor de imagem, leitor universal…'; n.setAttribute('aria-label', 'Ferramentas'); n.onclick = abrir; b.before(n);
  });
})(window.SK);
