import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

/* ══════════════════════════════════════════════════════════
   PARTÍCULAS 2D FONDO
══════════════════════════════════════════════════════════ */
const bgCanvas = document.getElementById("bg-particles");
const bgCtx = bgCanvas.getContext("2d");
let BW, BH;
function resizeBg() {
  BW = bgCanvas.width = window.innerWidth;
  BH = bgCanvas.height = window.innerHeight;
}
resizeBg();
window.addEventListener("resize", resizeBg);

const SPARKS = Array.from({ length: 80 }, () => mkSpark());
function mkSpark() {
  return {
    x: Math.random() * (BW || 800),
    y: Math.random() * (BH || 600),
    r: Math.random() * 1.4 + 0.3,
    vx: (Math.random() - 0.5) * 0.18,
    vy: -(Math.random() * 0.35 + 0.08),
    age: 0,
    life: Math.random() * 180 + 80,
    hue: Math.random() < 0.55 ? 42 : 345,
  };
}
(function tickSparks() {
  requestAnimationFrame(tickSparks);
  bgCtx.clearRect(0, 0, BW, BH);
  SPARKS.forEach((s, i) => {
    s.x += s.vx;
    s.y += s.vy;
    s.age++;
    const a = Math.sin((s.age / s.life) * Math.PI) * 0.45;
    bgCtx.beginPath();
    bgCtx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    bgCtx.fillStyle = `hsla(${s.hue},65%,75%,${a})`;
    bgCtx.fill();
    if (s.age > s.life) SPARKS[i] = mkSpark();
  });
})();

/* ══════════════════════════════════════════════════════════
   ESCENA
══════════════════════════════════════════════════════════ */
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0e0405);
scene.fog = new THREE.FogExp2(0x0e0405, 0.038);

const camera = new THREE.PerspectiveCamera(
  52,
  window.innerWidth / window.innerHeight,
  0.1,
  200,
);
camera.position.set(0, 5.5, 10);
camera.lookAt(0, 0.5, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
document.getElementById("container3d").appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.enablePan = false;
controls.minDistance = 3;
controls.maxDistance = 18;
controls.maxPolarAngle = Math.PI / 2.05;
controls.target.set(0, 0.5, 0);

/* ══════════════════════════════════════════════════════════
   ILUMINACIÓN
══════════════════════════════════════════════════════════ */
scene.add(new THREE.AmbientLight(0x3b1a0a, 1.0));

const candleA = new THREE.PointLight(0xff9944, 4.5, 13);
candleA.position.set(-2.8, 1.6, -1);
candleA.castShadow = true;
candleA.shadow.mapSize.set(1024, 1024);
candleA.shadow.radius = 10;
scene.add(candleA);

const candleB = new THREE.PointLight(0xff9944, 4.0, 12);
candleB.position.set(2.8, 1.6, -1);
scene.add(candleB);

const fillL = new THREE.PointLight(0xff6680, 0.7, 18);
fillL.position.set(-5, 4, -3);
scene.add(fillL);

const rimL = new THREE.DirectionalLight(0x334488, 0.35);
rimL.position.set(-4, 7, -10);
scene.add(rimL);

// Luz carta — muy fuerte y cercana para iluminar bien el texto
const letterLight = new THREE.PointLight(0xfff8e8, 0, 6);
letterLight.position.set(0, 3.5, 5.5);
scene.add(letterLight);

// Luces rosa
const roseLight = new THREE.PointLight(0xffd0b0, 3.5, 6);
roseLight.position.set(-3.6, 2.5, 1.2);
scene.add(roseLight);
const roseFill = new THREE.PointLight(0xff9999, 2.0, 5);
roseFill.position.set(-4.8, 1.8, -0.5);
scene.add(roseFill);

/* ══════════════════════════════════════════════════════════
   MESA / MANTEL
══════════════════════════════════════════════════════════ */
const table = new THREE.Mesh(
  new THREE.BoxGeometry(22, 0.34, 16),
  new THREE.MeshStandardMaterial({
    color: 0x1a0c06,
    roughness: 0.5,
    metalness: 0.06,
  }),
);
table.position.y = -0.17;
table.receiveShadow = true;
scene.add(table);

const tableEdge = new THREE.Mesh(
  new THREE.BoxGeometry(22.1, 0.04, 16.1),
  new THREE.MeshStandardMaterial({
    color: 0x3a2010,
    roughness: 0.25,
    metalness: 0.35,
  }),
);
tableEdge.position.y = 0.015;
scene.add(tableEdge);

const cloth = new THREE.Mesh(
  new THREE.BoxGeometry(13, 0.022, 9.5),
  new THREE.MeshStandardMaterial({ color: 0x18060a, roughness: 0.96 }),
);
cloth.position.y = 0.02;
cloth.receiveShadow = true;
scene.add(cloth);

/* Velas */
[
  [-2.8, -1],
  [2.8, -1],
].forEach(([x, z]) => {
  const g = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(0.115, 0.135, 1.1, 16),
    new THREE.MeshStandardMaterial({ color: 0xfff4dc, roughness: 0.8 }),
  );
  body.castShadow = true;
  const wick = new THREE.Mesh(
    new THREE.CylinderGeometry(0.009, 0.009, 0.22, 6),
    new THREE.MeshStandardMaterial({ color: 0x1a1a1a }),
  );
  wick.position.y = 0.66;
  const fGeo = new THREE.SphereGeometry(0.065, 8, 8);
  fGeo.scale(1, 1.9, 1);
  const flame = new THREE.Mesh(
    fGeo,
    new THREE.MeshBasicMaterial({ color: 0xffcc33 }),
  );
  flame.position.y = 0.79;
  const gGeo = new THREE.SphereGeometry(0.18, 8, 8);
  const glow = new THREE.Mesh(
    gGeo,
    new THREE.MeshBasicMaterial({
      color: 0xffaa22,
      transparent: true,
      opacity: 0.15,
    }),
  );
  glow.position.y = 0.79;
  const holder = new THREE.Mesh(
    new THREE.CylinderGeometry(0.19, 0.16, 0.14, 20),
    new THREE.MeshStandardMaterial({
      color: 0xb8960c,
      roughness: 0.18,
      metalness: 0.85,
    }),
  );
  holder.position.y = -0.62;
  holder.castShadow = true;
  g.add(body, wick, flame, glow, holder);
  g.position.set(x, 0.63, z);
  scene.add(g);
});

