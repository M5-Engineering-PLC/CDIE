import * as THREE from "three";

export type AtcMaterialKey =
  | "concrete"
  | "wall"
  | "steel"
  | "steelDark"
  | "green"
  | "blue"
  | "white"
  | "wood"
  | "plywood"
  | "chrome"
  | "black"
  | "rubber"
  | "glass"
  | "darkGlass"
  | "yellow"
  | "red"
  | "screen"
  | "duct";

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
    context.fillStyle = "#aaa99f";
    context.fillRect(0, 0, 512, 512);
    for (let index = 0; index < 4200; index += 1) {
      const tone = Math.floor(94 + random() * 95);
      const alpha = 0.08 + random() * 0.2;
      context.fillStyle = `rgba(${tone}, ${tone}, ${tone - 5}, ${alpha})`;
      context.beginPath();
      context.ellipse(random() * 512, random() * 512, 0.5 + random() * 2.5, 0.5 + random() * 1.2, random(), 0, Math.PI * 2);
      context.fill();
    }
    context.strokeStyle = "rgba(70, 70, 65, 0.12)";
    context.lineWidth = 1;
    for (let index = 0; index < 24; index += 1) {
      const x = random() * 512;
      const y = random() * 512;
      context.beginPath();
      context.moveTo(x, y);
      context.lineTo(x + (random() - 0.5) * 22, y + 1 + random() * 16);
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
    context.fillStyle = "#bd9a70";
    context.fillRect(0, 0, 512, 256);
    for (let index = 0; index < 190; index += 1) {
      const y = random() * 256;
      const shade = random() > 0.5 ? 67 : 35;
      context.strokeStyle = `rgba(${shade}, ${shade - 10}, ${shade - 20}, ${0.06 + random() * 0.17})`;
      context.lineWidth = 0.5 + random() * 2.2;
      context.beginPath();
      context.moveTo(0, y);
      context.bezierCurveTo(128, y + (random() - 0.5) * 18, 340, y + (random() - 0.5) * 12, 512, y + (random() - 0.5) * 10);
      context.stroke();
    }
    for (const [x, y] of [[116, 82], [394, 187]] as const) {
      context.strokeStyle = "rgba(78, 49, 28, 0.18)";
      for (let radius = 3; radius < 24; radius += 4) {
        context.beginPath();
        context.ellipse(x, y, radius * 1.8, radius * 0.42, 0, 0, Math.PI * 2);
        context.stroke();
      }
    }
  });
}

export function createAtcMaterials(): AtcMaterials {
  const concreteMap = concreteTexture();
  const woodMap = woodTexture();
  if (concreteMap) concreteMap.repeat.set(3, 2);
  if (woodMap) woodMap.repeat.set(1.4, 1);
  const textures: THREE.Texture[] = [];
  if (concreteMap) textures.push(concreteMap);
  if (woodMap) textures.push(woodMap);

  return {
    textures,
    palette: {
      concrete: new THREE.MeshStandardMaterial({ color: 0xd0cec3, map: concreteMap ?? undefined, roughness: 0.94 }),
      wall: new THREE.MeshStandardMaterial({ color: 0x252c30, roughness: 0.82, metalness: 0.12 }),
      steel: new THREE.MeshStandardMaterial({ color: 0x3e4949, roughness: 0.34, metalness: 0.68 }),
      steelDark: new THREE.MeshStandardMaterial({ color: 0x20282c, roughness: 0.42, metalness: 0.58 }),
      green: new THREE.MeshStandardMaterial({ color: 0x287348, roughness: 0.4, metalness: 0.28 }),
      blue: new THREE.MeshPhysicalMaterial({ color: 0x14548a, roughness: 0.36, metalness: 0.22, clearcoat: 0.16 }),
      white: new THREE.MeshPhysicalMaterial({ color: 0xe3e2dc, roughness: 0.32, metalness: 0.16, clearcoat: 0.12 }),
      wood: new THREE.MeshStandardMaterial({ color: 0xd0b18a, map: woodMap ?? undefined, roughness: 0.66 }),
      plywood: new THREE.MeshStandardMaterial({ color: 0xe0c59c, map: woodMap ?? undefined, roughness: 0.84 }),
      chrome: new THREE.MeshStandardMaterial({ color: 0xaab1b1, roughness: 0.24, metalness: 0.84 }),
      black: new THREE.MeshStandardMaterial({ color: 0x171b1d, roughness: 0.48, metalness: 0.18 }),
      rubber: new THREE.MeshStandardMaterial({ color: 0x191b1c, roughness: 0.92, metalness: 0.02 }),
      glass: new THREE.MeshStandardMaterial({ color: 0x9bbbc0, roughness: 0.17, metalness: 0.12, transparent: true, opacity: 0.27, side: THREE.DoubleSide, depthWrite: false }),
      darkGlass: new THREE.MeshStandardMaterial({ color: 0x19262a, roughness: 0.16, metalness: 0.22 }),
      yellow: new THREE.MeshStandardMaterial({ color: 0xdba62e, roughness: 0.39, metalness: 0.18 }),
      red: new THREE.MeshStandardMaterial({ color: 0xb8342e, roughness: 0.32, metalness: 0.08 }),
      screen: new THREE.MeshStandardMaterial({ color: 0x10252b, roughness: 0.12, metalness: 0.12, emissive: 0x0a2228, emissiveIntensity: 0.3 }),
      duct: new THREE.MeshStandardMaterial({ color: 0x909999, roughness: 0.3, metalness: 0.72 }),
    },
  };
}
