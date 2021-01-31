import { World } from './world';
import {
	Mesh,
	Vector3
} from '@babylonjs/core';

export interface CreatureConfiguration {
	growthRate: number;
    maxAge: number;
    size: number;
    energy: number;
    mutationRate: number;
    position: Vector3;
};

export class Creature {
	constructor(world: World, body?: Mesh) {
		this.world = world;
		this.body = body;
	}

	world: World;
	body: Mesh | undefined;

	isParalyzed() {
		// TODO
		return false;
	}

	turn(torque: number) {
		if (this.isParalyzed()) {
			return;
		}

		this.body?.physicsImpostor?.applyImpulse(new Vector3(torque/2, 0, 0), this.body?.getAbsolutePosition().add(new Vector3(0, 0, 1)));
		this.body?.physicsImpostor?.applyImpulse(new Vector3(-torque/2, 0, 0), this.body?.getAbsolutePosition().add(new Vector3(0, 0, -1)));
	}

	go(force: number) {
		if (this.isParalyzed()) {
			return;
		}

		const forward = new Vector3(.707, 0, .707);
		const direction = this.body?.getDirection(forward).clone().normalize() || forward;
		this.body?.physicsImpostor?.applyImpulse(direction.multiplyByFloats(force, force, force), this.body?.getAbsolutePosition());
	}

	step() {
		// TODO rest of the step
		this.explore();
	}

	explore() {}

	isDead() {
		// TODO
		return false;
	}

	create(creatureConfig: CreatureConfiguration) {
		console.log('You need to implement `create()` function when you subclass.');
	}

	destroy() {
		if (this.body) {
			this.world.scene.removeMesh(this.body);
			this.body.dispose();
			this.body = undefined;
		}
	}
};