/* Pétalos en la mesa */
for (let i = 0; i < 18; i++) {
  const a = Math.random() * Math.PI * 2,
    d = Math.random() * 4 + 0.5;
  const sh = new THREE.Shape();
  sh.ellipse(0, 0, 0.26, 0.13, 0, Math.PI * 2);
  const m = new THREE.Mesh(
    new THREE.ShapeGeometry(sh, 18),
    new THREE.MeshStandardMaterial({
      color: 0x8b1a30,
      side: THREE.DoubleSide,
      roughness: 0.9,
    }),
  );
  m.rotation.x = -Math.PI / 2;
  m.rotation.z = Math.random() * Math.PI;
  m.position.set(Math.cos(a) * d, 0.03, Math.sin(a) * d);
  scene.add(m);
}

/* Copas */
function makeGlass(x, z) {
  const mat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.14,
    roughness: 0,
    metalness: 0,
    transmission: 0.96,
    thickness: 0.5,
  });
  const g = new THREE.Group();
  const pts = [];
  for (let i = 0; i <= 12; i++) {
    const t = i / 12;
    pts.push(new THREE.Vector2(0.28 + t * 0.5, t * 0.95));
  }
  g.add(new THREE.Mesh(new THREE.LatheGeometry(pts, 24), mat));
  const stem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.04, 0.04, 1.1, 8),
    mat,
  );
  stem.position.y = -1.05;
  g.add(stem);
  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(0.46, 0.4, 0.07, 24),
    mat,
  );
  base.position.y = -1.62;
  g.add(base);
  g.position.set(x, 1.67, z);
  g.scale.setScalar(0.62);
  scene.add(g);
  const wine = new THREE.Mesh(
    new THREE.CylinderGeometry(0.27, 0.18, 0.28, 18),
    new THREE.MeshStandardMaterial({
      color: 0x5a0e1a,
      roughness: 0.3,
      transparent: true,
      opacity: 0.88,
    }),
  );
  wine.position.set(x, 1.15, z);
  scene.add(wine);
}
makeGlass(-1.6, 1.6);
makeGlass(1.6, 1.6);

/* Bandeja */
const tray = new THREE.Mesh(
  new THREE.BoxGeometry(5.6, 0.07, 4.1),
  new THREE.MeshStandardMaterial({
    color: 0x7a6040,
    roughness: 0.55,
    metalness: 0.15,
  }),
);
tray.position.set(0, 0.045, 0);
tray.receiveShadow = true;
scene.add(tray);

/* ══════════════════════════════════════════════════════════
   SOBRE  (forma real: base + 3 triángulos cara + solapa)
══════════════════════════════════════════════════════════ */
const ENV_W = 4.1,
  ENV_H = 3.0,
  ENV_T = 0.08;
const HW = ENV_W / 2,
  HH = ENV_H / 2;

const envelopeGroup = new THREE.Group();
envelopeGroup.position.set(0, ENV_T / 2 + 0.045, 0);
scene.add(envelopeGroup);

const creamM = (extra = {}) =>
  new THREE.MeshStandardMaterial({
    color: 0xf0e4c2,
    roughness: 0.82,
    ...extra,
  });

// Base
const envBase = new THREE.Mesh(
  new THREE.BoxGeometry(ENV_W, ENV_T, ENV_H),
  creamM(),
);
envBase.castShadow = true;
envBase.receiveShadow = true;
envBase.name = "sobre";
envelopeGroup.add(envBase);

// Triángulos de la cara interior
function triPlane(ax, ay, bx, by, cx, cy, mat) {
  const sh = new THREE.Shape();
  sh.moveTo(ax, ay);
  sh.lineTo(bx, by);
  sh.lineTo(cx, cy);
  sh.closePath();
  const m = new THREE.Mesh(new THREE.ShapeGeometry(sh), mat);
  m.rotation.x = -Math.PI / 2;
  m.position.y = ENV_T / 2 + 0.001;
  m.name = "sobre";
  return m;
}
envelopeGroup.add(
  triPlane(
    -HW,
    HH * 0.05,
    HW,
    HH * 0.05,
    0,
    HH,
    creamM({ side: THREE.DoubleSide, color: 0xe8d8b5 }),
  ),
);
envelopeGroup.add(
  triPlane(
    -HW,
    -HH,
    -HW,
    HH,
    0,
    0,
    creamM({ side: THREE.DoubleSide, color: 0xddd0a8 }),
  ),
);
envelopeGroup.add(
  triPlane(
    HW,
    -HH,
    HW,
    HH,
    0,
    0,
    creamM({ side: THREE.DoubleSide, color: 0xddd0a8 }),
  ),
);

