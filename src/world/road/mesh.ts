import { Group, Mesh, MeshLambertMaterial, type Texture } from 'three';
import { bendablePlane } from '../../render/segments';
import { ROAD, WORLD_SKIRT } from '../../config/world';
import { elevation, type AreaData, type MapObject, type Rect } from '../map/logic';
import { texturedBox } from '../props/kit';
import { TEX, repeated } from '../props/textures';
import { roadLayout, type Axis } from './logic';

function flat(area: AreaData, r: Rect, lift: number, material: MeshLambertMaterial): Mesh {
  const mesh = new Mesh(bendablePlane(r.w, r.h), material);
  mesh.rotation.x = -Math.PI / 2;
  const cx = r.x + r.w / 2;
  const cz = r.y + r.h / 2;
  mesh.position.set(cx, elevation(area, cx, cz) + lift, cz);
  mesh.receiveShadow = true;
  return mesh;
}

const tiled = (texture: Texture, r: Rect, tiles: number) => new MeshLambertMaterial({ map: repeated(texture, r.w / tiles, r.h / tiles) });

function curb(area: AreaData, r: Rect, along: Axis): Mesh {
  const { height, stripe } = ROAD.curb;
  const [length, width] = along === 'x' ? [r.w, r.h] : [r.h, r.w];
  const cx = r.x + r.w / 2;
  const cz = r.y + r.h / 2;
  const mesh = texturedBox(length, height, width, TEX.curb(), 1 / (stripe * 2), cx, elevation(area, cx, cz) + height / 2, cz);
  if (along === 'y') mesh.rotation.y = Math.PI / 2;
  mesh.castShadow = mesh.receiveShadow = true;
  return mesh;
}

export function roadMesh(area: AreaData, o: Pick<MapObject, 'x' | 'y' | 'w' | 'h' | 'props'>): Group {
  const p = o.props;
  const layout = roadLayout(o, {
    sidewalk: typeof p.sidewalk === 'number' ? p.sidewalk : 0,
    markings: p.markings !== false,
    curb: p.curb !== false,
    bounds: { width: area.width, height: area.height },
    extend: WORLD_SKIRT,
  });
  const g = new Group();
  g.name = 'road';
  const paint = new MeshLambertMaterial({ color: ROAD.colors.line });
  g.add(flat(area, layout.surface, ROAD.lift.surface, tiled(TEX.asphalt(), layout.surface, ROAD.textureTiles)));
  for (const r of [...layout.dashes, ...layout.edges]) g.add(flat(area, r, ROAD.lift.line, paint));
  for (const r of layout.walks) g.add(flat(area, r, ROAD.lift.surface, tiled(TEX.paving(), r, 1)));
  for (const r of layout.curbs) g.add(curb(area, r, layout.along));
  return g;
}
