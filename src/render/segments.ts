import { BoxGeometry, PlaneGeometry } from 'three';
import { GRAPHICS } from '../config/graphics';

export const segments = (size: number): number => Math.max(1, Math.ceil(Math.abs(size) / GRAPHICS.curve.step - 1e-6));

export const bendablePlane = (w: number, h: number): PlaneGeometry => new PlaneGeometry(w, h, segments(w), segments(h));

export const bendableBox = (w: number, h: number, d: number): BoxGeometry => new BoxGeometry(w, h, d, segments(w), 1, segments(d));