// Solapa (pivota en borde trasero z=-HH)
const flapPivot = new THREE.Group();
flapPivot.position.set(0, ENV_T / 2 + 0.003, -HH);
envelopeGroup.add(flapPivot);
const flapSh = new THREE.Shape();
flapSh.moveTo(-HW, 0);
flapSh.lineTo(HW, 0);
flapSh.lineTo(0, HH * 0.96);
flapSh.closePath();
const flapMesh = new THREE.Mesh(
  new THREE.ShapeGeometry(flapSh),
  creamM({ side: THREE.DoubleSide, color: 0xe0d0a0 }),
);
flapMesh.rotation.x = -Math.PI / 2;
flapPivot.add(flapMesh);

// Lacre
const lacre = new THREE.Group();
lacre.position.set(0, ENV_T / 2 + 0.03, -HH * 0.35);
lacre.add(
  new THREE.Mesh(
    new THREE.CylinderGeometry(0.22, 0.22, 0.07, 22),
    new THREE.MeshStandardMaterial({
      color: 0x8b1a30,
      roughness: 0.3,
      metalness: 0.22,
    }),
  ),
);
const sealRingM = new THREE.Mesh(
  new THREE.TorusGeometry(0.22, 0.03, 8, 22),
  new THREE.MeshStandardMaterial({
    color: 0xb8960c,
    roughness: 0.2,
    metalness: 0.85,
  }),
);
sealRingM.rotation.x = Math.PI / 2;
sealRingM.position.y = 0.01;
lacre.add(sealRingM);
envelopeGroup.add(lacre);

// Cintas
const ribbonMat = new THREE.MeshStandardMaterial({
  color: 0xb83b5e,
  roughness: 0.5,
  metalness: 0.2,
});
const ribbonH = new THREE.Mesh(
  new THREE.BoxGeometry(ENV_W + 0.2, 0.05, 0.14),
  ribbonMat,
);
ribbonH.position.set(0, ENV_T / 2 + 0.03, 0);
envelopeGroup.add(ribbonH);
const ribbonV = new THREE.Mesh(
  new THREE.BoxGeometry(0.14, 0.05, ENV_H + 0.1),
  ribbonMat,
);
ribbonV.position.set(0, ENV_T / 2 + 0.03, 0);
envelopeGroup.add(ribbonV);

/* ══════════════════════════════════════════════════════════
   CARTA 3D — textura canvas 4096px, fuentes grandes
   La clave: el canvas es muy grande (4096×3000) y los fonts
   son de 80–140px, así el texel es denso y se ve nítido
   incluso al acercarse la cámara.
══════════════════════════════════════════════════════════ */
const CARD_W = 3.6; // unidades Three.js
const CARD_H = 2.65; // ratio A4 landscape aprox

