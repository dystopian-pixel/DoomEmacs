/*
  Theme Creator for Doom Emacs — minimal, complete UI
  Exposes: window.ThemeCreator.mount(el, opts)
  opts: { initialName?: string, themesDir?: string, galleryDir?: string }
*/
(function(){
  function clampHex(h){ h=String(h||'').trim(); if(!/^#?[0-9a-f]{6}$/i.test(h)) return null; return '#'+h.replace(/^#/,'').toLowerCase(); }
  function el(tag, attrs){ const e=document.createElement(tag); for(const k in (attrs||{})){ if(k==='text') e.textContent=attrs[k]; else e.setAttribute(k, attrs[k]); } return e; }

  const DEFAULTS = {
    name: 'new-theme',
    palette: {
      bg:'#0f1117', bg_alt:'#151823', text:'#e5e7eb', muted:'#9aa4b2', border:'#2a2f3a',
      accent:'#51afef', accent2:'#a78bfa', red:'#f87171', green:'#34d399', blue:'#60a5fa',
      yellow:'#facc15', magenta:'#f472b6', cyan:'#22d3ee', orange:'#fb923c'
    }
  };

  function layout(){
    return `
      <style>
        .creator{display:grid;grid-template-columns:280px 1fr;gap:12px}
        .card{border:1px solid var(--border);background:var(--bg);border-radius:12px;padding:10px}
        .card h4{margin:.2rem 0 .6rem;font-size:13px}
        .row{display:flex;gap:8px;align-items:center;margin:6px 0}
        .inp{border:1px solid var(--border);background:var(--bg-2);color:var(--text);padding:.45rem .6rem;border-radius:10px;width:100%}
        .sw{width:22px;height:22px;border-radius:6px;border:1px solid var(--border)}
        .btnbar{display:flex;gap:8px;flex-wrap:wrap}
        .btn{border:1px solid var(--border);background:transparent;color:var(--text);padding:.45rem .7rem;border-radius:10px;cursor:pointer}
        .mini-preview{border:1px solid var(--border);border-radius:10px;padding:10px;margin-top:8px}
        .code{white-space:pre;overflow:auto;border:1px solid var(--border);border-radius:10px;padding:10px;background:var(--bg-2);max-height:40vh}
      </style>
      <div class="creator">
        <div class="card">
          <h4>Theme</h4>
          <div class="row"><label style="width:90px">Name</label><input id="tc-name" class="inp" placeholder="new-theme"/></div>
          <div class="row"><label style="width:90px">Category</label>
            <select id="tc-cat" class="inp">
              <option>pop</option><option>warm</option><option>cool</option>
              <option>earth</option><option>pastel</option><option>neon</option>
              <option>retro</option><option>mono</option>
            </select>
          </div>
          <div class="mini-preview" id="tc-mini">Preview text • modeline • selection</div>
        </div>
        <div class="card">
          <h4>Palette</h4>
          <div id="tc-roles"></div>
          <div class="btnbar" style="margin-top:8px">
            <button class="btn" id="tc-export">Export Doom Theme</button>
            <button class="btn" id="tc-apply">Preview Right</button>
          </div>
          <h4 style="margin-top:12px">Generated elisp</h4>
          <div class="code" id="tc-code"></div>
        </div>
      </div>`;
  }

  function rolesUI(pal){
    const keys = Object.keys(pal);
    const wrap = el('div');
    keys.forEach(k=>{
      const row = el('div', { class:'row' });
      row.innerHTML = `
        <label style="width:110px">${k}</label>
        <input class="inp" data-hex="${k}" value="${pal[k]}"/>
        <input type="color" data-color="${k}" value="${pal[k]}"/>
        <span class="sw" style="background:${pal[k]}"></span>`;
      wrap.appendChild(row);
    });
    return wrap;
  }

  function genElisp(name, pal){
    const lines = [];
    lines.push(`;;; ${name}.el  -*- lexical-binding: t; -*-`);
    lines.push(`(require 'doom-themes)`);
    lines.push(`(defgroup ${name} nil "Auto theme" :group 'doom-themes)`);
    lines.push(`(def-doom-theme ${name}`);
    lines.push(`  "${name} (generated)"`);
    lines.push(`  ((bg         '("${pal.bg}" nil nil))`);
    lines.push(`   (fg         '("${pal.text}" nil nil))`);
    lines.push(`   (cursor     '("${pal.text}" nil nil))`);
    lines.push(`   (selection  '("${pal.accent}" nil nil))`);
    lines.push(`   (modeline-bg '("${pal.bg_alt}" nil nil))`);
    lines.push(`   (comments   '("${pal.muted}" nil nil))`);
    lines.push(`   (constants  '("${pal.cyan}" nil nil))`);
    lines.push(`   (keywords   '("${pal.magenta}" nil nil))`);
    lines.push(`   (strings    '("${pal.green}" nil nil))`);
    lines.push(`   (type       '("${pal.yellow}" nil nil))`);
    lines.push(`   (variables  '("${pal.orange}" nil nil)))`);
    lines.push(`  ())`);
    lines.push(`(provide '${name})`);
    return lines.join("\\n");
  }

  const ThemeCreator = {
    mount(el, opts){
      const state = {
        name: (opts.initialName||DEFAULTS.name).replace(/[^a-z0-9-]+/gi,'-').replace(/^-+|-+$/g,'').toLowerCase(),
        cat: 'pop',
        palette: { ...DEFAULTS.palette }
      };

      el.innerHTML = layout();
      const $ = (s,r=el)=>r.querySelector(s);

      // Populate palette editor
      const roles = $('#tc-roles');
      roles.innerHTML = '';
      roles.appendChild(rolesUI(state.palette));

      // Wire inputs
      const nameInput = $('#tc-name'); nameInput.value = state.name;
      nameInput.addEventListener('input', ()=>{
        state.name = nameInput.value.replace(/[^a-z0-9-]+/gi,'-').replace(/^-+|-+$/g,'').toLowerCase();
        nameInput.value = state.name;
        updateMini();
        renderCode();
      });
      const catSel = $('#tc-cat'); catSel.value = state.cat;
      catSel.addEventListener('change', ()=> state.cat = catSel.value);

      roles.addEventListener('input', e=>{
        const hex = e.target.closest('input[data-hex]');
        const col = e.target.closest('input[type=color][data-color]');
        if(hex){
          const key = hex.dataset.hex;
          const val = clampHex(hex.value);
          if(val){ state.palette[key] = val; hex.value = val; hex.parentElement.querySelector('.sw').style.background = val; }
          renderCode(); updateMini();
        }
        if(col){
          const key = col.dataset.color;
          const val = clampHex(col.value);
          if(val){ state.palette[key] = val; col.value = val; col.parentElement.querySelector('input[data-hex="'+key+'"]').value = val; col.parentElement.querySelector('.sw').style.background = val; }
          renderCode(); updateMini();
        }
      });

      function updateMini(){
        const mini = $('#tc-mini');
        mini.style.background = state.palette.bg;
        mini.style.color = state.palette.text;
        mini.style.borderColor = state.palette.border;
        mini.innerHTML = '<div style="display:flex;gap:8px;flex-wrap:wrap"><span>fg</span><span style="color:'+state.palette.muted+'">muted</span><span style="background:'+state.palette.selection+';padding:2px 6px;border-radius:6px">selection</span></div>';
      }

      function renderCode(){
        $('#tc-code').textContent = genElisp(state.name, state.palette);
      }

      $('#tc-export').addEventListener('click', ()=>{
        const blob = new Blob([genElisp(state.name, state.palette)], {type:'text/plain;charset=utf-8'});
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = state.name + '.el'; a.click();
        setTimeout(()=> URL.revokeObjectURL(a.href), 500);
      });

      $('#tc-apply').addEventListener('click', ()=>{
        const cap = document.getElementById('preview-caption');
        const img = document.getElementById('preview-img');
        if(cap) cap.textContent = state.name + ' (previewed)';
        if(img) img.alt = 'Preview: '+state.name;
      });

      // First render
      updateMini();
      renderCode();
    }
  };

  window.ThemeCreator = window.ThemeCreator || {};
  window.ThemeCreator.mount = ThemeCreator.mount;
})();
