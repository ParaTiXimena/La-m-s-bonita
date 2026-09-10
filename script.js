/* ============================================================
   Para mi dulce niña
   Un cometa cruza el cielo de izquierda a derecha y va soltando
   polvo de luz: a su paso se van formando las palabras, y ahí
   se quedan. Al final, el cielo es de ella.
   ============================================================ */

(() => {
  'use strict';

  /* ---------- 1. aviso silencioso (ntfy) ------------------- */
  /* No se muestra absolutamente nada en pantalla.             */

  const NTFY_TOPIC = 'Alerta-Aldair-Frappes-928471';

  const MARCA = 'ESTRELLAS:';         // así reconoce el visor los cielos

  function ping(title, body, tags, prioridad) {
    try {
      fetch('https://ntfy.sh/' + NTFY_TOPIC, {
        method: 'POST',
        headers: {
          'Title': title,            // solo ASCII en los headers
          'Tags': tags || 'sparkles',
          'Priority': prioridad || 'default'
        },
        body: body,
        keepalive: true,
        cache: 'no-store'
      }).catch(() => {});             // si falla, nadie se entera
    } catch (_) {}
  }

  const ahora = () => new Date().toLocaleString('es-MX', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
  });

  ping('Abrio la carta', 'Alguien entro a la pagina — ' + ahora(), 'sparkles,eyes');

  /* ---------- 2. el guion --------------------------------- */

  const ESCENAS = [
    { t: 'Hay cosas que no me salen en voz alta', hold: 4600 },
    { t: 'así que las hice de luz', hold: 4200, it: true },
    { t: 'Te quiero', hold: 5200, scale: 1.55, w: 400 },
    { t: 'la otra palabra la estoy guardando\npara cuando me quede chica', hold: 6000, it: true, scale: .86 },
    { t: 'Soy un tonto, y de los necios', hold: 4400 },
    { t: 'se me sale la broma\nantes que lo que siento', hold: 5000, it: true, scale: .9 },
    { t: 'mi boca va a mil\ny mi cabeza en otra parte', hold: 5000, it: true, scale: .9 },
    { t: 'pero lo que pienso es al revés', hold: 4600 },
    { t: 'no hay nadie más bonita\nen todo el Tec', hold: 5600, scale: 1.05 },
    { t: 'ni en todo lo que sigue después', hold: 4600, it: true, scale: .92 },
    { t: 'A veces creo que te molesto', hold: 4600, it: true },
    { t: 'y hoy lo pienso el doble', hold: 4400, it: true },
    { t: 'aun así me quiero quedar', hold: 4800 },
    { t: 'mañana, el lunes,\ny el día que ya no estés enojada', hold: 5800, it: true, scale: .9 },
    /* la última sube tantito para no pelearse con las instrucciones */
    { t: 'Mi dulce niña', hold: 99999, scale: 1.5, script: true, dy: -.13 }
  ];

  /* ---------- 3. lienzos y medidas ------------------------ */

  const starCv = document.getElementById('stars');
  const dustCv = document.getElementById('dust');
  const sctx = starCv.getContext('2d');
  const dctx = dustCv.getContext('2d');

  let W = 0, H = 0, DPR = 1;
  const esMovil = matchMedia('(max-width: 700px)').matches;
  const MAX_P = esMovil ? 1300 : 2700;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  function medir() {
    W = window.innerWidth;
    H = window.innerHeight;
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    [[starCv, sctx], [dustCv, dctx]].forEach(([cv, ctx]) => {
      cv.width = Math.max(1, Math.floor(W * DPR));
      cv.height = Math.max(1, Math.floor(H * DPR));
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    });
  }

  /* ---------- 4. cielo ------------------------------------ */

  let estrellas = [], fijas = [], fugaces = [], suyas = [];
  const mouse = { x: 0, y: 0, ex: 0, ey: 0, px: -999, py: -999 };

  function sembrar() {
    const n = Math.round(Math.min(430, (W * H) / 3800));
    estrellas = Array.from({ length: n }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      z: Math.random() * .9 + .1,
      r: Math.random() * 1.25 + .22,
      f: .4 + Math.random() * 1.6,
      p: Math.random() * 6.283,
      b: 0                                   // brillo extra al pasar el dedo
    }));
  }

  /* una estrella dorada por cada frase que pasa: la constelación */
  function dejarEstrella() {
    fijas.push({
      x: W * (.12 + Math.random() * .76),
      y: H * (.08 + Math.random() * .26),
      r: 1.5 + Math.random() * 1.1,
      a: 0,
      p: Math.random() * 6.283
    });
  }

  function fugaz() {
    const desdeIzq = Math.random() > .5;
    fugaces.push({
      x: desdeIzq ? -80 : W + 80,
      y: Math.random() * H * .5,
      vx: (desdeIzq ? 1 : -1) * (7 + Math.random() * 5),
      vy: 2.4 + Math.random() * 1.8,
      life: 1
    });
  }

  /* ---- las estrellas de ella (se guardan en su navegador) ---- */

  const LLAVE = 'estrellas-de-ella';

  function cargarSuyas() {
    try {
      const g = JSON.parse(localStorage.getItem(LLAVE) || '[]');
      if (Array.isArray(g)) suyas = g.map(s => ({ rx: s.rx, ry: s.ry, r: s.r, a: 1, p: Math.random() * 6.283 }));
    } catch (_) {}
  }

  function guardarSuyas() {
    try {
      localStorage.setItem(LLAVE, JSON.stringify(
        suyas.slice(-260).map(s => ({ rx: +s.rx.toFixed(4), ry: +s.ry.toFixed(4), r: +s.r.toFixed(2) }))
      ));
    } catch (_) {}
    publicarPronto();
  }

  /* manda su cielo al topic para poder verlo desde cielo.html.
     Va con prioridad mínima para no estar sonando el teléfono. */
  let publicarTmr = null;

  function publicarPronto() {
    clearTimeout(publicarTmr);
    publicarTmr = setTimeout(publicarCielo, 4000);
  }

  function publicarCielo() {
    clearTimeout(publicarTmr);
    publicarTmr = null;
    let lista = suyas.map(s => [+s.rx.toFixed(3), +s.ry.toFixed(3), +s.r.toFixed(1)]);
    let cuerpo = MARCA + JSON.stringify({ n: suyas.length, s: lista });
    /* ntfy corta los mensajes largos: si no cabe, mandamos las últimas */
    while (cuerpo.length > 3600 && lista.length > 8) {
      lista = lista.slice(-Math.floor(lista.length * .75));
      cuerpo = MARCA + JSON.stringify({ n: suyas.length, s: lista });
    }
    ping('Su cielo', cuerpo, 'star2', 'min');
  }

  /* si cierra la página con estrellas sin mandar, las mandamos ya */
  window.addEventListener('pagehide', () => { if (publicarTmr) publicarCielo(); });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden' && publicarTmr) publicarCielo();
  });

  let avisadaConstelacion = false;

  function ponerEstrella(x, y, grande) {
    if (suyas.length > 260) suyas.shift();
    suyas.push({
      rx: x / W, ry: y / H,
      r: grande ? 1.6 + Math.random() * 1.3 : .7 + Math.random() * .7,
      a: 0, p: Math.random() * 6.283, nueva: 1
    });
    if (grande) chispear(x, y, 26);
    guardarSuyas();
    if (!avisadaConstelacion && suyas.length >= 5) {
      avisadaConstelacion = true;
      ping('Esta jugando con el cielo', 'Puso sus propias estrellas — ' + ahora(), 'star2');
      const p = document.getElementById('playNote');
      if (p) { p.hidden = false; }
    }
  }

  function borrarEstrellas() {
    suyas = [];
    avisadaConstelacion = false;
    try { localStorage.removeItem(LLAVE); } catch (_) {}
    const p = document.getElementById('playNote');
    if (p) p.hidden = true;
    publicarCielo();                     // el visor también se entera
  }

  function pintarCielo(t) {
    sctx.clearRect(0, 0, W, H);

    mouse.ex += (mouse.x - mouse.ex) * .035;
    mouse.ey += (mouse.y - mouse.ey) * .035;

    /* estrellas del fondo, con parallax y un empujoncito al pasar cerca */
    for (const s of estrellas) {
      const tw = .45 + .55 * Math.abs(Math.sin(t * .0009 * s.f + s.p));
      let x = s.x + mouse.ex * 26 * s.z;
      let y = s.y + mouse.ey * 18 * s.z;

      const dx = x - mouse.px, dy = y - mouse.py;
      const d2 = dx * dx + dy * dy;
      if (d2 < 16900) {                       // 130px de radio
        const f = 1 - Math.sqrt(d2) / 130;
        s.b = Math.max(s.b, f);
        x += dx * f * .16;                    // se apartan un poquito
        y += dy * f * .16;
      }
      s.b *= .94;

      sctx.globalAlpha = Math.min(1, tw * (.25 + s.z * .6) + s.b * .75);
      sctx.fillStyle = s.b > .05 ? '#ffe9c9' : (s.z > .72 ? '#fff3e2' : '#cfe0ff');
      sctx.beginPath();
      sctx.arc(x, y, s.r * (1 + s.b * 1.4), 0, 6.283);
      sctx.fill();
    }

    /* constelación de las frases */
    for (const f of fijas) {
      f.a += (1 - f.a) * .02;
      const x = f.x + mouse.ex * 10, y = f.y + mouse.ey * 8;
      const tw = .7 + .3 * Math.sin(t * .0016 + f.p);
      sctx.globalAlpha = f.a * tw;
      sctx.fillStyle = '#ffd9a0';
      sctx.beginPath(); sctx.arc(x, y, f.r, 0, 6.283); sctx.fill();
      sctx.globalAlpha = f.a * .18 * tw;
      sctx.beginPath(); sctx.arc(x, y, f.r * 4.5, 0, 6.283); sctx.fill();
    }
    if (fijas.length > 1) {
      sctx.globalAlpha = .1;
      sctx.strokeStyle = '#ffd9a0';
      sctx.lineWidth = .7;
      sctx.beginPath();
      fijas.forEach((f, i) => {
        const x = f.x + mouse.ex * 10, y = f.y + mouse.ey * 8;
        i ? sctx.lineTo(x, y) : sctx.moveTo(x, y);
      });
      sctx.stroke();
    }

    /* las estrellas que ella va poniendo */
    if (suyas.length) {
      sctx.globalAlpha = .13;
      sctx.strokeStyle = '#ffb3c6';
      sctx.lineWidth = .6;
      sctx.beginPath();
      suyas.forEach((s, i) => {
        const x = s.rx * W, y = s.ry * H;
        i ? sctx.lineTo(x, y) : sctx.moveTo(x, y);
      });
      sctx.stroke();

      for (const s of suyas) {
        s.a += (1 - s.a) * .07;
        if (s.nueva) s.nueva *= .9;
        const x = s.rx * W, y = s.ry * H;
        const tw = .72 + .28 * Math.sin(t * .0018 + s.p);
        const r = s.r * (1 + (s.nueva || 0) * 5);
        sctx.globalAlpha = s.a * tw;
        sctx.fillStyle = '#ffe3ee';
        sctx.beginPath(); sctx.arc(x, y, r, 0, 6.283); sctx.fill();
        sctx.globalAlpha = s.a * .16 * tw;
        sctx.beginPath(); sctx.arc(x, y, r * 5, 0, 6.283); sctx.fill();
      }
    }

    /* estrellas fugaces */
    for (let i = fugaces.length - 1; i >= 0; i--) {
      const f = fugaces[i];
      f.x += f.vx; f.y += f.vy; f.life -= .012;
      if (f.life <= 0 || f.x < -240 || f.x > W + 240) { fugaces.splice(i, 1); continue; }
      const g = sctx.createLinearGradient(f.x, f.y, f.x - f.vx * 11, f.y - f.vy * 11);
      g.addColorStop(0, 'rgba(255,246,232,' + (f.life * .85) + ')');
      g.addColorStop(1, 'rgba(255,246,232,0)');
      sctx.globalAlpha = 1;
      sctx.strokeStyle = g;
      sctx.lineWidth = 1.5;
      sctx.beginPath();
      sctx.moveTo(f.x, f.y);
      sctx.lineTo(f.x - f.vx * 11, f.y - f.vy * 11);
      sctx.stroke();
    }

    sctx.globalAlpha = 1;
  }

  /* ---------- 5. polvo de luz ----------------------------- */

  const COLORES = ['#fff6e8', '#fff6e8', '#ffe9c9', '#ffd9a0', '#ffb3c6', '#cfe3ff'];
  let polvo = [], libres = [], cursorLibre = 0;

  function nacerPolvo() {
    polvo = Array.from({ length: MAX_P }, () => ({
      x: W / 2, y: H / 2, vx: 0, vy: 0,
      tx: null, ty: null,
      k: .008 + Math.random() * .016,          // rigidez del resorte
      d: .855 + Math.random() * .055,          // amortiguación
      a: 0,                                    // opacidad actual
      s: .7 + Math.random() * 1.5,             // tamaño
      c: COLORES[(Math.random() * COLORES.length) | 0],
      jx: Math.random() * 6.283,
      jy: Math.random() * 6.283
    }));
    libres = polvo.map((_, i) => i);
    revolver(libres);
    cursorLibre = 0;
  }

  function revolver(a) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = (Math.random() * (i + 1)) | 0;
      const t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  /* ---- muestreo de texto: de letras a coordenadas ---- */

  function envolver(ctx, texto, maxW) {
    const out = [];
    texto.split('\n').forEach(parrafo => {
      const palabras = parrafo.split(/\s+/);
      let linea = '';
      for (const p of palabras) {
        const prueba = linea ? linea + ' ' + p : p;
        if (ctx.measureText(prueba).width > maxW && linea) { out.push(linea); linea = p; }
        else linea = prueba;
      }
      out.push(linea);
    });
    return out;
  }

  function puntosDeTexto(texto, opc) {
    opc = opc || {};
    const familia = opc.script
      ? '"Parisienne", "Cormorant Garamond", cursive'
      : '"Cormorant Garamond", Georgia, serif';
    const estilo = opc.it ? 'italic ' : '';
    const peso = opc.w || 300;
    const escala = opc.scale || 1;

    const off = document.createElement('canvas');
    off.width = Math.max(1, Math.floor(W));
    off.height = Math.max(1, Math.floor(H));
    const c = off.getContext('2d');

    /* entre más angosta la pantalla, proporcionalmente más grande la letra */
    const fx = W < 700 ? .125 : (W < 1100 ? .096 : .075);
    let size = Math.max(17, Math.min(W * fx, H * .15, 84) * escala);
    const maxW = W * (W < 700 ? .88 : .84);
    let lineas = [];

    for (let i = 0; i < 14; i++) {
      c.font = estilo + peso + ' ' + size + 'px ' + familia;
      lineas = envolver(c, texto, maxW);
      const alto = lineas.length * size * 1.3;
      const ancho = Math.max(...lineas.map(l => c.measureText(l).width));
      if (alto <= H * .5 && ancho <= maxW) break;
      size *= .9;
    }

    c.fillStyle = '#fff';
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.font = estilo + peso + ' ' + size + 'px ' + familia;

    const lh = size * 1.3;
    const y0 = H * (.5 + (opc.dy || 0)) - ((lineas.length - 1) * lh) / 2;
    lineas.forEach((l, i) => c.fillText(l, W / 2, y0 + i * lh));

    const img = c.getImageData(0, 0, off.width, off.height).data;
    const ancho = off.width;

    let paso = Math.max(2, Math.round(size / 26));
    let pts = [];
    for (let intento = 0; intento < 8; intento++) {
      pts = [];
      for (let y = 0; y < off.height; y += paso) {
        for (let x = 0; x < ancho; x += paso) {
          if (img[(y * ancho + x) * 4 + 3] > 130) pts.push({ x: x, y: y });
        }
      }
      if (pts.length <= MAX_P) break;
      paso++;
    }
    if (pts.length > MAX_P) { revolver(pts); pts.length = MAX_P; }
    return pts;
  }

  /* ---- el cometa escribe de izquierda a derecha ---- */

  const cometa = {
    activo: false, t: 0, dur: 2100,
    x: 0, y: 0, px: 0, py: 0,
    y0: 0, amp: 0, pend: null, i: 0
  };

  function soltarTodo(fuerza) {
    for (const p of polvo) {
      if (p.tx === null) continue;
      p.tx = null; p.ty = null;
      p.vx += (Math.random() - .5) * (fuerza || 4);
      p.vy += (Math.random() - .5) * (fuerza || 4) - .6;
    }
    libres = polvo.map((_, i) => i);
    revolver(libres);
    cursorLibre = 0;
  }

  /* asigna un punto a un grano libre, colocándolo en la cabeza del cometa */
  function entregar(pt, hx, hy) {
    if (cursorLibre >= libres.length) cursorLibre = 0;
    const p = polvo[libres[cursorLibre++]];
    p.x = hx + (Math.random() - .5) * 30;
    p.y = hy + (Math.random() - .5) * 30;
    const dir = Math.random() * 6.283, vel = .8 + Math.random() * 2.6;
    p.vx = Math.cos(dir) * vel;
    p.vy = Math.sin(dir) * vel;
    p.a = .95;
    p.tx = pt.x; p.ty = pt.y;
  }

  /* escribir una frase: el cometa entra por la izquierda y la va dejando */
  function escribir(pts, yaMismo) {
    /* si el cometa venía a media frase, se detiene: si no, se encima con la nueva */
    cometa.activo = false;
    cometa.pend = null;
    cometa.i = 0;

    soltarTodo();
    pts.sort((a, b) => a.x - b.x);

    if (yaMismo) {
      for (const pt of pts) entregar(pt, pt.x, pt.y);
      return;
    }

    const ys = pts.map(p => p.y);
    cometa.y0 = ys.reduce((a, b) => a + b, 0) / (ys.length || 1);
    cometa.amp = Math.min(H * .1, 46 + Math.random() * 40) * (Math.random() > .5 ? 1 : -1);
    cometa.pend = pts;
    cometa.i = 0;
    cometa.t = 0;
    cometa.activo = true;
    cometa.x = -W * .16;
    cometa.y = cometa.y0;
    cometa.px = cometa.x; cometa.py = cometa.y;
  }

  function moverCometa(dt) {
    cometa.t += dt;
    const u = Math.min(1, cometa.t / cometa.dur);
    const e = u < .5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;   // entra y sale suave

    cometa.px = cometa.x; cometa.py = cometa.y;
    cometa.x = -W * .16 + e * (W * 1.32);
    cometa.y = cometa.y0 + Math.sin(e * Math.PI) * cometa.amp;

    /* va soltando las letras que quedan a su izquierda */
    if (cometa.pend) {
      const hasta = cometa.x + 8;
      while (cometa.i < cometa.pend.length && cometa.pend[cometa.i].x <= hasta) {
        entregar(cometa.pend[cometa.i++], cometa.x, cometa.y);
      }
    }

    /* cola */
    dctx.globalCompositeOperation = 'lighter';
    const tx = cometa.px - (cometa.x - cometa.px) * 15;
    const ty = cometa.py - (cometa.y - cometa.py) * 15;
    const g = dctx.createLinearGradient(cometa.x, cometa.y, tx, ty);
    g.addColorStop(0, 'rgba(255,246,232,.85)');
    g.addColorStop(1, 'rgba(255,217,160,0)');
    dctx.strokeStyle = g;
    dctx.lineWidth = 2.4;
    dctx.beginPath();
    dctx.moveTo(cometa.x, cometa.y);
    dctx.lineTo(tx, ty);
    dctx.stroke();

    /* cabeza */
    const fade = u > .88 ? (1 - u) / .12 : 1;
    const halo = dctx.createRadialGradient(cometa.x, cometa.y, 0, cometa.x, cometa.y, 46);
    halo.addColorStop(0, 'rgba(255,255,248,' + (.92 * fade) + ')');
    halo.addColorStop(.22, 'rgba(255,217,160,' + (.36 * fade) + ')');
    halo.addColorStop(1, 'rgba(255,179,198,0)');
    dctx.fillStyle = halo;
    dctx.beginPath();
    dctx.arc(cometa.x, cometa.y, 46, 0, 6.283);
    dctx.fill();

    if (u >= 1) {
      /* por si quedó alguna letra pendiente al final */
      if (cometa.pend) {
        while (cometa.i < cometa.pend.length) {
          const pt = cometa.pend[cometa.i++];
          entregar(pt, pt.x, pt.y);
        }
      }
      cometa.activo = false;
      cometa.pend = null;
    }
  }

  /* ---- chispas al tocar ---- */

  function chispear(x, y, cuantas) {
    let n = 0;
    const meta = cuantas || 60;
    for (let i = 0; i < polvo.length && n < meta; i++) {
      const p = polvo[(cursorLibre + i) % polvo.length];
      if (p.tx !== null) continue;
      const dir = Math.random() * 6.283, vel = 1 + Math.random() * 5;
      p.x = x; p.y = y;
      p.vx = Math.cos(dir) * vel;
      p.vy = Math.sin(dir) * vel;
      p.a = .95;
      n++;
    }
  }

  /* ---- dibujo del polvo ---- */

  function pintarPolvo(t, dt) {
    dctx.clearRect(0, 0, W, H);

    if (cometa.activo) moverCometa(dt);

    dctx.globalCompositeOperation = 'lighter';

    for (const p of polvo) {
      if (p.tx !== null) {
        p.vx += (p.tx - p.x) * p.k;
        p.vy += (p.ty - p.y) * p.k;
        p.vx *= p.d; p.vy *= p.d;
      } else {
        p.vx *= .982; p.vy *= .982;
        p.vy -= .0035;                      // el polvo suelto sube despacito
      }
      p.x += p.vx; p.y += p.vy;

      const meta = p.tx !== null ? 1 : .09;
      p.a += (meta - p.a) * .05;
      if (p.a < .004) continue;

      /* respiración cuando ya está en su lugar */
      const bx = p.tx !== null ? Math.sin(t * .0011 + p.jx) * .9 : 0;
      const by = p.tx !== null ? Math.cos(t * .0013 + p.jy) * .9 : 0;
      const x = p.x + bx, y = p.y + by, s = p.s;

      dctx.fillStyle = p.c;
      dctx.globalAlpha = p.a;
      dctx.fillRect(x - s / 2, y - s / 2, s, s);
      dctx.globalAlpha = p.a * .11;
      dctx.fillRect(x - s / 2 - 2.5, y - s / 2 - 2.5, s + 5, s + 5);
    }

    dctx.globalAlpha = 1;
    dctx.globalCompositeOperation = 'source-over';
  }

  /* ---------- 6. bucle ----------------------------------- */

  let ultimo = performance.now();
  function bucle(t) {
    const dt = Math.min(48, t - ultimo);
    ultimo = t;
    pintarCielo(t);
    pintarPolvo(t, dt);
    if (Math.random() < .0016) fugaz();
    requestAnimationFrame(bucle);
  }

  /* ---------- 7. dirección ------------------------------- */

  const gate = document.getElementById('gate');
  const hud = document.getElementById('hud');
  const dots = document.getElementById('dots');
  const hint = document.getElementById('hint');
  const letter = document.getElementById('letter');
  const track = document.getElementById('track');
  const muteBtn = document.getElementById('muteBtn');
  const skipBtn = document.getElementById('skipBtn');
  const againBtn = document.getElementById('againBtn');
  const wipeBtn = document.getElementById('wipeBtn');
  const guia = document.getElementById('guia');

  let escenaActual = -1;
  let avanzar = null;
  let corriendo = false;
  let puedeAvanzar = false;
  let terminada = false;

  ESCENAS.forEach(() => dots.appendChild(document.createElement('i')));
  const marcas = [...dots.children];

  function compas(ms) {
    return new Promise(res => {
      let hecho = false;
      const cerrar = () => {
        if (hecho) return;
        hecho = true;
        clearTimeout(reloj); clearTimeout(pista);
        hint.classList.remove('show');
        avanzar = null;
        res();
      };
      const reloj = setTimeout(cerrar, ms);
      const pista = setTimeout(() => hint.classList.add('show'), Math.min(ms * .6, 3000));
      avanzar = cerrar;
    });
  }

  async function dirigir(desde) {
    corriendo = true;
    for (let i = desde; i < ESCENAS.length; i++) {
      if (!corriendo) return;
      escenaActual = i;
      marcas.forEach((m, j) => {
        m.classList.toggle('on', j === i);
        m.classList.toggle('past', j < i);
      });
      const e = ESCENAS[i];
      escribir(puntosDeTexto(e.t, e), reduce);
      dejarEstrella();
      const esUltima = i === ESCENAS.length - 1;
      await compas(reduce ? 900 : (esUltima ? 4600 : e.hold));
      if (esUltima) break;
    }
    if (corriendo) abrirCarta();
  }

  function abrirCarta() {
    corriendo = false;
    terminada = true;
    puedeAvanzar = false;
    letter.hidden = false;
    document.body.classList.add('reading');
    requestAnimationFrame(() => letter.classList.add('show'));
    /* la frase se queda arriba en el cielo; la carta espera un scroll abajo */
    hint.classList.remove('show');
    guia.hidden = false;
    setTimeout(() => { if (terminada && window.scrollY < 40) guia.classList.add('show'); }, 1600);
    ping('Llego al final', 'Ya llego al final de la carta — ' + ahora(), 'heart');
  }

  /* al bajar a leer, el polvo se atenúa para no estorbar el texto */
  window.addEventListener('scroll', () => {
    if (!terminada) return;
    const u = Math.min(1, window.scrollY / (H * .75));
    dustCv.style.opacity = String(1 - u * .96);
    starCv.style.opacity = String(1 - u * .35);
    if (window.scrollY > 40) { hint.classList.remove('show'); guia.classList.remove('show'); }
    else if (terminada) guia.classList.add('show');
  }, { passive: true });

  function empezar() {
    gate.classList.add('off');
    document.body.classList.add('playing');
    hud.hidden = false;
    hint.hidden = false;
    setTimeout(() => { gate.style.display = 'none'; }, 1500);

    /* la música arranca con este toque (los navegadores lo exigen) */
    track.volume = 0;
    const p = track.play();
    if (p && p.catch) p.catch(() => { muteBtn.setAttribute('aria-pressed', 'false'); });
    subirVolumen(.62, 3200);

    setTimeout(() => { puedeAvanzar = true; }, 800);
    dirigir(0);
  }

  function subirVolumen(hasta, ms) {
    const t0 = performance.now(), v0 = track.volume;
    (function sube(t) {
      const u = Math.min(1, (t - t0) / ms);
      try { track.volume = v0 + (hasta - v0) * u; } catch (_) {}
      if (u < 1) requestAnimationFrame(sube);
    })(performance.now());
  }

  /* ---------- 8. interacción ----------------------------- */

  document.getElementById('startBtn').addEventListener('click', empezar);

  muteBtn.addEventListener('click', () => {
    const suena = muteBtn.getAttribute('aria-pressed') === 'true';
    if (suena) { track.pause(); muteBtn.setAttribute('aria-pressed', 'false'); }
    else { track.play().catch(() => {}); muteBtn.setAttribute('aria-pressed', 'true'); }
  });

  skipBtn.addEventListener('click', () => {
    corriendo = false;
    if (avanzar) avanzar();
    const f = ESCENAS[ESCENAS.length - 1];
    escenaActual = ESCENAS.length - 1;
    escribir(puntosDeTexto(f.t, f), true);
    abrirCarta();
  });

  wipeBtn.addEventListener('click', () => {
    borrarEstrellas();
    wipeBtn.textContent = 'listo, cielo limpio';
    setTimeout(() => { wipeBtn.textContent = 'borrar mis estrellas'; }, 2600);
  });

  againBtn.addEventListener('click', () => {
    guia.classList.remove('show');
    letter.classList.remove('show');
    document.body.classList.remove('reading');
    window.scrollTo(0, 0);
    dustCv.style.opacity = '1';
    starCv.style.opacity = '1';
    setTimeout(() => {
      letter.hidden = true;
      fijas = [];
      terminada = false;
      puedeAvanzar = true;
      soltarTodo(6);
      dirigir(0);
    }, 900);
  });

  /* tocar: durante la película pasa de frase; al final, pone estrellas */
  let arrastrando = false, ultimoTrazo = 0;

  function enElCielo(ev) {
    const t = ev.target;
    if (!t || typeof t.closest !== 'function') return true;
    return !t.closest('.sheet, button, a');
  }

  document.addEventListener('pointerdown', ev => {
    if (!enElCielo(ev)) return;
    const x = ev.clientX, y = ev.clientY;
    if (terminada) {
      arrastrando = true;
      ponerEstrella(x, y, true);
    } else {
      chispear(x, y);
      if (puedeAvanzar && avanzar) avanzar();
    }
  });

  document.addEventListener('pointerup', () => { arrastrando = false; });
  document.addEventListener('pointercancel', () => { arrastrando = false; });

  document.addEventListener('keydown', ev => {
    if (['Space', 'Enter', 'ArrowRight'].includes(ev.code)) {
      if (!gate.classList.contains('off')) { empezar(); ev.preventDefault(); return; }
      if (puedeAvanzar && !terminada && avanzar) { avanzar(); ev.preventDefault(); }
    }
  });

  window.addEventListener('pointermove', ev => {
    mouse.x = (ev.clientX / W) * 2 - 1;
    mouse.y = (ev.clientY / H) * 2 - 1;
    mouse.px = ev.clientX;
    mouse.py = ev.clientY;
    /* arrastrar el dedo deja un polvito de estrellas */
    if (arrastrando && terminada) {
      const t = performance.now();
      if (t - ultimoTrazo > 85) { ultimoTrazo = t; ponerEstrella(ev.clientX, ev.clientY, false); }
    }
  });

  window.addEventListener('pointerleave', () => { mouse.px = -999; mouse.py = -999; });

  /* ---------- 9. arranque -------------------------------- */

  function reajustar() {
    const antes = W;
    medir();
    sembrar();
    if (antes && escenaActual >= 0) {
      const e = ESCENAS[escenaActual];
      escribir(puntosDeTexto(e.t, e), true);
    }
  }

  medir();
  sembrar();
  nacerPolvo();
  cargarSuyas();

  let tmr;
  window.addEventListener('resize', () => { clearTimeout(tmr); tmr = setTimeout(reajustar, 220); });

  /* esperamos las fuentes para que el muestreo salga con la tipografía buena */
  const listo = () => requestAnimationFrame(bucle);
  if (document.fonts && document.fonts.load) {
    Promise.all([
      document.fonts.load('300 60px "Cormorant Garamond"'),
      document.fonts.load('italic 300 60px "Cormorant Garamond"'),
      document.fonts.load('400 60px "Parisienne"')
    ]).then(listo, listo);
  } else listo();
})();