function buildLetterTexture() {
  const CW = 2048;
  const CH = Math.round(CW * (CARD_H / CARD_W));

  const cv = document.createElement("canvas");
  cv.width = CW;
  cv.height = CH;
  const ctx = cv.getContext("2d");

  // ── Fondo pergamino ──
  const bg = ctx.createLinearGradient(0, 0, CW, CH);
  bg.addColorStop(0, "#fdf9f0");
  bg.addColorStop(0.5, "#f8f0dc");
  bg.addColorStop(1, "#ecddb8");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, CW, CH);

  // ── Bordes dorados ──
  ctx.strokeStyle = "rgba(201,168,76,0.6)";
  ctx.lineWidth = 6;
  ctx.strokeRect(20, 20, CW - 40, CH - 40);
  ctx.strokeStyle = "rgba(201,168,76,0.25)";
  ctx.lineWidth = 2;
  ctx.strokeRect(32, 32, CW - 64, CH - 64);

  // Esquinas ornamentales
  ctx.font = "bold 44px serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "rgba(201,168,76,0.7)";
  [
    [42, 42],
    [CW - 42, 42],
    [42, CH - 42],
    [CW - 42, CH - 42],
  ].forEach(([x, y]) => ctx.fillText("✦", x, y));

  // Línea divisora superior
  const div = ctx.createLinearGradient(CW * 0.15, 0, CW * 0.85, 0);
  div.addColorStop(0, "transparent");
  div.addColorStop(0.5, "rgba(201,168,76,0.55)");
  div.addColorStop(1, "transparent");
  ctx.strokeStyle = div;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(CW * 0.15, 80);
  ctx.lineTo(CW * 0.85, 80);
  ctx.stroke();

  // ── Fecha ──
  ctx.fillStyle = "#8b6030";
  ctx.font = "italic 36px Georgia,serif";
  ctx.textAlign = "right";
  ctx.textBaseline = "alphabetic";
  ctx.fillText("21 de Marzo, 2026", CW - 50, 120);

  // ── Saludo ──
  ctx.fillStyle = "#b83b5e";
  ctx.font = "italic bold 62px Georgia,serif";
  ctx.textAlign = "center";
  ctx.fillText("Mi amor,", CW / 2, 195);

  // Línea bajo saludo
  ctx.strokeStyle = "rgba(184,59,94,0.2)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(CW * 0.3, 215);
  ctx.lineTo(CW * 0.7, 215);
  ctx.stroke();

  // ── Cuerpo ──
  ctx.fillStyle = "#2c1810";
  ctx.font = "38px Georgia,serif";
  ctx.textAlign = "left";
  const lines = [
    "Quería escribirle estas líneas para recordarle",
    "lo especial que es para mí.",
    "",
    "Cada momento a su lado es un regalo que",
    "atesoro en lo más profundo de mi corazón.",
    "Su sonrisa ilumina mis días, su voz es mi",
    "melodía favorita, y su amor...",
    "su amor es el hogar que siempre quise encontrar.",
    "",
    "Espero que esta sorpresa le haga sonreír",
    "tanto como usted me hace sonreír a mí.",
  ];
  let y = 265;
  lines.forEach((l) => {
    ctx.fillText(l, 52, y);
    y += l === "" ? 18 : 50;
  });

  // ── Poema ──
  y += 10;
  ctx.fillStyle = "rgba(184,59,94,0.07)";
  ctx.fillRect(60, y - 22, CW - 120, 132);
  ctx.strokeStyle = "rgba(184,59,94,0.3)";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(60, y - 22, CW - 120, 132);

  ctx.fillStyle = "#7b1a2e";
  ctx.font = "italic 34px Georgia,serif";
  ctx.textAlign = "center";
  [
    '"En el jardín de mi vida, eres la rosa más hermosa,',
    'la que florece eternamente en el suelo de mi alma."',
  ].forEach((l) => {
    ctx.fillText(l, CW / 2, y + 28);
    y += 46;
  });

  // ── Firma ──
  ctx.fillStyle = "#b83b5e";
  ctx.font = "italic bold 58px Georgia,serif";
  ctx.textAlign = "right";
  ctx.fillText("Su fiel perro  ❤️", CW - 50, CH - 48);

  // Línea final
  const divB = ctx.createLinearGradient(CW * 0.15, 0, CW * 0.85, 0);
  divB.addColorStop(0, "transparent");
  divB.addColorStop(0.5, "rgba(201,168,76,0.45)");
  divB.addColorStop(1, "transparent");
  ctx.strokeStyle = divB;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(CW * 0.15, CH - 100);
  ctx.lineTo(CW * 0.85, CH - 100);
  ctx.stroke();

  const tex = new THREE.CanvasTexture(cv);
  tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
  return tex;
}

// La carta empieza hija del sobre para heredar posición
const letterGroup = new THREE.Group();
envelopeGroup.add(letterGroup);

const letterTex = buildLetterTexture();
const frontMat = new THREE.MeshStandardMaterial({
  map: letterTex,
  roughness: 0.65,
  metalness: 0,
  emissive: new THREE.Color(0xfff4d0),
  emissiveIntensity: 0,
});

// Frente con el texto (mira hacia +Z = hacia la cámara)
const letterFront = new THREE.Mesh(
  new THREE.PlaneGeometry(CARD_W, CARD_H),
  frontMat,
);
letterFront.name = "carta";

// Reverso liso
const letterBack = new THREE.Mesh(
  new THREE.PlaneGeometry(CARD_W, CARD_H),
  new THREE.MeshStandardMaterial({ color: 0xf0e4c2, roughness: 0.82 }),
);
letterBack.rotation.y = Math.PI;
letterBack.name = "carta";

letterGroup.add(letterFront, letterBack);

// Estado inicial: dentro del sobre, horizontal, invisible
letterGroup.visible = false;
letterGroup.rotation.set(-Math.PI / 2, 0, 0);
letterGroup.position.set(0, ENV_T / 2 + 0.012, 0);

/* ══════════════════════════════════════════════════════════
   ROSA — GLB + fallback procedural
══════════════════════════════════════════════════════════ */
const roseGroup = new THREE.Group();
roseGroup.position.set(-3.6, 0.12, 0.4);
roseGroup.rotation.z = 0.22;
scene.add(roseGroup);

