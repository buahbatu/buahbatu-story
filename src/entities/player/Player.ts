import { CircleGeometry, Group, Mesh, MeshBasicMaterial, PlaneGeometry, type Texture } from 'three';
import { CHARACTER_SPRITE } from '../../config/world';
import { DIRECTIONS, SHEET_COLUMNS, frameOf, type PlayerMotion } from './logic';
import { FRAME_H, FRAME_W, sheetTexture, type Appearance } from './sprite';

export class PlayerView {
  readonly object = new Group();
  private readonly texture: Texture;

  constructor(look: Appearance) {
    this.texture = sheetTexture(look).clone();
    this.texture.repeat.set(1 / SHEET_COLUMNS, 1 / DIRECTIONS.length);
    const h = CHARACTER_SPRITE.height;
    const geometry = new PlaneGeometry((h * FRAME_W) / FRAME_H, h);
    geometry.translate(0, h / 2, 0);
    const sprite = new Mesh(geometry, new MeshBasicMaterial({ map: this.texture, alphaTest: 0.5 }));
    sprite.rotation.x = -CHARACTER_SPRITE.lean;
    sprite.name = 'sprite';
    const shadow = new Mesh(
      new CircleGeometry(CHARACTER_SPRITE.shadowRadius, 12),
      new MeshBasicMaterial({ color: '#000000', transparent: true, opacity: 0.28, depthWrite: false }),
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.scale.y = 0.6;
    shadow.position.y = 0.03;
    this.object.add(shadow, sprite);
    this.object.name = 'player';
  }

  apply(motion: PlayerMotion, ground: number): void {
    this.object.position.set(motion.x, ground, motion.y);
    const row = DIRECTIONS.indexOf(motion.facing);
    const col = frameOf(motion.anim, motion.animTime);
    this.texture.offset.set(col / SHEET_COLUMNS, 1 - (row + 1) / DIRECTIONS.length);
  }
}
