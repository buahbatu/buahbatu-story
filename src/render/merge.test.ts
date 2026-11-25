import { BoxGeometry, Group, Mesh, MeshLambertMaterial, SkinnedMesh, Texture } from 'three';
import { describe, expect, it } from 'vitest';
import { mergeStatic } from './merge';

const meshes = (g: Group): Mesh[] => {
  const out: Mesh[] = [];
  g.traverse((n) => {
    if (n instanceof Mesh) out.push(n as Mesh);
  });
  return out;
};
const vertices = (g: Group) => meshes(g).reduce((n, m) => n + m.geometry.getAttribute('position').count, 0);

describe('penggabungan geometri statis (ADR-030: kurangi draw call)', () => {
  it('banyak mesh bermaterial sama jadi satu mesh, jumlah titik tetap', () => {
    const red = new MeshLambertMaterial({ color: '#ff0000' });
    const g = new Group();
    for (let i = 0; i < 5; i++) {
      const m = new Mesh(new BoxGeometry(1, 1, 1), red);
      m.position.x = i * 2;
      g.add(m);
    }
    const before = vertices(g);
    expect(mergeStatic(g)).toBe(1);
    expect(meshes(g)).toHaveLength(1);
    expect(vertices(g)).toBe(before * (36 / 24));
  });

  it('posisi & putaran ikut terpanggang (bounding box merentang semua kotak)', () => {
    const mat = new MeshLambertMaterial();
    const g = new Group();
    const inner = new Group();
    inner.position.set(10, 0, 0);
    inner.add(new Mesh(new BoxGeometry(1, 1, 1), mat));
    g.add(new Mesh(new BoxGeometry(1, 1, 1), mat), inner);
    mergeStatic(g);
    const [m] = meshes(g);
    m?.geometry.computeBoundingBox();
    expect(m?.geometry.boundingBox?.max.x).toBeCloseTo(10.5);
    expect(m?.geometry.boundingBox?.min.x).toBeCloseTo(-0.5);
  });

  it('material berbeda tetap terpisah; material sama-sifat (beda objek) disatukan', () => {
    const g = new Group();
    g.add(
      new Mesh(new BoxGeometry(), new MeshLambertMaterial({ color: '#00ff00' })),
      new Mesh(new BoxGeometry(), new MeshLambertMaterial({ color: '#00ff00' })),
      new Mesh(new BoxGeometry(), new MeshLambertMaterial({ color: '#0000ff' })),
    );
    expect(mergeStatic(g)).toBe(2);
  });

  it('kotak multi-material dipecah per material lalu digabung dengan kotak lain', () => {
    const a = new MeshLambertMaterial({ color: '#111111' });
    const b = new MeshLambertMaterial({ color: '#222222' });
    const g = new Group();
    g.add(new Mesh(new BoxGeometry(), [a, a, b, b, a, a]), new Mesh(new BoxGeometry(), [b, b, b, b, b, b]));
    expect(mergeStatic(g)).toBe(2);
    expect(vertices(g)).toBe(72);
  });

  it('tekstur sama dengan ulangan berbeda digabung; ulangan dipanggang ke UV', () => {
    const base = new Texture();
    const t1 = base.clone();
    t1.repeat.set(4, 2);
    const t2 = base.clone();
    const g = new Group();
    g.add(
      new Mesh(new BoxGeometry(), new MeshLambertMaterial({ map: t1 })),
      new Mesh(new BoxGeometry(), new MeshLambertMaterial({ map: t2 })),
    );
    expect(mergeStatic(g)).toBe(1);
    const [m] = meshes(g);
    const uv = m?.geometry.getAttribute('uv');
    const us = Array.from({ length: uv?.count ?? 0 }, (_, i) => uv?.getX(i) ?? 0);
    expect(Math.max(...us)).toBeCloseTo(4);
    expect((m?.material as MeshLambertMaterial).map?.repeat.x).toBe(1);
  });

  it('mesh dinamis, skinned & bayangan berbeda tidak dicampur', () => {
    const mat = new MeshLambertMaterial();
    const g = new Group();
    const moving = new Mesh(new BoxGeometry(), mat);
    moving.userData.dynamic = true;
    const skinned = new SkinnedMesh(new BoxGeometry(), mat);
    const shadowed = new Mesh(new BoxGeometry(), mat);
    shadowed.castShadow = true;
    g.add(moving, skinned, shadowed, new Mesh(new BoxGeometry(), mat), new Mesh(new BoxGeometry(), mat));
    expect(mergeStatic(g)).toBe(2);
    expect(meshes(g)).toContain(moving);
    expect(meshes(g)).toContain(skinned);
  });
});
