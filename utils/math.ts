import * as THREE from 'three';
import { CONFIG } from '../constants';

// Get a random point inside a sphere
export const getRandomSpherePoint = (radius: number): [number, number, number] => {
  const u = Math.random();
  const v = Math.random();
  const theta = 2 * Math.PI * u;
  const phi = Math.acos(2 * v - 1);
  const r = Math.cbrt(Math.random()) * radius;
  const sinPhi = Math.sin(phi);
  return [
    r * sinPhi * Math.cos(theta),
    r * sinPhi * Math.sin(theta),
    r * Math.cos(phi)
  ];
};

// Get a point on a cone surface (The Tree) with spiral distribution
export const getTreePoint = (height: number, maxRadius: number, index: number, total: number): [number, number, number] => {
  // Normalized height (0 at bottom, 1 at top)
  const yNorm = index / total; 
  // Reverse: 0 at top, 1 at bottom for radius calc
  const radiusAtY = (1 - yNorm) * maxRadius;
  
  // Golden angle for nice spiral distribution
  const theta = index * 2.39996; 
  
  const x = radiusAtY * Math.cos(theta);
  const z = radiusAtY * Math.sin(theta);
  // Shift Y to center roughly
  const y = (yNorm * height) - (height / 2);
  
  // Add slight randomness to thickness
  const noise = (Math.random() - 0.5) * 0.5;
  
  return [x + noise, y, z + noise];
};