function fixRoseMaterials(model) {
  model.traverse((child) => {
    if (!child.isMesh) return;
    child.castShadow = true;
    child.receiveShadow = true;
    child.name = "rosa";
    const nm = (child.material?.name || "").toLowerCase();
    const isLeaf =
      nm.includes("leaf") ||
      nm.includes("hoja") ||
      child.material?.color?.g > (child.material?.color?.r || 0) * 1.3;
    const isStem = nm.includes("stem") || nm.includes("tallo");
    const fix = (m) => {
      const n = m.clone();
      n.roughness = isLeaf ? 0.75 : isStem ? 0.8 : 0.55;
      n.metalness = 0;
      n.envMapIntensity = 0;
      if (isLeaf) {
        n.color.set(0x2a7a30);
        n.emissive = new THREE.Color(0x0d3010);
        n.emissiveIntensity = 0.25;
      } else if (isStem) {
        n.color.set(0x1e5c20);
        n.emissive = new THREE.Color(0x0a2810);
        n.emissiveIntensity = 0.2;
      } else {
        n.color.set(0xd41a3a);
        n.emissive = new THREE.Color(0x6b0015);
        n.emissiveIntensity = 0.35;
      }
      n.needsUpdate = true;
      return n;
    };
    child.material = Array.isArray(child.material)
      ? child.material.map(fix)
      : fix(child.material);
  });
}
new GLTFLoader().load(
  "assets/rose.glb",
  (gltf) => {
    const model = gltf.scene;
    const box = new THREE.Box3().setFromObject(model),
      sz = new THREE.Vector3();
    box.getSize(sz);
    const sc = 2.2 / Math.max(sz.x, sz.y, sz.z);
    model.scale.setScalar(sc);
    box.setFromObject(model);
    const ctr = new THREE.Vector3();
    box.getCenter(ctr);
    model.position.sub(ctr);
    model.position.y -= box.min.y * sc;
    fixRoseMaterials(model);
    roseGroup.add(model);
  },
  undefined,
  () => buildProceduralRose(),
);

function buildProceduralRose() {
  const pMat = () =>
    new THREE.MeshStandardMaterial({
      color: 0xd41a3a,
      side: THREE.DoubleSide,
      roughness: 0.55,
      emissive: new THREE.Color(0x6b0015),
      emissiveIntensity: 0.35,
    });
  function petal(angle, radius, height, size, openness) {
    const sh = new THREE.Shape();
    sh.moveTo(0, 0);
    sh.bezierCurveTo(
      size * 0.55,
      size * 0.25,
      size * 0.65,
      size * 0.78,
      0,
      size,
    );
    sh.bezierCurveTo(
      -size * 0.65,
      size * 0.78,
      -size * 0.55,
      size * 0.25,
      0,
      0,
    );
    const m = new THREE.Mesh(new THREE.ShapeGeometry(sh, 10), pMat());
    m.castShadow = true;
    m.rotation.x = -Math.PI / 2 + openness;
    m.rotation.z = angle;
    m.position.set(Math.cos(angle) * radius, height, Math.sin(angle) * radius);
    m.name = "rosa";
    return m;
  }
  [
    { n: 5, r: 0, h: 0, s: 0.22, o: 0.08 },
    { n: 6, r: 0.17, h: 0.02, s: 0.3, o: 0.38 },
    { n: 7, r: 0.33, h: 0, s: 0.38, o: 0.72 },
    { n: 8, r: 0.52, h: -0.04, s: 0.45, o: 1.05 },
    { n: 8, r: 0.7, h: -0.1, s: 0.52, o: 1.32 },
  ].forEach(({ n, r, h, s, o }) => {
    for (let i = 0; i < n; i++)
      roseGroup.add(
        petal((i / n) * Math.PI * 2 + Math.random() * 0.18, r, h, s, o),
      );
  });
  function leaf(rx, ry, rz, px, py, pz, sx = 1, sy = 1) {
    const sh = new THREE.Shape();
    sh.moveTo(0, 0);
    sh.bezierCurveTo(0.5, 0.4, 0.6, 0.95, 0, 1.25);
    sh.bezierCurveTo(-0.6, 0.95, -0.5, 0.4, 0, 0);
    const m = new THREE.Mesh(
      new THREE.ShapeGeometry(sh, 12),
      new THREE.MeshStandardMaterial({
        color: 0x2a7a30,
        side: THREE.DoubleSide,
        roughness: 0.8,
        emissive: new THREE.Color(0x0d3010),
        emissiveIntensity: 0.2,
      }),
    );
    m.scale.set(sx, sy, 1);
    m.rotation.set(rx, ry, rz);
    m.position.set(px, py, pz);
    m.castShadow = true;
    m.name = "rosa";
    return m;
  }
  roseGroup.add(leaf(-0.38, 0.5, 0, 0.32, -0.45, 0.22, 0.52, 0.52));
  roseGroup.add(leaf(-0.38, -0.8, 0, -0.34, -0.65, -0.1, 0.48, 0.48));
  const stalk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.04, 0.065, 2.4, 8),
    new THREE.MeshStandardMaterial({
      color: 0x1e5c20,
      roughness: 0.85,
      emissive: new THREE.Color(0x0a2810),
      emissiveIntensity: 0.15,
    }),
  );
  stalk.position.y = -1.2;
  stalk.name = "rosa";
  roseGroup.add(stalk);
}

/* Nube de puntos */
const pGeo = new THREE.BufferGeometry();
const pPos = new Float32Array(350 * 3);
for (let i = 0; i < 350; i++) {
  pPos[i * 3] = (Math.random() - 0.5) * 14;
  pPos[i * 3 + 1] = Math.random() * 6;
  pPos[i * 3 + 2] = (Math.random() - 0.5) * 12;
}
pGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
const pointCloud = new THREE.Points(
  pGeo,
  new THREE.PointsMaterial({
    color: 0xffaa88,
    size: 0.055,
    transparent: true,
    opacity: 0.35,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  }),
);
scene.add(pointCloud);

