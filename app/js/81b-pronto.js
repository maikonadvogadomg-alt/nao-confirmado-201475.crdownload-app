/* Mini SK — 81b-pronto.js · 🔔 AVISO DE "PRONTO" (18/11)
   A IA demorou (Ollama, código grande, agente)? Ligue 🔔 Avisar na barra da IA:
   quando ela terminar, o aparelho APITA, VIBRA e mostra uma NOTIFICAÇÃO — pode ir mexer em outra coisa.
   🔆 Tela acesa: enquanto ela escreve, a tela não apaga (o Android não pausa o app no meio).
   Só avisa se demorou mais de 8 segundos. Não feche o app (deixe aberto atrás). */
(function (SK) {
  'use strict';
  if (!SK.ai || !SK.ai.chat) return;
  const original = SK.ai.chat;
  let trava = null, rodando = 0;
  const ligado = () => !!SK.pref.get('aiAvisar', false);
  function apito() {
    try { const A = window.AudioContext || window.webkitAudioContext; if (!A) return; const c = new A(), t = c.currentTime;
      [880, 1175].forEach((f, i) => { const o = c.createOscillator(), g = c.createGain(); o.frequency.value = f; o.connect(g); g.connect(c.destination); g.gain.setValueAtTime(0.0001, t + i * 0.22); g.gain.exponentialRampToValueAtTime(0.3, t + i * 0.22 + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.22 + 0.2); o.start(t + i * 0.22); o.stop(t + i * 0.22 + 0.22); });
      setTimeout(() => c.close(), 800); } catch (e) {}
  }
  async function avisar(ok, texto) {
    apito(); try { navigator.vibrate && navigator.vibrate([200, 100, 200]); } catch (e) {}
    if (!(document.hidden || !document.hasFocus())) return;
    const titulo = ok ? '🛠 Mini SK: a IA terminou' : '⚠ Mini SK: a IA deu erro';
    const corpo = String(texto || '').replace(/[#*`>_]/g, '').replace(/\s+/g, ' ').slice(0, 140);
    try {
      if ('Notification' in window && Notification.permission === 'granted') {
        const reg = navigator.serviceWorker && await navigator.serviceWorker.getRegistration();
        if (reg && reg.showNotification) await reg.showNotification(titulo, { body: corpo, tag: 'minisk-pronta', renotify: true, icon: 'icons/icon-192.png', vibrate: [200, 100, 200] });
        else new Notification(titulo, { body: corpo });
      }
    } catch (e) {}
  }
  SK.ai.chat = async function (...a) {
    const comeco = Date.now(); rodando++;
    if (SK.pref.get('aiTela', false) && !trava && 'wakeLock' in navigator) { try { trava = await navigator.wakeLock.request('screen'); } catch (e) {} }
    try { const r = await original.apply(this, a); if (ligado() && Date.now() - comeco > 8000) avisar(true, r); return r; }
    catch (e) { if (ligado() && Date.now() - comeco > 8000 && !(e && e.name === 'AbortError')) avisar(false, e && e.message); throw e; }
    finally { rodando--; if (!rodando && trava) { try { await trava.release(); } catch (e) {} trava = null; } }
  };
  async function pedir() {
    if (!('Notification' in window)) return false;
    if (Notification.permission === 'granted') return true;
    if (Notification.permission === 'denied') { SK.toast('As notificações estão bloqueadas para o Mini SK. Libere nas configurações do aparelho. Vou só apitar e vibrar.', 'error'); return false; }
    return (await Notification.requestPermission()) === 'granted';
  }
  // os botões entram na barra da IA (ela é montada depois; então espero aparecer)
  function botoes() {
    const g = document.getElementById('ai-c-guia'); if (!g || document.getElementById('ai-c-avisar')) return;
    const l = g.closest('label');
    const mk = (id, txt, tit, chave) => { const e = document.createElement('label'); e.className = 'chk'; e.title = tit; e.innerHTML = '<input type="checkbox" id="' + id + '"' + (SK.pref.get(chave, false) ? ' checked' : '') + '> ' + txt; return e; };
    const a = mk('ai-c-avisar', '🔔 Avisar', 'Quando a IA terminar (e demorou): apita, vibra e mostra notificação', 'aiAvisar');
    const t = mk('ai-c-tela', '🔆 Tela acesa', 'Enquanto a IA escreve, a tela não apaga', 'aiTela');
    l.after(a, t);
    a.querySelector('input').addEventListener('change', async (e) => { SK.pref.set('aiAvisar', e.target.checked); if (e.target.checked) { const ok = await pedir(); SK.toast(ok ? '🔔 Quando a IA terminar, eu apito, vibro e mostro notificação. Deixe o app aberto atrás.' : '🔔 Vou apitar e vibrar quando terminar.', 'ok'); } });
    t.querySelector('input').addEventListener('change', (e) => { SK.pref.set('aiTela', e.target.checked); });
  }
  new MutationObserver(botoes).observe(document.documentElement, { childList: true, subtree: true });
  SK.pronto = { avisar };
})(window.SK);
