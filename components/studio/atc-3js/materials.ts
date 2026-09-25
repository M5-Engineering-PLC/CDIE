import * as THREE from "three";

export type AtcMaterialKey =
  | "concrete"
  | "wall"
  | "steel"
  | "steelDark"
  | "steelBright"
  | "containerBlue"
  | "shutterWhite"
  | "white"
  | "wood"
  | "plywood"
  | "carvedWorkpiece"
  | "chrome"
  | "black"
  | "rubber"
  | "glass"
  | "darkGlass"
  | "yellow"
  | "turquoise"
  | "viceGold"
  | "brass"
  | "red"
  | "screen"
  | "cncScreen";

export type AtcMaterials = {
  palette: Record<AtcMaterialKey, THREE.MeshStandardMaterial>;
  textures: THREE.Texture[];
};

function makeCanvasTexture(
  width: number,
  height: number,
  paint: (context: CanvasRenderingContext2D) => void,
): THREE.CanvasTexture | null {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) return null;
  paint(context);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.anisotropy = 4;
  return texture;
}

function concreteTexture() {
  return makeCanvasTexture(512, 512, (context) => {
    let seed = 73421;
    const random = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };
    context.fillStyle = "#e2e6e8";
    context.fillRect(0, 0, 512, 512);

    for (let index = 0; index < 3600; index += 1) {
      const tone = Math.floor(70 + random() * 110);
      const alpha = 0.08 + random() * 0.22;
      context.fillStyle = `rgba(${tone}, ${tone}, ${tone + 4}, ${alpha})`;
      context.beginPath();
      context.ellipse(
        random() * 512,
        random() * 512,
        0.5 + random() * 2.5,
        0.5 + random() * 1.5,
        random() * Math.PI,
        0,
        Math.PI * 2,
      );
      context.fill();
    }

    context.strokeStyle = "rgba(100, 110, 115, 0.1)";
    context.lineWidth = 1;
    for (let index = 0; index < 18; index += 1) {
      const x = random() * 512;
      const y = random() * 512;
      context.beginPath();
      context.moveTo(x, y);
      context.lineTo(x + (random() - 0.5) * 30, y + (random() - 0.5) * 20);
      context.stroke();
    }
  });
}

function woodTexture() {
  return makeCanvasTexture(512, 256, (context) => {
    let seed = 91817;
    const random = () => {
      seed = (seed * 48271) % 2147483647;
      return (seed - 1) / 2147483646;
    };
    context.fillStyle = "#b88958";
    context.fillRect(0, 0, 512, 256);

    for (let index = 0; index < 220; index += 1) {
      const y = random() * 256;
      const shade = random() > 0.5 ? 65 : 32;
      context.strokeStyle = `rgba(${shade}, ${shade - 12}, ${shade - 25}, ${0.06 + random() * 0.18})`;
      context.lineWidth = 0.5 + random() * 2.0;
      context.beginPath();
      context.moveTo(0, y);
      context.bezierCurveTo(
        128,
        y + (random() - 0.5) * 16,
        340,
        y + (random() - 0.5) * 12,
        512,
        y + (random() - 0.5) * 10,
      );
      context.stroke();
    }

    for (const [x, y] of [[120, 80], [380, 175]] as const) {
      context.strokeStyle = "rgba(75, 45, 22, 0.16)";
      for (let radius = 2; radius < 20; radius += 3.5) {
        context.beginPath();
        context.ellipse(x, y, radius * 1.6, radius * 0.38, 0, 0, Math.PI * 2);
        context.stroke();
      }
    }
  });
}

/**
 * Procedural birch plywood workpiece with the freshly engraved CDIE logo and toolpath grooves.
 * Source: cnc.jpg, cncwithWOrkbench.jpg
 */