/* ══════════════════════════════════════════════════════════
   ESTADO
══════════════════════════════════════════════════════════ */
const raycaster = new THREE.Raycaster(),
  mouse = new THREE.Vector2();
let phase = "idle"; // idle | opening | reading | exploring | finale

function getRayTargets() {
  const t = [];
  envelopeGroup.traverse((c) => {
    if (c.isMesh) t.push(c);
  });
  letterGroup.traverse((c) => {
    if (c.isMesh) t.push(c);
  });
  roseGroup.traverse((c) => {
    if (c.isMesh) t.push(c);
  });
  return t;
}
function isDescendant(obj, root) {
  let c = obj;
  while (c) {
    if (c === root) return true;
    c = c.parent;
  }
  return false;
}

/* ══════════════════════════════════════════════════════════
   DRAG ROSA — cualquier arrastre en fase finale rota la rosa
══════════════════════════════════════════════════════════ */
let roseDragging = false,
  rosePrevX = 0,
  rosePrevY = 0,
  roseVelX = 0,
  roseVelY = 0;

function startRoseDrag(cx, cy) {
  roseDragging = true;
  rosePrevX = cx;
  rosePrevY = cy;
  roseVelX = 0;
  roseVelY = 0;
  renderer.domElement.style.cursor = "grabbing";
}
function moveRoseDrag(cx, cy) {
  if (!roseDragging) return;
  const dx = cx - rosePrevX,
    dy = cy - rosePrevY;
  roseVelX = dx * 0.013;
  roseVelY = dy * 0.009;
  roseGroup.rotation.y += roseVelX;
  roseGroup.rotation.x = THREE.MathUtils.clamp(
    roseGroup.rotation.x + roseVelY,
    -0.85,
    0.85,
  );
  rosePrevX = cx;
  rosePrevY = cy;
}
function endRoseDrag() {
  if (!roseDragging) return;
  roseDragging = false;
  renderer.domElement.style.cursor = "grab";
}

renderer.domElement.addEventListener("mousedown", (e) => {
  if (phase !== "finale") return;
  e.preventDefault();
  startRoseDrag(e.clientX, e.clientY);
});
window.addEventListener("mousemove", (e) => {
  if (phase === "finale") {
    moveRoseDrag(e.clientX, e.clientY);
    return;
  }
  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  renderer.domElement.style.cursor = raycaster.intersectObjects(getRayTargets())
    .length
    ? "pointer"
    : "default";
});
window.addEventListener("mouseup", endRoseDrag);

renderer.domElement.addEventListener(
  "touchstart",
  (e) => {
    if (phase !== "finale") return;
    startRoseDrag(e.touches[0].clientX, e.touches[0].clientY);
  },
  { passive: true },
);
window.addEventListener(
  "touchmove",
  (e) => {
    if (phase === "finale")
      moveRoseDrag(e.touches[0].clientX, e.touches[0].clientY);
  },
  { passive: true },
);
window.addEventListener("touchend", endRoseDrag);

/* Click principal */
renderer.domElement.addEventListener("click", (e) => {
  if (phase === "opening" || phase === "finale") return;
  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const hits = raycaster.intersectObjects(getRayTargets());
  if (!hits.length) return;
  const obj = hits[0].object;
  if (phase === "idle" && isDescendant(obj, envelopeGroup)) openEnvelope();
  if (phase === "reading" && isDescendant(obj, letterGroup)) foldLetter();
  if (phase === "exploring" && isDescendant(obj, roseGroup)) pickRose();
});

/* ══════════════════════════════════════════════════════════
   ANIMACIÓN: ABRIR SOBRE
══════════════════════════════════════════════════════════ */
// Posición de lectura: la carta quedará aquí en world space
const LETTER_READ_POS = new THREE.Vector3(0, 1.4, 2.2);

