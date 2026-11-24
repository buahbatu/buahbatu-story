import { Group } from 'three';
import { CHARACTER } from '../../config/world';
import type { Appearance } from './appearance';
import { createCharacter, type Character } from './character';
import { yawOf, type PlayerMotion } from './logic';

export class PlayerView {
  readonly object = new Group();
  private character: Character | null = null;
  private yaw = 0;

  constructor() {
    this.object.name = 'player';
  }

  async setLook(look: Appearance): Promise<void> {
    const next = await createCharacter(look);
    this.character?.root.removeFromParent();
    this.character = next;
    this.object.add(next.root);
  }

  apply(motion: PlayerMotion, ground: number, dt: number | null): void {
    this.object.position.set(motion.x, ground, motion.y);
    const target = yawOf(motion.facing);
    const diff = Math.atan2(Math.sin(target - this.yaw), Math.cos(target - this.yaw));
    const step = dt === null ? Math.abs(diff) : CHARACTER.turnSpeed * dt;
    this.yaw += Math.sign(diff) * Math.min(Math.abs(diff), step);
    if (!this.character) return;
    this.character.root.rotation.y = this.yaw;
    this.character.play(motion.anim, motion.animTime);
  }
}