function carvedWorkpieceTexture() {
  return makeCanvasTexture(512, 512, (context) => {
    // 1. Birch plywood base grain
    context.fillStyle = "#d4ab78";
    context.fillRect(0, 0, 512, 512);

    for (let i = 0; i < 180; i += 1) {
      const y = (i * 512) / 180;
      context.strokeStyle = "rgba(130, 85, 45, 0.08)";
      context.lineWidth = 1 + (i % 3);
      context.beginPath();
      context.moveTo(0, y);
      context.bezierCurveTo(150, y + 4, 350, y - 4, 512, y);
      context.stroke();
    }

    // 2. CNC Engraved Circular Pocket & Grooves (CDIE Seal)
    const cx = 256;
    const cy = 256;

    // Recessed milled background
    context.fillStyle = "rgba(105, 68, 38, 0.35)";
    context.beginPath();
    context.arc(cx, cy, 185, 0, Math.PI * 2);
    context.fill();

    // Outer milled ring groove
    context.strokeStyle = "#4a2d18";
    context.lineWidth = 7;
    context.beginPath();
    context.arc(cx, cy, 182, 0, Math.PI * 2);
    context.stroke();

    // Inner concentric carved toolpath rings
    context.lineWidth = 4;
    context.beginPath();
    context.arc(cx, cy, 160, 0, Math.PI * 2);
    context.stroke();

    context.lineWidth = 2.5;
    context.strokeStyle = "rgba(74, 45, 24, 0.6)";
    context.beginPath();
    context.arc(cx, cy, 135, 0, Math.PI * 2);
    context.stroke();

    // 3. Carved Text & Logo in Wood
    context.fillStyle = "#3e2412";
    context.font = "bold 32px Arial, sans-serif";
    context.textAlign = "center";
    context.textBaseline = "middle";

    // Top Header: "DESIGN STUDIO"
    context.fillText("DESIGN STUDIO", cx, cy - 80);

    // Center Logo: "CDIE"
    context.font = "900 68px Arial, sans-serif";
    context.fillText("CDIE", cx, cy + 4);

    // Subtitle: "M5 ENGINEERING"
    context.font = "bold 22px Arial, sans-serif";
    context.fillText("PROTOTYPING & INNOVATION", cx, cy + 82);

    // 4. Fine toolpath milling spiral tracks
    context.strokeStyle = "rgba(180, 140, 95, 0.4)";
    context.lineWidth = 1.2;
    for (let r = 25; r < 180; r += 14) {
      context.beginPath();
      context.arc(cx, cy, r, 0, Math.PI * 2);
      context.stroke();
    }
  });
}

function cncScreenTexture() {
  return makeCanvasTexture(512, 384, (context) => {
    context.fillStyle = "#111827";
    context.fillRect(0, 0, 512, 384);

    context.fillStyle = "#1f2937";
    context.fillRect(0, 0, 512, 32);
    context.fillStyle = "#38bdf8";
    context.font = "bold 14px monospace";
    context.fillText("NCStudio V8.2 - CDIE CNC-1212", 12, 21);

    context.fillStyle = "#0f172a";
    context.fillRect(12, 44, 210, 110);
    context.fillStyle = "#22c55e";
    context.font = "bold 18px monospace";
    context.fillText("X: +0342.50 mm", 22, 72);
    context.fillText("Y: +0188.20 mm", 22, 102);
    context.fillText("Z: +0012.00 mm", 22, 132);

    context.fillStyle = "#090d16";
    context.fillRect(234, 44, 266, 320);
    context.strokeStyle = "#1e293b";
    context.lineWidth = 1;
    for (let i = 0; i < 266; i += 24) {
      context.beginPath();
      context.moveTo(234 + i, 44);
      context.lineTo(234 + i, 364);
      context.stroke();
    }
    for (let j = 0; j < 320; j += 24) {
      context.beginPath();
      context.moveTo(234, 44 + j);
      context.lineTo(500, 44 + j);
      context.stroke();
    }

    context.strokeStyle = "#06b6d4";
    context.lineWidth = 2.5;
    context.beginPath();
    context.arc(367, 204, 82, 0, Math.PI * 2);
    context.stroke();

    context.strokeStyle = "#eab308";
    context.lineWidth = 1.5;
    context.beginPath();
    context.arc(367, 204, 54, 0, Math.PI * 2);
    context.stroke();

    context.fillStyle = "#1e293b";
    context.fillRect(12, 166, 210, 198);
    context.fillStyle = "#cbd5e1";
    context.font = "12px monospace";
    context.fillText("FEEDRATE: 2400 mm/min", 22, 192);
    context.fillText("SPINDLE:  18000 RPM", 22, 216);
    context.fillText("STATUS:   FINISHED", 22, 240);
    context.fillText("JOB:      CDIE_LOGO.TAP", 22, 264);

    context.fillStyle = "#22c55e";
    context.fillRect(22, 280, 190, 16);
    context.fillStyle = "#000000";
    context.font = "bold 11px monospace";
    context.fillText("CYCLE COMPLETE: 100%", 30, 292);
  });
}

