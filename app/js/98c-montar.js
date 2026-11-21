/* =========================================================================
   Mini SK — 98c-montar.js: 🧩 MONTAR já DENTRO do Mini SK (sem Python, sem "pôr do lado").
   É o montar.py do Caça-Bug, só que em JavaScript, trabalhando direto na árvore do projeto:
   - Pega ferramentas que são UM HTML cada (em fontes/ ou onde estiverem no projeto), sem mexer nelas;
   - cria ferramentas/<id>.js (o HTML inteiro guardado dentro) + ferramentas/ordem.txt;
   - cria ferramentas/hub.html: uma página pronta que mostra os cartões e abre cada ferramenta
     numa caixinha (sandbox). Abra o hub.html no 👁 Preview para TESTAR — o Preview é a "sandbox".
   - A "tomada" window.__hub: abrir(arquivo) entrega um arquivo para a ferramenta; relatorio() pega o resultado.
   A IA usa escrevendo numa linha sozinha:  MONTAR: receita.json   (ou  MONTAR: auto  para pegar todos os .html de fontes/)
   Antes de escrever, o Mini SK tira um 📸 checkpoint.
   ========================================================================= */
(function (SK) {
  'use strict';
  const fs = () => SK.fs;
  const LIBS_LOCAIS = [
    ['https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js', 'lib/jszip.min.js'],
    ['https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js', 'lib/jszip.min.js'],
  ];
  const slug = (s) => String(s || 'ferramenta').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\.html?$/, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'ferramenta';
  const noFimDoBody = (html, extra) => { const i = html.toLowerCase().lastIndexOf('</body>'); return i >= 0 ? html.slice(0, i) + extra + html.slice(i) : html + extra; };

  function achar(fonte) {
    for (const p of [fonte, 'fontes/' + fonte]) if (fs().read(p) != null) return p;
    const nome = String(fonte).split('/').pop().toLowerCase();
    return fs().list().find((p) => p.split('/').pop().toLowerCase() === nome && fs().read(p) != null) || null;
  }
  function receitaAuto() {
    let html = fs().list().filter((p) => /^fontes\/[^/]+\.html?$/i.test(p));
    if (!html.length) html = fs().list().filter((p) => /\.html?$/i.test(p) && !/(^|\/)index\.html?$/i.test(p) && !p.startsWith('ferramentas/') && !p.startsWith('.sk/'));
    return html.map((p) => ({ fonte: p, id: slug(p.split('/').pop()), nome: p.split('/').pop().replace(/\.html?$/i, ''), icone: '🧰' }));
  }
  function lerReceita(arg) {
    arg = String(arg || '').trim();
    if (!arg || /^auto$/i.test(arg)) return receitaAuto();
    const t = fs().read(arg) != null ? fs().read(arg) : fs().read(arg.replace(/^\.?\//, ''));
    if (t == null) throw new Error('Não achei o arquivo ' + arg + ' no projeto.');
    let j; try { j = JSON.parse(t); } catch (e) { throw new Error(arg + ' não é um JSON válido: ' + e.message); }
    if (!Array.isArray(j)) throw new Error(arg + ' precisa ser uma lista [ {...}, {...} ].');
    return j;
  }

  function hubHTML(fichas) {
    return '<!doctype html>\n<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Ferramentas montadas</title>\n<style>body{margin:0;background:#0f172a;color:#e6edf8;font:15px system-ui,sans-serif}header{padding:10px 14px;background:#16213a;position:sticky;top:0}h1{font-size:17px;margin:0}.g{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:8px;padding:10px}.c{background:#16213a;border:1px solid #2b3a5c;border-radius:12px;padding:12px;cursor:pointer}.c b{display:block}.c small{color:#9fb0cc}#tela{display:none}#tela.on{display:block}.bar{display:flex;gap:6px;flex-wrap:wrap;padding:8px 10px;background:#16213a}button,label.b{background:#1e2b48;color:#fff;border:1px solid #2b3a5c;border-radius:8px;padding:7px 11px;font:inherit;cursor:pointer}iframe{width:100%;height:78vh;border:0;background:#fff}pre{white-space:pre-wrap;background:#0b0f18;margin:8px 10px;padding:8px;border-radius:8px;max-height:30vh;overflow:auto}</style></head><body>\n' +
      '<header><h1>🧩 Ferramentas montadas (' + fichas.length + ')</h1></header>\n<div class="g" id="g"></div>\n<div id="tela"><div class="bar"><button id="volta">⬅ Voltar</button><b id="nome" style="align-self:center"></b><label class="b" id="lb-abrir" hidden>📂 Entregar um arquivo<input type="file" id="arq" hidden></label><button id="rel" hidden>📌 Pegar o relatório</button></div><pre id="saida" hidden></pre><iframe id="f" sandbox="allow-scripts allow-forms allow-modals allow-popups allow-downloads allow-same-origin"></iframe></div>\n' +
      fichas.map((f) => '<script src="' + f.id + '.js"></script>').join('\n') + '\n' +
      '<script>\nvar L=window.CB_FERRAMENTAS||[],atual=null;\nvar g=document.getElementById("g");\ng.innerHTML=L.map(function(t,i){return \'<div class="c" data-i="\'+i+\'"><b>\'+t.icone+" "+t.nome+"</b><small>"+(t.desc||"")+"</small></div>"}).join("")||"<p>Nenhuma ferramenta.</p>";\n' +
      'g.onclick=function(e){var c=e.target.closest("[data-i]");if(!c)return;atual=L[+c.dataset.i];document.getElementById("nome").textContent=atual.icone+" "+atual.nome;document.getElementById("f").srcdoc=atual.html;document.getElementById("lb-abrir").hidden=!atual.alimenta;document.getElementById("rel").hidden=!atual.temRelatorio;document.getElementById("saida").hidden=true;g.style.display="none";document.getElementById("tela").className="on"};\n' +
      'document.getElementById("volta").onclick=function(){document.getElementById("tela").className="";g.style.display="";document.getElementById("f").srcdoc=""};\n' +
      'document.getElementById("arq").onchange=function(e){var f=e.target.files[0];if(!f)return;var w=document.getElementById("f").contentWindow;try{w.__hub.abrir(f)}catch(er){alert("Esta ferramenta não aceitou o arquivo: "+er.message)}};\n' +
      'document.getElementById("rel").onclick=function(){var w=document.getElementById("f").contentWindow,s=document.getElementById("saida");try{s.textContent=w.__hub.relatorio()||"(vazio)"}catch(er){s.textContent="Não consegui pegar o relatório: "+er.message}s.hidden=false};\n<\/script>\n</body></html>\n';
  }

  async function fazer(arg) {
    if (!fs() || !fs().project) throw new Error('Abra um projeto primeiro.');
    const receita = lerReceita(arg);
    if (!receita.length) throw new Error('Não achei ferramentas para montar. Ponha os .html na pasta fontes/ (ou escreva um receita.json).');
    if (SK.checkpoints) await SK.checkpoints.auto('Antes do 🧩 Montar');
    const feitos = [], pulados = [], fichas = [];
    for (const item of receita) {
      const origem = achar(item.fonte || '');
      if (!origem) { pulados.push((item.fonte || '?') + ' (não achei)'); continue; }
      let html = fs().read(origem);
      for (const [de, para] of LIBS_LOCAIS) html = html.split(de).join(para);
      const partes = [];
      if (item.abrir) partes.push('abrir:function(f,slot){return (' + item.abrir + ');}');
      if (item.relatorio) partes.push('relatorio:function(){try{return (' + item.relatorio + ');}catch(e){return "";}}');
      if (partes.length) html = noFimDoBody(html, '<script>window.__hub={' + partes.join(',') + '};<\/script>');
      const id = slug(item.id || origem.split('/').pop());
      const ficha = { id, nome: item.nome || id, icone: item.icone || '🧰', desc: item.desc || '', alimenta: !!item.abrir, temRelatorio: !!item.relatorio, html };
      const js = '/* Ferramenta gerada pelo 🧩 Montar do Mini SK a partir de ' + origem + ' (não edite aqui: mude o original e monte de novo). */\n(window.CB_FERRAMENTAS = window.CB_FERRAMENTAS || []).push(' + JSON.stringify(ficha).replace(/<\/script/gi, '<\\/script') + ');\n';
      fs().write('ferramentas/' + id + '.js', js, { silent: true });
      feitos.push({ nome: ficha.nome, arquivo: 'ferramentas/' + id + '.js', kb: Math.round(js.length / 1024) });
      fichas.push(ficha);
    }
    if (fichas.length) {
      fs().write('ferramentas/ordem.txt', fichas.map((f) => f.id).join('\n') + '\n', { silent: true });
      fs().write('ferramentas/hub.html', hubHTML(fichas));
    }
    const texto = (feitos.length ? '✅ Montei ' + feitos.length + ' ferramenta(s):\n' + feitos.map((f) => '- ' + f.nome + ' → ' + f.arquivo + ' (' + f.kb + ' KB)').join('\n') + '\n- Página pronta para testar: ferramentas/hub.html (abra no 👁 Preview — é a "sandbox")' : '⚠ Não montei nada.') +
      (pulados.length ? '\n❌ Pulei: ' + pulados.join(', ') : '') +
      (feitos.length ? '\nPara pôr dentro de outro app: no index.html dele, antes do código que mostra as ferramentas, cole:\n' + fichas.map((f) => '<script src="ferramentas/' + f.id + '.js"></script>').join('\n') : '');
    return { feitos, pulados, texto };
  }

  SK.montar = { fazer, receitaAuto };
})(window.SK);
