let bgOn = 1, bgM = 0, bgT = 0, bgV = 0, bgC = 0, bgS = 0, bgKey = "";
const bgCv = document.createElement("canvas");
function mulberry32(a) {
return function () {
a |= 0, a = a + 0x6D2B79F5 | 0;
let t = Math.imul(a ^ a >>> 15, 1 | a);
return t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t, ((t ^ t >>> 14) >>> 0) / 4294967296
}
}
const T1 = [
  { n: "soil",    p: "dots",    s: 9,  c: ["#0a0809", "#171009", "#241706", "#2f2010"] },
  { n: "ash",     p: "specks",  s: 7,  c: ["#0c0c0e", "#18181c", "#232329", "#2e2e36"] },
  { n: "stone",   p: "cracks",  s: 12, c: ["#101012", "#1b1b1e", "#26262b", "#313138"] },
  { n: "scale",   p: "scales",  s: 7.5, c: ["#0a0d10", "#122029", "#193040", "#204057"] },
  { n: "cloth",   p: "weave",   s: 10, c: ["#0f0a0d", "#1c1218", "#281a22", "#34222d"] },
  { n: "tile",    p: "checker", s: 20, c: ["#080a08", "#121710", "#1b2418", "#243020"] },
  { n: "burlap",  p: "burlap",  s: 11, c: ["#0e0b07", "#241a10", "#33261a", "#4a3826"] },
  { n: "denim",   p: "twill",   s: 9,  c: ["#080b12", "#12203a", "#1a2e52", "#24406e"] },
  { n: "tweed",   p: "herring", s: 8,  c: ["#0c0c0e", "#1a1a1f", "#26262e", "#34343e"] },
  { n: "wood",    p: "wood",    s: 14, c: ["#0d0805", "#241408", "#3a2410", "#573818"] }
];
function drawM1(g, w, h, t, R, vRaw) {
  const v = vRaw * 2;
  const c = t.c, S = t.s * (1 + v * .45), pick = () => c[1 + ((R() * 3) | 0)],
    ox = R() * S, oy = R() * S;
  g.fillStyle = c[0]; g.fillRect(0, 0, w, h);
  g.lineCap = "round";
  switch (t.p) {
    case "dots":
      for (let i = -S + ox; i < w; i += S) for (let j = -S + oy; j < h; j += S) {
        g.fillStyle = pick(); g.fillRect(i + R() * 3, j + R() * 3, 2, 2)
      } break;
    case "specks":
      for (let i = 0, n = (w * h) / (S * S) * 6; i < n; i++) {
        g.fillStyle = pick(); g.globalAlpha = .3 + R() * .7;
        g.beginPath(); g.arc(R() * w, R() * h, .5 + R() * 1.8, 0, 7); g.fill()
      }
      g.globalAlpha = 1; break;
    case "cracks":
      g.lineWidth = 1;
      for (let k = 0, n = 30 + v * 25; k < n; k++) {
        let x = R() * w, y = R() * h, a = R() * 7;
        g.strokeStyle = pick(); g.beginPath(); g.moveTo(x, y);
        for (let s = 0; s < 6; s++) { a += (R() - .5) * 1.2; x += cos(a) * S; y += sin(a) * S; g.lineTo(x, y) }
        g.stroke()
      } break;
    case "scales":
      g.lineWidth = 1.2;
      for (let j = -S + oy, row = 0; j < h + S; j += S * .6, row++)
        for (let i = -S + ox + (row % 2) * S / 2; i < w + S; i += S) {
          g.strokeStyle = pick(); g.beginPath(); g.arc(i, j, S * .5, PI * .1, PI * .9); g.stroke()
        } break;
    case "weave":
      g.lineWidth = 1.5;
      for (let j = -S + oy; j < h; j += S) for (let i = -S + ox; i < w; i += S) {
        g.strokeStyle = pick(); g.beginPath();
        (round(i / S) + round(j / S)) % 2 ? (g.moveTo(i, j + S / 2), g.lineTo(i + S * .8, j + S / 2))
          : (g.moveTo(i + S / 2, j), g.lineTo(i + S / 2, j + S * .8));
        g.stroke()
      } break;
    case "checker":
      for (let j = -S + oy, r2 = 0; j < h; j += S, r2++)
        for (let i = -S + ox, c2 = 0; i < w; i += S, c2++) {
          if ((r2 + c2) % 2) continue;
          g.fillStyle = pick(); g.globalAlpha = .5 + R() * .5;
          g.fillRect(i + R() * 2, j + R() * 2, S - 2, S - 2)
        }
      g.globalAlpha = 1; break;
    case "burlap": {
      const tw = S * .58;
      for (let i = -S + ox; i < w; i += S) { g.globalAlpha = .45 + R() * .45; g.fillStyle = pick(); g.fillRect(i, 0, tw * (.8 + R() * .4), h) }
      for (let j = -S + oy; j < h; j += S) { g.globalAlpha = .45 + R() * .45; g.fillStyle = pick(); g.fillRect(0, j, w, tw * (.8 + R() * .4)) }
      for (let j = -S + oy, r2 = 0; j < h; j += S, r2++)
        for (let i = -S + ox, c2 = 0; i < w; i += S, c2++) {
          if ((r2 + c2) % 2) continue;
          g.globalAlpha = .5 + R() * .4; g.fillStyle = pick(); g.fillRect(i, j, tw, tw)
        }
      g.globalAlpha = 1; break
    }
    case "twill": {
      g.lineWidth = S * .38;
      for (let d = -h + ox; d < w + h; d += S) {
        g.strokeStyle = pick(); g.globalAlpha = .35 + R() * .5;
        g.beginPath(); g.moveTo(d, 0); g.lineTo(d + h, h); g.stroke()
      }
      g.lineWidth = 1;
      for (let k = 0, n = (w * h) / (S * S); k < n; k++) {
        g.strokeStyle = pick(); g.globalAlpha = .2 + R() * .4;
        const x = R() * w, y = R() * h;
        g.beginPath(); g.moveTo(x, y); g.lineTo(x + S * .5, y + S * .5); g.stroke()
      }
      g.globalAlpha = 1; break
    }
    case "herring": {
      const bw = S * 3.2;
      for (let j = -bw + oy, row = 0; j < h + bw; j += bw, row++) {
        const dn = row % 2 ? 1 : -1;
        g.save(); g.beginPath(); g.rect(0, j, w, bw); g.clip();
        g.lineWidth = S * .3;
        for (let d = -bw; d < w + bw * 2; d += S * .62) {
          g.strokeStyle = pick(); g.globalAlpha = .35 + R() * .5;
          g.beginPath(); g.moveTo(d, j); g.lineTo(d + dn * bw, j + bw); g.stroke()
        }
        g.restore()
      }
      g.globalAlpha = 1; break
    }
    case "wood": {
      const amp = 3 + R() * 9, fr = .004 + R() * .009, ph = R() * 7;
      for (let j = -S + oy; j < h + S; j += S * (.16 + R() * .34)) {
        g.strokeStyle = pick(); g.globalAlpha = .3 + R() * .55;
        g.lineWidth = .5 + R() * 1.9;
        g.beginPath();
        for (let x = 0; x <= w; x += 6) {
          const y = j + sin(x * fr + ph + j * .02) * amp;
          x ? g.lineTo(x, y) : g.moveTo(x, y)
        }
        g.stroke()
      }
      g.globalAlpha = 1; break
    }
  }
}
const T2 = [
  { n: "frost",  m: "banded", f: 4.2, o: 3, c: ["#05080e", "#0d1520", "#182636", "#26384e"] },
  { n: "rust",   m: "thresh", f: 5.0, o: 4, c: ["#120a06", "#2b1408", "#42200c", "#5c3013"] },
  { n: "fungal", m: "thresh", f: 6.5, o: 3, c: ["#0d0710", "#1c0f22", "#2d1838", "#40234e"] },
  { n: "sand",   m: "banded", f: 3.0, o: 4, c: ["#110e07", "#221a0d", "#332715", "#45351e"] },
  { n: "steel",  m: "banded", f: 5.5, o: 3, c: ["#0a0a0c", "#151518", "#212127", "#2f2f37"] }
];
function makeNoise(seed) {
  const p = new Uint8Array(512), rnd = mulberry32(seed);
  for (let i = 0; i < 256; i++) p[i] = i;
  for (let i = 255; i > 0; i--) { const j = (rnd() * (i + 1)) | 0, t = p[i]; p[i] = p[j], p[j] = t }
  for (let i = 0; i < 256; i++) p[i + 256] = p[i];
  const hash = (x, y) => p[(p[x & 255] + (y & 255)) & 255] / 255, sm = t => t * t * (3 - 2 * t);
  return (x, y) => {
    const xi = floor(x), yi = floor(y), u = sm(x - xi), v = sm(y - yi),
      a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1);
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v
  }
}
const hex2rgb = s => [parseInt(s.slice(1, 3), 16), parseInt(s.slice(3, 5), 16), parseInt(s.slice(5, 7), 16)];
function ramp(cols, t) {
  t = max(0, min(.9999, t));
  const k = t * (cols.length - 1), i = k | 0, f = k - i, a = cols[i], b = cols[i + 1];
  return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f]
}
function drawM2(g, w, h, t, R, vRaw) {
  const v = vRaw * 2;
  const RES = 4, iw = max(2, Math.ceil(w / RES)), ih = max(2, Math.ceil(h / RES)),
    tmp = document.createElement("canvas");
  tmp.width = iw; tmp.height = ih;
  const tg = tmp.getContext("2d"), img = tg.createImageData(iw, ih), d = img.data,
    n = makeNoise(1 + R() * 1e6 | 0), cols = t.c.map(hex2rgb),
    freq = t.f * (1 + v * .6), bands = 3 + v * 2, cut = .42 + v * .06,
    sx = R() * 40, sy = R() * 40;
  for (let j = 0; j < ih; j++) for (let i = 0; i < iw; i++) {
    let s = 0, amp = 1, fr = 1, tot = 0;
    for (let k = 0; k < t.o; k++) {
      s += amp * n(sx + i / iw * freq * fr, sy + j / ih * freq * fr);
      tot += amp; amp *= .5; fr *= 2
    }
    let val = s / tot;
    t.m === "banded" ? val = (val * bands) % 1 : val = val > cut ? .85 : .12;
    const rgb = ramp(cols, val), k2 = (j * iw + i) * 4;
    d[k2] = rgb[0], d[k2 + 1] = rgb[1], d[k2 + 2] = rgb[2], d[k2 + 3] = 255
  }
  tg.putImageData(img, 0, 0);
  g.imageSmoothingEnabled = true; g.drawImage(tmp, 0, 0, w, h)
}
const T3 = [
  { n: "spore", b: "#070a08", L: [{ k: "circle", n: 260, sz: [1, 5], a: [.15, .5], c: ["#14301c", "#1d4526", "#2a5c33"] }] },
  { n: "straw", b: "#100d07", L: [{ k: "line", n: 220, sz: [3, 12], lw: 1, a: [.2, .55], c: ["#33280f", "#463618", "#5b4820"] }] },
  { n: "plank", b: "#0d0906", L: [{ k: "rect", n: 110, sz: [6, 22], a: [.15, .45], c: ["#2a1c0e", "#3a2814", "#4b351b"] }] }
];
function drawM3(g, w, h, t, R, v) {
  g.fillStyle = t.b; g.fillRect(0, 0, w, h);
  g.lineCap = "round";
  const dens = [.6, 1.7][v];
  t.L.forEach(o => {
    for (let i = 0, n = round(o.n * dens); i < n; i++) {
      const x = R() * w, y = R() * h, s = o.sz[0] + R() * (o.sz[1] - o.sz[0]);
      g.fillStyle = g.strokeStyle = o.c[(R() * o.c.length) | 0];
      g.globalAlpha = o.a[0] + R() * (o.a[1] - o.a[0]);
      g.lineWidth = o.lw || 1; g.beginPath();
      if (o.k === "circle") g.arc(x, y, s, 0, 7), g.fill();
      else if (o.k === "line") {
        const a = R() * 7;
        g.moveTo(x, y), g.lineTo(x + cos(a) * s * 3, y + sin(a) * s * 3), g.stroke()
      } else {
        g.save(), g.translate(x, y), g.rotate(R() * 7);
        g.fillRect(-s, -s * .35, s * 2, s * .7), g.restore()
      }
    }
  });
  g.globalAlpha = 1
}
const BG_METHODS = [{ t: T1, draw: drawM1 }, { t: T2, draw: drawM2 }, { t: T3, draw: drawM3 }];
const BG_COLOR = [
  { n: "orig",   op: null },
  { n: "ice",    c: "#4a6a8a", op: "color", a: .5 },
  { n: "amber",  c: "#8a6438", op: "color", a: .5 },
  { n: "acid",   c: "#4a6a3a", op: "color", a: .45 },
  { n: "rose",   c: "#7a4658", op: "color", a: .5 },
  { n: "mono",   c: "#808080", op: "saturation", a: 1 },
  { n: "sepia",  c: "#786040", op: "color", a: .55 },
  { n: "deep",   c: "#1030a0", op: "color", a: .7 },
  { n: "violet", c: "#584a72", op: "color", a: .5 },
  { n: "coral",  c: "#8a5648", op: "color", a: .5 },
  { n: "mint",   c: "#3a6a5c", op: "color", a: .45 },
  { n: "mauve",  c: "#664a56", op: "color", a: .5 },
  { n: "gold",   c: "#786a3a", op: "color", a: .5 },
  { n: "teal",   c: "#2e5a5e", op: "color", a: .5 },
  { n: "crimson",c: "#6a3438", op: "color", a: .5 },
  { n: "lime",   c: "#5a6a3a", op: "color", a: .4 }
];
function bgPick() {
bgM = ri(3), bgT = ri(BG_METHODS[bgM].t.length), bgV = ri(2), bgC = ri(BG_COLOR.length), bgS = ri(1e9), bgKey = ""
}
function drawBg() {
const key = [bgM, bgT, bgV, bgC, bgS, boxLW, boxLH].join(",");
if (key !== bgKey) {
bgKey = key;
const dpr = window.devicePixelRatio || 1, m = BG_METHODS[bgM];
bgCv.width = max(1, round(boxLW * dpr)), bgCv.height = max(1, round(boxLH * dpr));
const g = bgCv.getContext("2d");
g.setTransform(dpr, 0, 0, dpr, 0, 0);
m.draw(g, boxLW, boxLH, m.t[bgT], mulberry32(bgM * 15485863 + bgT * 7919 + bgV * 104729 + bgS), bgV);
g.setTransform(dpr, 0, 0, dpr, 0, 0);
const col = BG_COLOR[bgC];
col.op && (g.globalCompositeOperation = col.op, g.globalAlpha = col.a, g.fillStyle = col.c, g.fillRect(0, 0, boxLW, boxLH), g.globalCompositeOperation = "source-over");
g.globalAlpha = 1, g.strokeStyle = "rgba(0,0,0,.45)", g.lineWidth = 2, g.strokeRect(1, 1, boxLW - 2, boxLH - 2)
}
boxCx.drawImage(bgCv, 0, 0, boxLW, boxLH)
}
bgPick();