export function createAtcMaterials(): AtcMaterials {
  const concreteMap = concreteTexture();
  const woodMap = woodTexture();
  const cncScreenMap = cncScreenTexture();
  const carvedMap = carvedWorkpieceTexture();
  if (concreteMap) concreteMap.repeat.set(4, 3);
  if (woodMap) woodMap.repeat.set(1.5, 1);
  const textures: THREE.Texture[] = [];
  if (concreteMap) textures.push(concreteMap);
  if (woodMap) textures.push(woodMap);
  if (cncScreenMap) textures.push(cncScreenMap);
  if (carvedMap) textures.push(carvedMap);

  return {
    textures,
    palette: {
      concrete: new THREE.MeshStandardMaterial({
        color: 0xe8ecef,
        map: concreteMap ?? undefined,
        roughness: 0.72,
        metalness: 0.05,
      }),
      wall: new THREE.MeshStandardMaterial({
        color: 0x334155,
        roughness: 0.75,
        metalness: 0.1,
      }),
      steel: new THREE.MeshStandardMaterial({
        color: 0x475569,
        roughness: 0.38,
        metalness: 0.65,
      }),
      steelDark: new THREE.MeshStandardMaterial({
        color: 0x1e242c,
        roughness: 0.45,
        metalness: 0.55,
      }),
      steelBright: new THREE.MeshStandardMaterial({
        color: 0xc8d0d5,
        roughness: 0.22,
        metalness: 0.8,
      }),
      containerBlue: new THREE.MeshPhysicalMaterial({
        color: 0x1d4f8d,
        roughness: 0.42,
        metalness: 0.18,
        clearcoat: 0.12,
      }),
      shutterWhite: new THREE.MeshStandardMaterial({
        color: 0xedebe4,
        roughness: 0.5,
        metalness: 0.2,
      }),
      white: new THREE.MeshPhysicalMaterial({
        color: 0xf8fafc,
        roughness: 0.28,
        metalness: 0.12,
        clearcoat: 0.15,
      }),
      wood: new THREE.MeshStandardMaterial({
        color: 0xb88958,
        map: woodMap ?? undefined,
        roughness: 0.55,
        metalness: 0.04,
      }),
      plywood: new THREE.MeshStandardMaterial({
        color: 0xd8af79,
        map: woodMap ?? undefined,
        roughness: 0.78,
      }),
      carvedWorkpiece: new THREE.MeshStandardMaterial({
        color: 0xffffff,
        map: carvedMap ?? undefined,
        roughness: 0.62,
        metalness: 0.04,
      }),
      chrome: new THREE.MeshStandardMaterial({
        color: 0xe2e8f0,
        roughness: 0.18,
        metalness: 0.85,
      }),
      black: new THREE.MeshStandardMaterial({
        color: 0x18181b,
        roughness: 0.65,
        metalness: 0.15,
      }),
      rubber: new THREE.MeshStandardMaterial({
        color: 0x111827,
        roughness: 0.92,
        metalness: 0.02,
      }),
      glass: new THREE.MeshStandardMaterial({
        color: 0xe0f2fe,
        roughness: 0.1,
        transparent: true,
        opacity: 0.35,
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
      darkGlass: new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        roughness: 0.15,
        metalness: 0.2,
        transparent: true,
        opacity: 0.65,
      }),
      yellow: new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        roughness: 0.38,
        metalness: 0.15,
      }),
      turquoise: new THREE.MeshStandardMaterial({
        color: 0x0f766e,
        roughness: 0.38,
        metalness: 0.15,
      }),
      viceGold: new THREE.MeshStandardMaterial({
        color: 0x9a7030,
        roughness: 0.45,
        metalness: 0.45,
      }),
      brass: new THREE.MeshStandardMaterial({
        color: 0xd97706,
        roughness: 0.32,
        metalness: 0.7,
      }),
      red: new THREE.MeshStandardMaterial({
        color: 0xdc2626,
        roughness: 0.3,
        metalness: 0.1,
      }),
      screen: new THREE.MeshStandardMaterial({
        color: 0x0284c7,
        roughness: 0.2,
        metalness: 0.1,
        emissive: 0x0369a1,
        emissiveIntensity: 0.25,
      }),
      cncScreen: new THREE.MeshStandardMaterial({
        map: cncScreenMap ?? undefined,
        roughness: 0.15,
        metalness: 0.05,
        emissive: 0xffffff,
        emissiveMap: cncScreenMap ?? undefined,
        emissiveIntensity: 0.7,
      }),
    },
  };
}
