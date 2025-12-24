export enum TreeState {
  CHAOS = 'CHAOS',
  FORMED = 'FORMED'
}

export type DualPosition = {
  chaos: [number, number, number];
  target: [number, number, number];
};

export enum OrnamentType {
  GIFT = 'GIFT', // Heavy
  BAUBLE = 'BAUBLE', // Light
  LIGHT = 'LIGHT' // Very Light
}