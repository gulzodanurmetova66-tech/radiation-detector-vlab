/*
 * Gas-Filled Radiation Detector Virtual Laboratory — animation add-on, v0.3 preview.
 * Authors of the educational project: Gulzora Nurmetova and Erkin Bozorov.
 * This file augments, but does not alter, model.js / app.js.
 * Photon images: public-domain/CC0 photographs; see credit links displayed in the UI.
 * Animation is deliberately qualitative: not detector calibration or microscopic tracking.
 */
(function () {
  'use strict';
  const id = (x) => document.getElementById(x);
  const M = window.GasModel;
  if (!M || !id('detector') || !id('verdict')) {
    console.warn('Animated laboratory: existing simulator controls were not found.');
    return;
  }

  const photoData = {
    ion: {
      label: 'Ionization chambers — physical instruments',
      src: 'https://upload.wikimedia.org/wikipedia/commons/e/e6/Ionisation_Chambers_of_Different_Volumes.jpg',
      credit: 'Kieran Maher · Public domain · Wikimedia Commons',
      page: 'https://commons.wikimedia.org/wiki/File:Ionisation_Chambers_of_Different_Volumes.jpg',
      description: 'Real ionization chambers photographed in a medical radiation physics laboratory.'
    },
    prop: {
      label: 'Poppy — historical proportional counter',
      src: 'https://upload.wikimedia.org/wikipedia/commons/5/56/The_Poppy_was_developed_at_Hanford_and_earned_its_nickname_from_its_characteristic_audible_%E2%80%9Cpop.%E2%80%9D_It_is_a_proportional_counter_%28001d47f1-2c59-4f4a-9f05-a905264bf2b7%29.jpg',
      credit: 'U.S. National Park Service · Public domain · Wikimedia Commons',
      page: 'https://commons.wikimedia.org/wiki/File:The_Poppy_was_developed_at_Hanford_and_earned_its_nickname_from_its_characteristic_audible_%E2%80%9Cpop.%E2%80%9D_It_is_a_proportional_counter_(001d47f1-2c59-4f4a-9f05-a905264bf2b7).jpg',
      description: 'Actual historical proportional-counting instrument (not the simplified cross-section shown alongside).'
    },
    gm: {
      label: 'Geiger counter — physical instrument',
      src: 'https://upload.wikimedia.org/wikipedia/commons/b/b7/Geiger_counter_dosimeter_measuring_radiation_-_This_photo_has_been_released_into_the_public_domain._There_are_no_copyrights_you_can_use_and_modify_this_photo_without_asking%2C_and_without_attribution.JPG',
      credit: 'Kiwiev · CC0 1.0 · Wikimedia Commons',
      page: 'https://commons.wikimedia.org/wiki/File:Geiger_counter_dosimeter_measuring_radiation_-_This_photo_has_been_released_into_the_public_domain._There_are_no_copyrights_you_can_use_and_modify_this_photo_without_asking,_and_without_attribution.JPG',
      description: 'Real handheld Geiger counter. Internal animation is schematic, not a reconstruction of this product.'
    }
  };

  const css = document.createElement('style');
  css.textContent = `
    #gv-section .gv-layout{display:grid;grid-template-columns:minmax(0,0.9fr) minmax(0,1.4fr);gap:20px}
    #gv-section .gv-photo,#gv-section .gv-visual{background:#f4f8fc;border:1px solid #d9e6ee;border-radius:12px;padding:14px;min-width:0}
    #gv-section .gv-photo-frame{height:240px;display:grid;place-items:center;background:#e9f0f6;border-radius:9px;overflow:hidden}
    #gv-section .gv-photo-frame img{max-width:100%;max-height:100%;width:auto;height:auto;object-fit:contain}
    #gv-section .gv-photo-fallback{font-size:.85rem;color:#52687b;padding:22px;text-align:center}
    #gv-section .gv-credit,#gv-section .gv-note{font-size:.79rem;color:#4b6379;line-height:1.45}
    #gv-section .gv-credit a{color:#0c5e86;word-break:break-word}
    #gv-section .gv-stage{width:100%;height:auto;display:block;background:#edf5fb;border-radius:10px;border:1px solid #cbdce8}
    #gv-section .gv-controls{display:flex;flex-wrap:wrap;gap:9px;margin-top:12px}
    #gv-section .gv-controls button{width:auto;min-width:130px;margin:0;padding:8px 14px}
    #gv-section .gv-legend{display:flex;flex-wrap:wrap;gap:12px;margin:11px 0 4px;font-size:.8rem}
    #gv-section .gv-dot{display:inline-block;width:9px;height:9px;border-radius:50%;margin-right:5px}
    #gv-section .gv-status{font-weight:650;margin:10px 0 4px}
    #gv-section .gv-note{background:#fff8e9;padding:11px;border-left:4px solid #daa341;border-radius:6px;margin-top:13px}
    @media(max-width:860px){#gv-section .gv-layout{grid-template-columns:1fr}}
    @media(prefers-reduced-motion:reduce){#gv-section .gv-stage *{animation:none!important}}
  `;
  document.head.appendChild(css);

  const section = document.createElement('section');
  section.id = 'gv-section';
  section.innerHTML = `
    <h2>Animated detector processes — interactive schematic</h2>
    <p class="dim">Change the detector, voltage, deposited energy, incident event rate, or dead time above. The photograph and schematic respond to your selection.</p>
    <div class="gv-layout">
      <div class="gv-photo">
        <h3 id="gv-photo-title">Real detector photograph</h3>
        <div class="gv-photo-frame">
          <img id="gv-photo-img" alt="Photograph of the selected detector" loading="lazy" referrerpolicy="no-referrer" />
          <p id="gv-photo-error" class="gv-photo-fallback" hidden>The photograph could not load. Use the linked Wikimedia Commons source below.</p>
        </div>
        <p id="gv-photo-desc" class="gv-credit"></p>
        <p class="gv-credit"><a id="gv-photo-credit" target="_blank" rel="noopener noreferrer">Photograph and permission details</a></p>
      </div>
      <div class="gv-visual">
        <h3>Gas ionization and charge transport (schematic)</h3>
        <svg id="gv-stage" class="gv-stage" viewBox="0 0 600 340" role="img" aria-label="Educational animated gas detector cross-section">
          <defs>
            <linearGradient id="gv-gas" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#e3f7ff"/><stop offset="1" stop-color="#c7e8f4"/></linearGradient>
            <clipPath id="gv-inside"><rect x="74" y="77" width="452" height="203" rx="49"/></clipPath>
          </defs>
          <rect x="68" y="69" width="464" height="219" rx="57" fill="#546c82" stroke="#40546c" stroke-width="4"/>
          <rect x="74" y="77" width="452" height="203" rx="49" fill="url(#gv-gas)"/>
          <rect x="63" y="100" width="17" height="155" rx="8" fill="#9cb1c1"/>
          <rect x="521" y="100" width="17" height="155" rx="8" fill="#9cb1c1"/>
          <path d="M40 172H122" stroke="#855b8a" stroke-width="4" stroke-dasharray="9 6"/>
          <path d="M116 166l12 6-12 6" fill="#855b8a"/>
          <text x="25" y="154" fill="#6f477b" font-size="15">radiation</text>
          <line x1="350" y1="79" x2="350" y2="278" stroke="#ffeb8a" stroke-width="6"/>
          <line x1="350" y1="79" x2="350" y2="278" stroke="#b57625" stroke-width="2"/>
          <rect id="gv-flash" x="76" y="80" width="448" height="197" rx="47" fill="#ffc652" opacity="0" clip-path="url(#gv-inside)"/>
          <g id="gv-particles" clip-path="url(#gv-inside)"></g>
          <text x="310" y="43" fill="#a26b23" font-size="14">Anode (+)</text>
          <line x1="354" y1="48" x2="350" y2="68" stroke="#af7a3a"/>
          <text x="75" y="309" fill="#415c72" font-size="14">Cathode (−) / outer wall</text>
          <text x="454" y="309" fill="#415c72" font-size="14">Gas</text>
        </svg>
        <div class="gv-legend">
          <span><i class="gv-dot" style="background:#159ccb"></i>Electrons</span>
          <span><i class="gv-dot" style="background:#d56538"></i>Positive ions</span>
          <span><i class="gv-dot" style="background:#edc54b"></i>Secondary ionization</span>
        </div>
        <p id="gv-state" class="gv-status" aria-live="polite"></p>
        <p id="gv-explain" class="dim"></p>
        <div class="gv-controls">
          <button type="button" id="gv-toggle" class="secondary">Pause animation</button>
          <button type="button" id="gv-restart" class="secondary">Restart animation</button>
        </div>
      </div>
    </div>
    <p class="gv-note"><strong>Scientific limitation:</strong> this is a qualitative, not-to-scale visual explanation. The particle count, movement speed, avalanche glow and recovery animation are <em>not</em> Monte Carlo tracks, measured drift velocities, real-time pulses or calibrated operating voltages. The existing mathematical graphs remain unchanged. Photographs are genuine instruments; schematic geometry is generic.</p>
  `;
  id('verdict').closest('section').insertAdjacentElement('afterend', section);

  const svgNS = 'http://www.w3.org/2000/svg';
  const layer = id('gv-particles');
  const circles = [];
  for (let i = 0; i < 48; i++) {
    const c = document.createElementNS(svgNS, 'circle');
    c.setAttribute('r', i < 16 ? '5.2' : i < 32 ? '6.0' : '3.6');
    c.setAttribute('fill', i < 16 ? '#159ccb' : i < 32 ? '#d56538' : '#edc54b');
    c.setAttribute('stroke', '#fff');
    c.setAttribute('stroke-width', '0.8');
    layer.appendChild(c);
    circles.push(c);
  }
  const img = id('gv-photo-img');
  const imgError = id('gv-photo-error');
  img.addEventListener('error', () => { img.hidden = true; imgError.hidden = false; });
  img.addEventListener('load', () => { img.hidden = false; imgError.hidden = true; });

  let typeShown = null;
  let phase = 0;
  let running = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let lastTime = 0;
  const val = (n) => Number(id(n).value);
  const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
  const hash = (i) => { const n = Math.sin(i * 12.9898 + 4.12) * 43758.5453; return n - Math.floor(n); };

  function refreshText() {
    const det = id('detector').value;
    const voltage = val('voltage'), energy = val('energy'), rate = val('rate'), tau = val('tau');
    const data = photoData[det];
    if (typeShown !== det) {
      typeShown = det;
      imgError.hidden = true;
      img.hidden = false;
      img.src = data.src;
      img.alt = data.label;
      id('gv-photo-title').textContent = data.label;
      id('gv-photo-desc').textContent = data.description;
      id('gv-photo-credit').textContent = data.credit + ' — original and reuse information';
      id('gv-photo-credit').href = data.page;
    }
    const ionPairs = energy / M.W;
    const lostFraction = rate === 0 ? 0 : 100 * (1 - M.nonParalyzable(rate, tau) / rate);
    let state, description;
    if (det === 'ion') {
      const fraction = M.collection(voltage);
      state = 'Ionization chamber: primary charge collection';
      description = `At ${voltage} V, the educational collection factor is ${fraction.toFixed(3)}. ` +
        `Expected primary ion pairs: ${ionPairs.toFixed(1)}. Electrons and positive ions drift towards opposite electrodes; no modelled gas avalanche.`;
    } else if (det === 'prop') {
      const gain = M.gain(voltage);
      state = gain > 1.2 ? 'Proportional counter: avalanche near the anode' : 'Proportional counter: collection before appreciable gain';
      description = `The simplified gain factor is ${gain.toFixed(2)} at ${voltage} V. ` +
        'Yellow markers near the central anode illustrate secondary ionization when the educational gain increases.';
    } else {
      const p = M.gm(voltage);
      state = p > 0.55 ? 'Geiger–Müller: schematic propagating discharge' : 'Geiger–Müller: below the schematic discharge transition';
      description = `Normalized Geiger-regime response: ${p.toFixed(3)}. ` +
        `The flash and recovery cycle illustrate discharge, quenching and dead time; they are not actual time-scaled detector pulses.`;
    }
    id('gv-state').textContent = state;
    id('gv-explain').textContent = description + ` Non-paralyzable count loss: ${lostFraction.toFixed(1)}% at the selected incident rate and dead time.`;
  }

  function paint() {
    const det = id('detector').value, voltage = val('voltage');
    const energy = val('energy'), rate = val('rate'), tau = val('tau');
    const count = rate <= 0 ? 0 : clamp(Math.round(Math.sqrt(energy / M.W) * .75), 3, 16);
    const drift = clamp(0.20 + Math.sqrt(voltage / 1200) * 0.75, 0.20, 0.95);
    const progress = (phase * drift * 1.8) % 1;
    const gainVisible = det === 'prop' ? clamp((Math.log(M.gain(voltage)) / 4.5), 0, 1) : 0;
    const gmVisible = det === 'gm' ? M.gm(voltage) : 0;
    for (let i = 0; i < 16; i++) {
      const y = 104 + 135 * hash(i + 11);
      const origin = 160 + 110 * hash(i + 33);
      const p = (progress + i * 0.095) % 1;
      const e = circles[i], ion = circles[i + 16], avalanche = circles[i + 32];
      const visible = i < count && rate > 0;
      e.setAttribute('cx', (origin + (350 - origin) * p).toFixed(2));
      e.setAttribute('cy', (y + Math.sin(p * Math.PI) * 6).toFixed(2));
      e.setAttribute('opacity', visible ? '0.95' : '0');
      ion.setAttribute('cx', (origin - (origin - 86) * p).toFixed(2));
      ion.setAttribute('cy', y.toFixed(2));
      ion.setAttribute('opacity', visible ? '0.92' : '0');
      const active = (det === 'prop' ? gainVisible : det === 'gm' ? gmVisible : 0);
      const x = 350 + 35 * Math.cos((i / 16) * Math.PI * 2 + phase * 7);
      const ay = 100 + 135 * hash(i + 67);
      avalanche.setAttribute('cx', x.toFixed(2));
      avalanche.setAttribute('cy', ay.toFixed(2));
      avalanche.setAttribute('opacity', (visible ? active * (0.3 + 0.7 * Math.abs(Math.sin(phase * 8 + i))) : 0).toFixed(2));
    }
    const discharge = (det === 'gm' && rate > 0) ? gmVisible : 0;
    const pulse = (phase % 1) < 0.27 ? 1 : (phase % 1) < 0.48 ? 0.20 : 0;
    const recovery = clamp(tau / 400, 0, 1);
    id('gv-flash').setAttribute('opacity', (discharge * pulse * (0.3 + recovery * 0.18)).toFixed(3));
  }

  function redraw() { refreshText(); paint(); }
  ['detector','voltage','energy','rate','tau'].forEach(n => id(n).addEventListener('input', redraw));
  id('reset').addEventListener('click', () => requestAnimationFrame(redraw));
  id('gv-toggle').addEventListener('click', () => {
    running = !running;
    id('gv-toggle').textContent = running ? 'Pause animation' : 'Play animation';
    lastTime = 0;
  });
  id('gv-restart').addEventListener('click', () => { phase = 0; redraw(); });
  if (!running) id('gv-toggle').textContent = 'Play animation';
  function frame(timestamp) {
    if (running) {
      if (lastTime) phase = (phase + clamp((timestamp - lastTime) / 2600, 0, 0.08)) % 1;
      lastTime = timestamp;
      paint();
    } else lastTime = 0;
    window.requestAnimationFrame(frame);
  }
  redraw();
  window.requestAnimationFrame(frame);
})();
