// The Warpdrive handheld as a real 3D object: candy metallic paint over a
// chrome frame, modelled after the WD-01 renders. The game canvas is the
// screen texture, the buttons can be pressed, and the body can be spun.
import {
  WebGLRenderer,
  Scene,
  PerspectiveCamera,
  Group,
  Mesh,
  Shape,
  ExtrudeGeometry,
  PlaneGeometry,
  SphereGeometry,
  TorusGeometry,
  CylinderGeometry,
  LatheGeometry,
  Vector2,
  Color,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  MeshBasicMaterial,
  CanvasTexture,
  LinearFilter,
  SRGBColorSpace,
  ACESFilmicToneMapping,
  PMREMGenerator,
  Raycaster,
  DirectionalLight,
  AdditiveBlending,
} from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

export function webglOK() {
  try {
    const c = document.createElement("canvas");
    return !!(window.WebGLRenderingContext && (c.getContext("webgl2") || c.getContext("webgl")));
  } catch {
    return false;
  }
}

// body dimensions (outer, after the bevel)
const BS = 0.05; // bevel size
const W = 2.2 - BS * 2;
const H = 1.16 - BS * 2;
const C = 0.16; // corner chamfer
const D = 0.15;
const FZ = D / 2 + BS; // front face z
const SX = -0.1; // screen centre x

const TAU = Math.PI * 2;
const BASE_YAW = -0.42;
const BASE_PITCH = 0.2;

function roundRect(w, h, r) {
  const s = new Shape();
  const x = -w / 2,
    y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

function bodyShape() {
  const s = new Shape();
  const w = W / 2,
    h = H / 2;
  s.moveTo(-w + C, -h);
  s.lineTo(w - C, -h);
  s.lineTo(w, -h + C);
  s.lineTo(w, h - C);
  s.lineTo(w - C, h);
  s.lineTo(-w + C, h);
  s.lineTo(-w, h - C);
  s.lineTo(-w, -h + C);
  s.closePath();
  return s;
}

function plusShape(a, t) {
  const s = new Shape();
  s.moveTo(-t, -a);
  s.lineTo(t, -a);
  s.lineTo(t, -t);
  s.lineTo(a, -t);
  s.lineTo(a, t);
  s.lineTo(t, t);
  s.lineTo(t, a);
  s.lineTo(-t, a);
  s.lineTo(-t, t);
  s.lineTo(-a, t);
  s.lineTo(-a, -t);
  s.lineTo(-t, -t);
  s.closePath();
  return s;
}

/** A lathe profile turned to face +z. */
function lathe(points, segs = 40) {
  // lathe profiles run bottom to top so the faces point outwards
  const g = new LatheGeometry(
    points
      .slice()
      .reverse()
      .map(([r, y]) => new Vector2(r, y)),
    segs,
  );
  g.rotateX(Math.PI / 2);
  return g;
}

function labelTexture() {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 224;
  const x = c.getContext("2d");
  x.fillStyle = "#121014";
  x.beginPath();
  x.roundRect(0, 0, 512, 224, 24);
  x.fill();
  x.fillStyle = "#e8e6ee";
  x.textAlign = "center";
  x.font = "600 34px system-ui, sans-serif";
  x.fillText("MODEL: WD-01", 256, 70);
  x.fillText("INPUT: 12V ⎓ 3A", 256, 118);
  x.font = "700 44px system-ui, sans-serif";
  x.fillText("W A R P D R I V E", 256, 182);
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  return t;
}

function shadowTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const x = c.getContext("2d");
  const g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, "rgba(8,2,20,0.75)");
  g.addColorStop(0.5, "rgba(8,2,20,0.3)");
  g.addColorStop(1, "rgba(8,2,20,0)");
  x.fillStyle = g;
  x.fillRect(0, 0, 128, 128);
  return new CanvasTexture(c);
}

/**
 * Mount the handheld into `host`.
 * opts: screen (canvas), paint (css colour), lowEnd, calm(): bool,
 *   onButton(name, down), onStick(dir) for a flick, onFrame(dt) before each render
 */