function openEnvelope() {
  phase = "opening";
  setHint(
    '<span class="heart-icon">💝</span> Abriendo... <span class="heart-icon">💝</span>',
  );

  const tl = gsap.timeline();

  // 1. Cámara baja cerca del sobre
  tl.to(camera.position, {
    y: 2.8,
    z: 6.5,
    duration: 1.0,
    ease: "power2.inOut",
  });

  // 2. Cintas se rompen
  tl.to(
    [ribbonH.scale, ribbonV.scale],
    { y: 0, duration: 0.3, ease: "back.in(2)" },
    "-=.4",
  );

  // 3. Lacre sube y se desvanece
  tl.to(
    lacre.position,
    { y: 0.4, duration: 0.35, ease: "back.out(2)" },
    "-=.1",
  );
  lacre.children.forEach((c) =>
    tl.to(c.material, { opacity: 0, transparent: true, duration: 0.3 }, "<"),
  );

  // 4. Solapa se abre
  tl.to(
    flapPivot.rotation,
    { x: -Math.PI * 0.88, duration: 1.2, ease: "power2.inOut" },
    "-=.1",
  );

  // 5. Carta aparece y desliza hacia fuera del sobre (en espacio LOCAL del sobre)
  tl.call(() => {
    letterGroup.visible = true;
    letterGroup.rotation.set(-Math.PI / 2, 0, 0);
    letterGroup.position.set(0, ENV_T / 2 + 0.012, 0);
  });
  tl.to(
    letterGroup.position,
    { z: ENV_H * 0.68, duration: 0.85, ease: "power2.out" },
    "+=.05",
  );

  // Sparkles
  tl.call(() => emitSparkles(0, envelopeGroup.position.y + 0.6, 1.5, 22));

  // 6. Re-parentar al mundo manteniendo posición/rotación mundial
  tl.call(() => {
    const wp = new THREE.Vector3(),
      wq = new THREE.Quaternion();
    letterGroup.getWorldPosition(wp);
    letterGroup.getWorldQuaternion(wq);
    envelopeGroup.remove(letterGroup);
    scene.add(letterGroup);
    letterGroup.position.copy(wp);
    letterGroup.quaternion.copy(wq);
  });

  // 7. Carta sube, se pone vertical y se coloca en posición de lectura
  tl.to(
    letterGroup.position,
    {
      x: LETTER_READ_POS.x,
      y: LETTER_READ_POS.y,
      z: LETTER_READ_POS.z,
      duration: 1.3,
      ease: "back.out(1.2)",
    },
    "+=.05",
  );
  tl.to(
    letterGroup.rotation,
    { x: 0, y: 0, z: 0, duration: 1.3, ease: "back.out(1.2)" },
    "<",
  );

  // Sobre se va al costado
  tl.to(
    envelopeGroup.position,
    { x: -5.5, duration: 1.0, ease: "power2.inOut" },
    "<",
  );

  // 8. Cámara hace zoom-in justo al frente de la carta para leerla
  //    La cámara se pone casi pegada a la carta, enfocándola de frente
  tl.to(
    camera.position,
    {
      x: LETTER_READ_POS.x, // mismo X que la carta
      y: LETTER_READ_POS.y + 0.05, // casi mismo Y
      z: LETTER_READ_POS.z + 2.0, // 2 unidades delante (el texto mira a +Z)
      duration: 1.1,
      ease: "power2.inOut",
    },
    "-=.4",
  );
  tl.call(() => controls.target.copy(LETTER_READ_POS));

  // Luz sobre la carta + emisión suave
  tl.to(letterLight, { intensity: 4.0, duration: 0.8 }, "<");
  tl.to(frontMat, { emissiveIntensity: 0.18, duration: 0.8 }, "<");
  tl.call(() =>
    letterLight.position.set(
      LETTER_READ_POS.x,
      LETTER_READ_POS.y + 0.8,
      LETTER_READ_POS.z + 1.5,
    ),
  );

  tl.call(() => {
    setHint(
      '<span class="heart-icon">📖</span> Toca la carta para doblarla <span class="heart-icon">💌</span>',
    );
    phase = "reading";
  });
}

/* ══════════════════════════════════════════════════════════
   ANIMACIÓN: DOBLAR CARTA Y VER MESA
══════════════════════════════════════════════════════════ */
function foldLetter() {
  phase = "exploring";
  setHint(
    '<span class="heart-icon">🌹</span> Toca la rosa para mí <span class="heart-icon">💕</span>',
  );

  const tl = gsap.timeline();

  // Apagar luz carta
  tl.to(letterLight, { intensity: 0, duration: 0.5 });
  tl.to(frontMat, { emissiveIntensity: 0, duration: 0.5 }, "<");

  // Carta baja y se dobla horizontal sobre la mesa
  tl.to(
    letterGroup.position,
    { x: -1.5, y: 0.1, z: 0.5, duration: 1.0, ease: "power2.inOut" },
    "<",
  );
  tl.to(
    letterGroup.rotation,
    { x: -Math.PI / 2, y: 0, z: 0.12, duration: 1.0, ease: "power2.inOut" },
    "<",
  );

  // Cámara vuelve a vista amplia de mesa mostrando la rosa
  tl.to(
    camera.position,
    { x: -1.0, y: 4.5, z: 8.5, duration: 1.4, ease: "power2.inOut" },
    "-=.5",
  );
  tl.call(() => {
    controls.target.set(-1.5, 0.8, 0);
    controls.enabled = true;
  });
}

document.getElementById("close-letter")?.addEventListener("click", () => {
  if (phase === "reading") foldLetter();
});

/* ══════════════════════════════════════════════════════════
   ANIMACIÓN: TOMAR LA ROSA
══════════════════════════════════════════════════════════ */
function pickRose() {
  phase = "finale";
  setHint(
    '<span class="heart-icon">💖</span> Arrastra para girar la rosa <span class="heart-icon">🌹</span>',
  );

  const tl = gsap.timeline();

  // Rosa sube al centro
  tl.to(roseGroup.position, {
    x: 0,
    y: 2.5,
    z: 3.8,
    duration: 2.0,
    ease: "power3.out",
  });
  tl.to(
    roseGroup.rotation,
    { x: 0.22, y: Math.PI * 0.5, z: 0, duration: 2.0, ease: "power3.out" },
    "<",
  );

  // Cámara retrocede un poco para ver la rosa completa
  tl.to(
    camera.position,
    { x: 0, y: 3.0, z: 7.0, duration: 1.5, ease: "power2.inOut" },
    "<",
  );
  tl.call(() => {
    controls.target.set(0, 2.2, 0);
    controls.enabled = false;
  });

  // Luces de la rosa siguen
  tl.to(
    roseLight.position,
    { x: 0, y: 3.8, z: 4.6, duration: 2.0, ease: "power3.out" },
    "<",
  );
  tl.to(
    roseFill.position,
    { x: -1.2, y: 3.0, z: 3.3, duration: 2.0, ease: "power3.out" },
    "<",
  );
  tl.to(roseLight, { intensity: 6.0, duration: 1.2 }, "<");
  tl.to(roseFill, { intensity: 3.5, duration: 1.2 }, "<");

  // Giro de presentación
  tl.to(
    roseGroup.rotation,
    { y: Math.PI * 1.5, duration: 2.2, ease: "power2.inOut" },
    "-=.3",
  );

  tl.call(() => {
    petalRain();
    renderer.domElement.style.cursor = "grab";
    setTimeout(() => {
      document.getElementById("romantic-message").classList.remove("hidden");
      setTimeout(
        () =>
          document.getElementById("romantic-message").classList.add("hidden"),
        4500,
      );
    }, 500);
  });
}

