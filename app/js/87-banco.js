/* 🗄 Banco de Dados (Neon) dentro do Mini SK (17/11)
   Abre a mesma ferramenta do jurídico e do Laboratório numa tela por cima.
   Para os seus projetos que têm banco: ver tabelas, criar, acrescentar campo, baixar tudo.
   O endereço do Neon (tem a senha) fica só neste aparelho. */
(function (SK) {
  'use strict';
  function abrir() {
    if (document.getElementById('banco-wrap')) return;
    const w = document.createElement('div');
    w.id = 'banco-wrap'; w.className = 'modal-wrap'; w.style.padding = '0';
    w.innerHTML = '<div style="position:absolute;inset:0;display:flex;flex-direction:column;background:var(--bg)">' +
      '<div class="panel-head" style="display:flex;align-items:center;justify-content:space-between;padding:6px 10px"><b>🗄 Banco de Dados (Neon)</b>' +
      '<button class="icon-btn" data-x="no" aria-label="Fechar" title="Fechar">✕</button></div>' +
      '<iframe src="ferramentas/banco-neon.html" title="Banco de Dados" style="flex:1;border:0;width:100%;background:#fff" allow="clipboard-read; clipboard-write"></iframe></div>';
    w.addEventListener('click', (e) => { if (e.target.closest('[data-x="no"]')) w.remove(); });
    document.body.appendChild(w);
  }
  SK.banco = { abrir };
  document.addEventListener('DOMContentLoaded', () => { const b = document.getElementById('btn-banco'); if (b) b.onclick = abrir; });
})(window.SK);
