
export type RenderMode = 'stack' | 'box';

export interface AppConfig {
  text: string;
  renderMode: RenderMode;
  count: number;
  depth: number;
  speed: number;
  rotation: number;
  fontSize: number;
  letterSpacing: number;
  lineHeight: number;
  perspective: number;
  color: string;
  bgColor: string;
  strokeMode: boolean;
  strokeWidth: number;
  tiltX: number;
  tiltY: number;
  originX: number; // -1 to 1
  originY: number; // -1 to 1
  innerBoxWidth: number;
  innerBoxHeight: number;
  isAutoRotating: boolean;
  autoRotateSpeed: number;
  fontFamily: string;
}

export const DEFAULT_CONFIG: AppConfig = {
  text: "ISOLATION -- // ISOLATION -- //",
  renderMode: 'box',
  count: 80,
  depth: 0.05,
  speed: 0.1,
  rotation: 0,
  fontSize: 120,
  letterSpacing: -2,
  lineHeight: 1.0,
  perspective: 1000,
  color: "#000000",
  bgColor: "#ffffff",
  strokeMode: false,
  strokeWidth: 2,
  tiltX: 0,
  tiltY: 0,
  originX: 0,
  originY: 0,
  innerBoxWidth: 600,
  innerBoxHeight: 400,
  isAutoRotating: true,
  autoRotateSpeed: 0.3,
  fontFamily: "'Inter', sans-serif"
};

export const PRESETS: Record<string, Partial<AppConfig>> = {
  "Tunnel": {
    renderMode: 'box',
    innerBoxWidth: 800,
    innerBoxHeight: 500,
    rotation: 0,
    speed: 0.15,
    count: 100,
    depth: 0.04
  },
  "Vortex": {
    renderMode: 'stack',
    rotation: 8,
    innerBoxWidth: 0,
    innerBoxHeight: 0,
    speed: 0.08,
    count: 60
  },
  "Spiral": {
    renderMode: 'box',
    bgColor: "#000000",
    color: "#ffffff",
    count: 50,
    depth: 0.12,
    speed: 0.2,
    rotation: 45,
    fontSize: 250,
    innerBoxWidth: 400,
    innerBoxHeight: 400
  },
  "Ascent": {
    renderMode: 'stack',
    speed: 0.03,
    count: 150,
    depth: 0.01,
    rotation: 10,
    fontSize: 200,
    originX: -0.4,
    originY: 0.3
  }
};
