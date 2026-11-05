/* 飛脚もぐら：Wixカスタム要素
   使い方：Wix「カスタム要素」で Server URL にこのファイルのURL、Tag Name に hikyaku-mogura
   属性（省略可）: href="/asobiba"  wait="60"  right="275"  right-mobile="150"
   動作確認：ページURLの末尾に ?mogura=now を付けると待ち時間なしで出る */
(function () {
  const findSrc = () => {
    if (document.currentScript && document.currentScript.src) return document.currentScript.src;
    const s = Array.from(document.scripts).find(e => /mogura\.js/.test(e.src || ''));
    return s ? s.src : location.href;
  };
  const BASE = new URL('.', findSrc()).href;
  const IMG = {
    m1: 'w_mogura_01.png', m2: 'w_mogura_02.png', m3: 'w_mogura_03.png', m4: 'w_mogura_04.png',
    m5: 'w_mogura_05.png', m6: 'w_mogura_06.png', m11: 'w_mogura_11L.png',
    t1: 'w_tsuchi_01.png', t2: 'w_tsuchi_02.png', t3: 'w_tsuchi_03.png', t4: 'w_tsuchi_04.png',
    t5: 'w_tsuchi_05.png', t6: 'w_tsuchi_06.png', t7: 'w_tsuchi_07.png', t8: 'w_tsuchi_08.png',
    ridge: 'w_ridge.png'
  };
  const src = k => BASE + IMG[k];
  const sleep = ms => new Promise(r => setTimeout(r, ms));

  class HikyakuMogura extends HTMLElement {
    connectedCallback() {
      if (this._started) return; this._started = true;
      const href = this.getAttribute('href') || '/asobiba';
      const wait = Number(this.getAttribute('wait') || 60) * 1000;
      const rightPC = Number(this.getAttribute('right') || 275);
      const rightSP = Number(this.getAttribute('right-mobile') || 150);
      const now = /[?&]mogura=now/.test(location.search);
      // 1回の訪問で1度だけ（保存が使えない環境では毎回出る）
      try { if (!now && sessionStorage.getItem('hikyakuMoguraShown')) return; } catch (e) {}

      const root = this.attachShadow({ mode: 'open' });
      root.innerHTML = `
<style>
:host{all:initial}
#stage{position:fixed;left:0;right:0;bottom:0;height:340px;pointer-events:none;overflow:hidden;z-index:9000;--w:130px;font-family:sans-serif}
@media (max-width:700px){#stage{--w:100px}}
#ridge{position:absolute;bottom:0;height:calc(var(--w)*0.26);width:0;background:url(${src('ridge')}) repeat-x left bottom / auto 100%;transition:opacity 1.2s}
#spot{position:absolute;bottom:0;left:6px;width:var(--w);height:340px}
#mound,#pieces{position:absolute;left:50%;bottom:0;transform:translateX(-50%)}
#mound{width:var(--w);display:none;z-index:1}
#clip{position:absolute;left:50%;bottom:calc(var(--w)*0.41);width:calc(var(--w)*1.3);transform:translateX(-50%);height:340px;overflow:hidden;z-index:2}
#mole{position:absolute;left:50%;bottom:0;width:calc(var(--w)*0.9);transform:translateX(-50%) translateY(100%);transition:transform .45s cubic-bezier(.2,.9,.3,1.2);pointer-events:auto;cursor:pointer;display:none}
#pieces{width:calc(var(--w)*0.8);bottom:60px;display:none;z-index:3;opacity:.95}
#bubble{position:absolute;left:-30px;bottom:200px;background:#fff;border:2px solid #3aa0d8;border-radius:16px;padding:8px 14px;font-size:15px;color:#1a4a6a;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,.15);display:none;z-index:4;pointer-events:auto;cursor:pointer}
#bubble:after{content:"";position:absolute;left:70px;bottom:-10px;border:10px solid transparent;border-top-color:#3aa0d8;border-bottom:0}
@media (max-width:700px){#bubble{font-size:13px;bottom:160px}}
</style>
<div id="stage"><div id="ridge"></div><div id="spot">
  <div id="clip"><img id="mole" alt="飛脚もぐら"></div>
  <img id="mound" alt="">
  <img id="pieces" alt="">
  <div id="bubble">ちょっと遊んでく？</div>
</div></div>`;
      const $ = id => root.getElementById(id);
      const stage = $('stage'), spot = $('spot'), mound = $('mound'), mole = $('mole'), pieces = $('pieces'), bubble = $('bubble'), ridge = $('ridge');
      pieces.src = src('t8');
      let clicked = false;
      const setMound = n => { if (n) { mound.src = src('t' + n); mound.style.display = 'block'; } else mound.style.display = 'none'; };
      const face = n => { mole.src = src('m' + n); };
      const moleUp = () => { mole.style.display = 'block'; requestAnimationFrame(() => { mole.style.transform = 'translateX(-50%) translateY(38%)'; }); };
      const moleDown = () => { mole.style.transform = 'translateX(-50%) translateY(100%)'; };
      const burst = async () => { pieces.style.display = 'block'; await sleep(250); pieces.style.display = 'none'; };
      const go = () => { if (clicked) return; clicked = true; location.href = href; };
      mole.addEventListener('click', go); bubble.addEventListener('click', go);
      const endX = () => { const w = parseFloat(getComputedStyle(spot).width); const r = window.innerWidth <= 700 ? rightSP : rightPC; return Math.max(window.innerWidth - r - w, 10); };
      const chk = () => !clicked && this.isConnected;

      const preload = () => Object.keys(IMG).forEach(k => { const i = new Image(); i.src = src(k); });

      (async () => {
        if (!now) await sleep(wait); else await sleep(500);
        if (!chk()) return;
        preload(); await sleep(400);
        try { sessionStorage.setItem('hikyakuMoguraShown', '1'); } catch (e) {}
        spot.style.left = '6px';
        setMound(1); await sleep(350); setMound(2); await sleep(350); setMound(3); await sleep(350); setMound(4);
        face(1); moleUp(); await sleep(600); if (!chk()) return;
        for (const f of [2, 3, 2, 11]) { face(f); await sleep(f === 11 ? 900 : 450); if (!chk()) return; }
        face(1); await sleep(300);
        moleDown(); await sleep(350); burst(); setMound(7); await sleep(400); if (!chk()) return;
        const x0 = 6, x1 = endX(); const dur = 3500, t0 = performance.now(); let k = 0;
        const sw = parseFloat(getComputedStyle(spot).width);
        ridge.style.opacity = '1'; ridge.style.left = (x0 + sw * 0.1) + 'px'; ridge.style.width = '0px';
        while (true) {
          const t = performance.now() - t0; if (t >= dur) break;
          const x = x0 + (x1 - x0) * t / dur; spot.style.left = x + 'px'; setMound(5 + (k++ % 2));
          ridge.style.width = Math.max(0, (x + sw * 0.6) - (x0 + sw * 0.1)) + 'px';
          await sleep(220); if (!chk()) return;
        }
        spot.style.left = x1 + 'px';
        setMound(1); await sleep(300); setMound(2); await sleep(300); setMound(3); await sleep(300); setMound(4);
        face(1); moleUp(); await sleep(500); if (!chk()) return;
        face(3); await sleep(600); face(4); await sleep(700); if (!chk()) return;
        face(5); bubble.style.display = 'block';
        for (let i = 0; i < 15; i++) { await sleep(1000); if (!chk()) return; }
        bubble.style.display = 'none'; face(6); await sleep(900); if (!chk()) return;
        moleDown(); await sleep(350); burst(); setMound(7); await sleep(800);
        ridge.style.opacity = '0'; await sleep(1300); setMound(0); ridge.style.width = '0px';
        stage.remove();
      })();
    }
  }
  if (!customElements.get('hikyaku-mogura')) customElements.define('hikyaku-mogura', HikyakuMogura);
})();