/* ══════════════════════════════════════════════════════════
   EFECTOS
══════════════════════════════════════════════════════════ */
function emitSparkles(x, y, z, count = 24) {
  for (let i = 0; i < count; i++) {
    const s = new THREE.Mesh(
      new THREE.SphereGeometry(0.03, 6, 6),
      new THREE.MeshBasicMaterial({
        color: Math.random() < 0.5 ? 0xffcc44 : 0xff88aa,
        transparent: true,
        opacity: 0.9,
      }),
    );
    s.position.set(
      x + (Math.random() - 0.5) * 1.2,
      y + Math.random() * 0.8,
      z + (Math.random() - 0.5) * 1.2,
    );
    scene.add(s);
    gsap.to(s.position, {
      y: s.position.y + 1.5,
      duration: 1.2,
      ease: "power2.out",
      onComplete: () => scene.remove(s),
    });
    gsap.to(s.scale, { x: 0, y: 0, z: 0, duration: 1.2, ease: "power2.in" });
  }
}

function petalRain() {
  const mat = new THREE.MeshStandardMaterial({
    color: 0xff88aa,
    roughness: 0.9,
  });
  for (let i = 0; i < 60; i++) {
    const p = new THREE.Mesh(new THREE.SphereGeometry(0.055, 5, 5), mat);
    p.position.set(
      (Math.random() - 0.5) * 7,
      4.5 + Math.random() * 2.5,
      (Math.random() - 0.5) * 6,
    );
    scene.add(p);
    const dur = 3 + Math.random() * 2.5;
    gsap.to(p.position, {
      y: -1.5,
      duration: dur,
      ease: "power1.in",
      onComplete: () => scene.remove(p),
    });
    gsap.to(p.position, {
      x: p.position.x + (Math.random() - 0.5) * 2,
      z: p.position.z + (Math.random() - 0.5) * 2,
      duration: dur,
      ease: "sine.inOut",
    });
    gsap.to(p.rotation, { z: Math.PI * 4, duration: dur, ease: "none" });
  }
}

/* ══════════════════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════════════════ */
function setHint(html, fadeOut = false) {
  const el = document.getElementById("instructions");
  if (fadeOut) {
    el.classList.add("fade-out");
  } else {
    el.classList.remove("fade-out");
    el.innerHTML = html;
  }
}

function flickerCandles(t) {
  const b = 4.0 + Math.sin(t * 0.0032) * 0.9 + Math.random() * 0.35;
  candleA.intensity = b;
  candleB.intensity = b - 0.35 + Math.random() * 0.25;
  const ox = Math.sin(t * 0.0048) * 0.06;
  candleA.position.x = -2.8 + ox;
  candleB.position.x = 2.8 - ox * 0.7;
}

/* ══════════════════════════════════════════════════════════
   RENDER LOOP
══════════════════════════════════════════════════════════ */
function animate(t = 0) {
  requestAnimationFrame(animate);
  flickerCandles(t);

  if (phase !== "finale") {
    roseGroup.rotation.y += 0.0025;
    roseLight.position.x = roseGroup.position.x;
    roseLight.position.z = roseGroup.position.z + 0.8;
    roseFill.position.x = roseGroup.position.x - 1.2;
    roseFill.position.z = roseGroup.position.z - 0.5;
  } else if (!roseDragging) {
    // Inercia suave al soltar
    roseGroup.rotation.y += roseVelX;
    roseGroup.rotation.x = THREE.MathUtils.clamp(
      roseGroup.rotation.x + roseVelY,
      -0.85,
      0.85,
    );
    roseVelX *= 0.9;
    roseVelY *= 0.9;
  }

  pointCloud.rotation.y += 0.0018;
  controls.update();
  renderer.render(scene, camera);
}
animate();

/* ══════════════════════════════════════════════════════════
   RESIZE
══════════════════════════════════════════════════════════ */
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

/* ══════════════════════════════════════════════════════════
   INICIO — no usar window "load" en módulos ES, ya pasó
══════════════════════════════════════════════════════════ */
setTimeout(() => {
  document.getElementById("loading-screen").classList.add("fade-out");
  setHint(
    '<span class="heart-icon">🌹</span> Haz clic en el sobre <span class="heart-icon">💌</span>',
  );
}, 800);