export function mountHandheld(host, opts) {
  const renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, opts.lowEnd ? 1.25 : 2));
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = SRGBColorSpace;
  const cv = renderer.domElement;
  cv.className = "hh3d-canvas";
  cv.setAttribute("aria-hidden", "true");
  host.appendChild(cv);

  const scene = new Scene();
  const pmrem = new PMREMGenerator(renderer);
  const envTex = pmrem.fromScene(new RoomEnvironment(), 0.03).texture;
  scene.environment = envTex;
  const key = new DirectionalLight(0xffffff, 1.6);
  key.position.set(-2, 3, 4);
  scene.add(key);
  const rim = new DirectionalLight(0xd9b8ff, 1.2);
  rim.position.set(3, 1, -2);
  scene.add(rim);

  const camera = new PerspectiveCamera(28, 1, 0.1, 50);

  // materials
  const paint = new MeshPhysicalMaterial({
    color: new Color(opts.paint),
    metalness: 0.85,
    roughness: 0.26,
    clearcoat: 1,
    clearcoatRoughness: 0.03,
    envMapIntensity: 1.5,
  });
  const chrome = new MeshStandardMaterial({ color: 0xe9ebf2, metalness: 1, roughness: 0.1 });
  const silver = new MeshPhysicalMaterial({
    color: 0xc9ccd8,
    metalness: 1,
    roughness: 0.28,
    clearcoat: 0.6,
    clearcoatRoughness: 0.2,
  });
  const black = new MeshPhysicalMaterial({ color: 0x07050c, roughness: 0.25, clearcoat: 1, clearcoatRoughness: 0.05 });
  const dark = new MeshStandardMaterial({ color: 0x0c0a12, roughness: 0.6 });

  const screenTex = new CanvasTexture(opts.screen);
  screenTex.magFilter = LinearFilter;
  screenTex.minFilter = LinearFilter;
  screenTex.generateMipmaps = false;
  screenTex.colorSpace = SRGBColorSpace;
  const screenMat = new MeshBasicMaterial({ map: screenTex, toneMapped: false });
  const glassMat = new MeshStandardMaterial({
    color: 0x000000,
    roughness: 0.04,
    metalness: 0.2,
    transparent: true,
    blending: AdditiveBlending,
    depthWrite: false,
  });
  const ledMat = new MeshBasicMaterial({ color: 0xb6ff4a, toneMapped: false });
  const labelMat = new MeshBasicMaterial({ map: labelTexture() });

  const root = new Group();
  scene.add(root);
  const dev = new Group(); // the device, spun by drags
  root.add(dev);
  const pick = []; // meshes that can be hit
  const parts = {}; // name → object, for press animation

  const add = (geo, mat, x = 0, y = 0, z = 0, parent = dev) => {
    const m = new Mesh(geo, mat);
    m.position.set(x, y, z);
    parent.add(m);
    return m;
  };
  const named = (obj, name) => {
    obj.userData.name = name;
    obj.userData.rest = obj.position.z;
    parts[name] = obj;
    obj.traverse((o) => o.isMesh && pick.push(o));
    return obj;
  };

  // body
  const bodyGeo = new ExtrudeGeometry(bodyShape(), {
    depth: D,
    bevelEnabled: true,
    bevelThickness: BS,
    bevelSize: BS,
    bevelSegments: 6,
    curveSegments: 8,
  });
  bodyGeo.translate(0, 0, -D / 2);
  const body = add(bodyGeo, paint);
  body.userData.name = "body";
  pick.push(body);

  // chrome bumpers over the four chamfers
  for (const [sx, sy] of [
    [1, 1],
    [-1, 1],
    [1, -1],
    [-1, -1],
  ]) {
    const len = C * Math.SQRT2 + 0.05;
    const g = new RoundedBoxGeometry(len, 0.07, D + BS * 2 + 0.03, 4, 0.03);
    const m = add(
      g,
      chrome,
      sx * (W / 2 - C / 2) + (sx * BS) / Math.SQRT2,
      sy * (H / 2 - C / 2) + (sy * BS) / Math.SQRT2,
      -0.005,
    );
    m.rotation.z = Math.atan2(-sy, sx);
    m.userData.name = "body";
    pick.push(m);
  }
  // shoulder buttons along the top edge
  for (const sx of [-1, 1]) {
    const m = add(new RoundedBoxGeometry(0.42, 0.09, 0.16, 4, 0.035), chrome, sx * (W / 2 - C - 0.12), H / 2 + BS + 0.012, -0.04);
    named(m, sx < 0 ? "l" : "r");
    m.userData.axis = "y";
    m.userData.rest = m.position.y;
  }
  // side rail with its three buttons
  add(new RoundedBoxGeometry(0.07, 0.56, 0.17, 4, 0.03), chrome, W / 2 + BS + 0.004, -0.02, -0.01).userData.name = "body";
  for (let i = 0; i < 3; i++) add(new RoundedBoxGeometry(0.03, 0.08, 0.06, 2, 0.012), silver, W / 2 + BS + 0.05, 0.14 - i * 0.14, -0.01);
  // vent slots on the top edge
  for (let i = 0; i < 12; i++) add(new RoundedBoxGeometry(0.014, 0.012, 0.075, 1, 0.004), dark, -0.62 + i * 0.03, H / 2 + BS + 0.002, 0.03);
  // usb-c on top
  add(new RoundedBoxGeometry(0.09, 0.014, 0.03, 2, 0.007), dark, 0.08, H / 2 + BS + 0.002, 0);

  // screen
  const bezelGeo = new ExtrudeGeometry(roundRect(1.08, 0.84, 0.05), {
    depth: 0.004,
    bevelEnabled: true,
    bevelThickness: 0.006,
    bevelSize: 0.008,
    bevelSegments: 3,
  });
  add(bezelGeo, black, SX, 0.04, FZ);
  const screen = add(new PlaneGeometry(0.96, 0.72), screenMat, SX, 0.04, FZ + 0.0115);
  screen.userData.name = "screen";
  pick.push(screen);
  add(new PlaneGeometry(1.08, 0.84), glassMat, SX, 0.04, FZ + 0.012);
  add(new SphereGeometry(0.013, 12, 8), ledMat, SX + 0.5, 0.4, FZ + 0.012);

  // sticks: a chrome ring with a dished silver cap
  const stick = (x, y, name) => {
    add(new TorusGeometry(0.15, 0.022, 14, 48), chrome, x, y, FZ + 0.004);
    add(new CylinderGeometry(0.135, 0.135, 0.01, 40).rotateX(Math.PI / 2), dark, x, y, FZ);
    const g = new Group();
    g.position.set(x, y, FZ);
    dev.add(g);
    add(new CylinderGeometry(0.04, 0.05, 0.05, 20).rotateX(Math.PI / 2), dark, 0, 0, 0.025, g);
    add(
      lathe([
        [0, 0.062],
        [0.07, 0.068],
        [0.105, 0.074],
        [0.118, 0.07],
        [0.122, 0.05],
        [0.11, 0.035],
        [0, 0.035],
      ]),
      silver,
      0,
      0,
      0,
      g,
    );
    return named(g, name);
  };
  stick(-0.84, 0.25, "lstick");
  stick(0.82, -0.26, "rstick");

  // d-pad
  const dpadWell = add(new CylinderGeometry(0.17, 0.17, 0.008, 40).rotateX(Math.PI / 2), dark, -0.84, -0.2, FZ);
  dpadWell.userData.name = "body";
  const dp = new Group();
  dp.position.set(-0.84, -0.2, FZ + 0.004);
  dev.add(dp);
  const dpGeo = new ExtrudeGeometry(plusShape(0.14, 0.048), {
    depth: 0.025,
    bevelEnabled: true,
    bevelThickness: 0.012,
    bevelSize: 0.01,
    bevelSegments: 3,
  });
  add(dpGeo, silver, 0, 0, 0.012, dp);
  parts.dpad = dp;
  // invisible hit areas for each arm
  const hit = new MeshBasicMaterial({ visible: false });
  for (const [name, x, y] of [
    ["left", -0.1, 0],
    ["right", 0.1, 0],
    ["up", 0, 0.1],
    ["down", 0, -0.1],
  ]) {
    const m = add(new PlaneGeometry(0.1, 0.1), hit, x, y, 0.06, dp);
    m.userData.name = name;
    pick.push(m);
  }

  // A B X Y, a diamond of domed silver buttons
  const domeGeo = lathe([
    [0, 0.05],
    [0.03, 0.048],
    [0.048, 0.038],
    [0.056, 0.02],
    [0.056, 0],
    [0, 0],
  ]);
  const ringGeo = new TorusGeometry(0.062, 0.008, 8, 32);
  for (const [name, x, y] of [
    ["a", 0.115, 0],
    ["b", 0, -0.115],
    ["x", 0, 0.115],
    ["y", -0.115, 0],
  ]) {
    add(ringGeo, dark, 0.82 + x, 0.16 + y, FZ);
    named(add(domeGeo, silver, 0.82 + x, 0.16 + y, FZ), name);
  }

  // small buttons along the bottom
  const pillGeo = new RoundedBoxGeometry(0.11, 0.045, 0.04, 3, 0.02);
  named(add(pillGeo, silver, 0.36, -0.45, FZ), "select");
  named(add(pillGeo, silver, 0.52, -0.45, FZ), "start");
  named(add(new CylinderGeometry(0.03, 0.03, 0.03, 24).rotateX(Math.PI / 2), silver, -0.6, -0.46, FZ), "home");

  // back: two grips, a raised panel and the rating plate
  for (const sx of [-1, 1]) {
    const g = add(new SphereGeometry(1, 40, 28), paint, sx * 0.76, -0.14, -FZ + 0.01);
    g.scale.set(0.24, 0.32, 0.075);
    g.userData.name = "body";
    pick.push(g);
  }
  const panelGeo = new ExtrudeGeometry(roundRect(0.86, 0.44, 0.08), {
    depth: 0.01,
    bevelEnabled: true,
    bevelThickness: 0.015,
    bevelSize: 0.015,
    bevelSegments: 3,
  });
  const panel = add(panelGeo, paint, 0, -0.18, -FZ - 0.02);
  panel.userData.name = "body";
  pick.push(panel);
  const label = add(new PlaneGeometry(0.34, 0.15), labelMat, 0, -0.18, -FZ - 0.0365);
  label.rotation.y = Math.PI;

  // soft floor shadow, stays put while the device spins
  const shadow = new Mesh(
    new PlaneGeometry(3.4, 1.4),
    new MeshBasicMaterial({ map: shadowTexture(), transparent: true, depthWrite: false }),
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = -1.0;
  scene.add(shadow);

  // ───────── layout ─────────
  let w = 1,
    h = 1;
  const resize = () => {
    w = host.clientWidth || 1;
    h = host.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    const fit = Math.max(2.55 / camera.aspect, 1.95);
    camera.position.set(0, 0.32, fit / (2 * Math.tan((camera.fov * Math.PI) / 360)));
    camera.lookAt(0, -0.08, 0);
    camera.updateProjectionMatrix();
  };
  const ro = new ResizeObserver(resize);
  ro.observe(host);
  resize();

  // ───────── input ─────────
  const ray = new Raycaster();
  const ndc = new Vector2();
  const hitAt = (e, list = pick) => {
    const r = cv.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    return ray.intersectObjects(list, false)[0];
  };
  const nameOf = (o) => {
    while (o && !o.userData.name) o = o.parent;
    return o?.userData.name;
  };

  const down = new Set();
  const view = { yaw: BASE_YAW, pitch: BASE_PITCH, vy: 0, vp: 0, held: false, idle: 0 };
  const stickTilt = { lstick: 0, rstick: 0 };
  let active = null;
  let px = 0,
    py = 0;

  const setPressed = (name, on) => {
    if (on) down.add(name);
    else down.delete(name);
  };

  const onDown = (e) => {
    const hit = hitAt(e);
    if (!hit) return;
    const name = nameOf(hit.object);
    e.preventDefault();
    cv.setPointerCapture(e.pointerId);
    host.focus?.({ preventScroll: true, focusVisible: false });
    if (name === "screen") {
      active = { kind: "btn", name: "a" };
      opts.onButton?.("a", true);
    } else if (name === "lstick" || name === "rstick") {
      active = { kind: "stick", name, x0: e.clientX };
    } else if (name && name !== "body") {
      active = { kind: "btn", name };
      setPressed(name, true);
      opts.onButton?.(name, true);
    } else {
      active = { kind: "spin", x: e.clientX, y: e.clientY, t: performance.now() };
      view.held = true;
      view.vy = view.vp = 0;
    }
  };
  const onMove = (e) => {
    const r = cv.getBoundingClientRect();
    px = ((e.clientX - r.left) / r.width) * 2 - 1;
    py = ((e.clientY - r.top) / r.height) * 2 - 1;
    if (!active) {
      if (e.pointerType === "mouse") {
        const hit = hitAt(e);
        const n = hit && nameOf(hit.object);
        cv.style.cursor = !n ? "" : n === "body" ? "grab" : "pointer";
      }
      return;
    }
    if (active.kind === "spin") {
      const dx = e.clientX - active.x,
        dy = e.clientY - active.y;
      const now = performance.now(),
        dt = Math.max(8, now - active.t);
      view.yaw += dx * 0.012;
      view.pitch = Math.max(-0.9, Math.min(1.1, view.pitch + dy * 0.008));
      view.vy = ((dx * 0.012) / dt) * 16;
      view.vp = ((dy * 0.008) / dt) * 16;
      active.x = e.clientX;
      active.y = e.clientY;
      active.t = now;
      cv.style.cursor = "grabbing";
    } else if (active.kind === "stick") {
      const d = Math.max(-1, Math.min(1, (e.clientX - active.x0) / 40));
      stickTilt[active.name] = d;
      // one flick past the edge moves one step, then it has to come back
      if (Math.abs(d) > 0.8 && !active.fired) {
        active.fired = true;
        opts.onStick?.(Math.sign(d));
      } else if (Math.abs(d) < 0.3) active.fired = false;
    }
  };
  const onUp = () => {
    if (!active) return;
    if (active.kind === "btn") {
      setPressed(active.name, false);
      opts.onButton?.(active.name, false);
    } else if (active.kind === "stick") {
      stickTilt[active.name] = 0;
    } else if (active.kind === "spin") {
      view.held = false;
      view.idle = 0;
      cv.style.cursor = "";
    }
    active = null;
  };
  const onLeave = () => {
    px = py = 0;
  };
  cv.addEventListener("pointerdown", onDown);
  cv.addEventListener("pointermove", onMove);
  cv.addEventListener("pointerup", onUp);
  cv.addEventListener("pointercancel", onUp);
  cv.addEventListener("lostpointercapture", onUp);
  cv.addEventListener("pointerleave", onLeave);

  // ───────── loop ─────────
  let raf = 0,
    running = false,
    last = performance.now(),
    t = 0,
    fx = 0,
    fy = 0;
  const lerp = (a, b, k) => a + (b - a) * k;

  const frame = (now) => {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    const calm = opts.calm();
    t += dt;

    if (!view.held) {
      // let a flick carry, then drift home to face the player
      view.yaw += view.vy;
      view.pitch += view.vp;
      view.vy *= 0.94;
      view.vp *= 0.9;
      if (Math.abs(view.vy) < 0.002) {
        view.idle += dt;
        const home = BASE_YAW + Math.round((view.yaw - BASE_YAW) / TAU) * TAU;
        const k = view.idle > 0.6 ? 1 - Math.pow(0.02, dt) : 0;
        view.yaw = lerp(view.yaw, home, k);
        view.pitch = lerp(view.pitch, BASE_PITCH, k);
      }
    }
    fx = lerp(fx, calm ? 0 : px, 0.06);
    fy = lerp(fy, calm ? 0 : py, 0.06);
    dev.rotation.set(view.pitch + fy * 0.12, view.yaw + fx * 0.22, calm ? -0.04 : -0.04 + Math.sin(t * 0.7) * 0.015, "YXZ");
    root.position.y = calm ? 0 : Math.sin(t * 1.1) * 0.035;
    shadow.material.opacity = 0.85 - root.position.y * 2;

    // presses sink, the d-pad rocks, sticks tilt
    for (const [n, o] of Object.entries(parts)) {
      if (n === "dpad") continue;
      if (n === "lstick" || n === "rstick") {
        o.rotation.y = lerp(o.rotation.y, stickTilt[n] * 0.35, 0.3);
        continue;
      }
      const axis = o.userData.axis || "z";
      const sink = axis === "y" ? -0.025 : -0.022;
      o.position[axis] = lerp(o.position[axis], o.userData.rest + (down.has(n) ? sink : 0), 0.45);
    }
    const tiltY = (down.has("right") ? 0.16 : 0) - (down.has("left") ? 0.16 : 0);
    const tiltX = (down.has("down") ? 0.16 : 0) - (down.has("up") ? 0.16 : 0);
    parts.dpad.rotation.y = lerp(parts.dpad.rotation.y, tiltY, 0.4);
    parts.dpad.rotation.x = lerp(parts.dpad.rotation.x, tiltX, 0.4);

    opts.onFrame?.(dt);
    screenTex.needsUpdate = true;
    renderer.render(scene, camera);
  };

  return {
    canvas: cv,
    setPaint(c) {
      paint.color.set(c);
    },
    setPressed,
    run(on) {
      if (on === running) return;
      running = on;
      if (on) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      } else cancelAnimationFrame(raf);
    },
    destroy() {
      cancelAnimationFrame(raf);
      ro.disconnect();
      cv.removeEventListener("pointerdown", onDown);
      cv.removeEventListener("pointermove", onMove);
      cv.removeEventListener("pointerup", onUp);
      cv.removeEventListener("pointercancel", onUp);
      cv.removeEventListener("lostpointercapture", onUp);
      cv.removeEventListener("pointerleave", onLeave);
      scene.traverse((o) => {
        if (o.geometry) o.geometry.dispose();
        if (o.material) {
          o.material.map?.dispose();
          o.material.dispose();
        }
      });
      envTex.dispose();
      pmrem.dispose();
      renderer.dispose();
      cv.remove();
    },
  };
}
