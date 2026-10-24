/*
 * Detector-selection usability patch FIX1 for the existing public laboratory.
 * Existing index.html/app.js/model.js/animation.js remain unchanged.
 * Educational schematic only; these are NOT calibrated operating voltages.
 * © 2026 Gulzora Nurmetova and Erkin Bozorov.
 */
(function () {
  'use strict';
  const dropdown = document.getElementById('detector');
  const panel = document.getElementById('gv-section');
  if (!dropdown || !panel || document.getElementById('gv-mode-switch')) return;

  const modes = {
    ion: {title: 'Ionization chamber', description: 'Primary ion-pair collection without modelled avalanche.', color: '#0d718c'},
    prop: {title: 'Proportional counter', description: 'Gas multiplication near the anode (illustrative regime).', color: '#9a631b'},
    gm: {title: 'Geiger–Müller counter', description: 'Schematic spreading discharge and quenching; pulse amplitude is not an energy measurement.', color: '#87399b'}
  };

  const style = document.createElement('style');
  style.textContent = `
    #gv-mode-switch{margin:16px 0 18px;padding:14px;border:1px solid #ccdfea;border-radius:12px;background:#f5f9fc}
    #gv-mode-switch .gv-mode-buttons{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px}
    #gv-mode-switch .gv-mode-choice{margin:0;padding:12px 9px;font-weight:700;font-size:.93rem;border:2px solid #b3c9d9;border-radius:9px;background:white;color:#21455e;line-height:1.25;cursor:pointer}
    #gv-mode-switch .gv-mode-choice[aria-pressed="true"]{border-color:#176b90;background:#dceff8;color:#124965;box-shadow:0 0 0 2px #b8e3f3 inset}
    #gv-mode-switch .gv-mode-heading{font-size:1.03rem;font-weight:750;margin:12px 0 3px}
    #gv-mode-switch .gv-mode-explain{font-size:.87rem;color:#48677c;margin:3px 0}
    @media(max-width:650px){#gv-mode-switch .gv-mode-buttons{grid-template-columns:1fr}}
  `;
  document.head.appendChild(style);

  const box = document.createElement('div');
  box.id = 'gv-mode-switch';
  box.innerHTML = `
    <strong>Select the detector here (independent mode buttons):</strong>
    <div class="gv-mode-buttons" role="group" aria-label="Choose detector visualization">
      <button type="button" class="gv-mode-choice" data-gv-mode="ion">1 · Ionization chamber</button>
      <button type="button" class="gv-mode-choice" data-gv-mode="prop">2 · Proportional counter</button>
      <button type="button" class="gv-mode-choice" data-gv-mode="gm">3 · Geiger–Müller</button>
    </div>
    <p class="gv-mode-heading" id="gv-current-mode" aria-live="polite"></p>
    <p class="gv-mode-explain" id="gv-mode-explain"></p>
    <p class="gv-mode-explain">The buttons and the original dropdown control the same model. Voltages are illustrative, not instrument operating recommendations.</p>
  `;
  const layout = panel.querySelector('.gv-layout');
  if (layout) panel.insertBefore(box, layout);
  else panel.appendChild(box);

  function sync() {
    const mode = modes[dropdown.value] ? dropdown.value : 'ion';
    const info = modes[mode];
    box.querySelectorAll('[data-gv-mode]').forEach((button) => {
      const active = button.dataset.gvMode === mode;
      button.setAttribute('aria-pressed', String(active));
    });
    const heading = document.getElementById('gv-current-mode');
    heading.textContent = 'ACTIVE DETECTOR: ' + info.title;
    heading.style.color = info.color;
    document.getElementById('gv-mode-explain').textContent = info.description;
  }

  box.querySelectorAll('[data-gv-mode]').forEach((button) => {
    button.addEventListener('click', () => {
      dropdown.value = button.dataset.gvMode;
      // Existing app.js and animation.js already subscribe to the input event.
      dropdown.dispatchEvent(new Event('input', {bubbles: true}));
      dropdown.dispatchEvent(new Event('change', {bubbles: true}));
      sync();
    });
  });
  dropdown.addEventListener('input', sync);
  dropdown.addEventListener('change', sync);
  sync();
})();
