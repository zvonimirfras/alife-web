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
	// some defaults
	maxAge = 100;
	energy = 100;
	mutationRate = 0.0001;

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

	init(creatureConfig: CreatureConfiguration) {
		if (this.body) {
			this.body.position.x = creatureConfig.position ? creatureConfig.position.x : 0;
			this.body.position.z = creatureConfig.position ? creatureConfig.position.y : 0;
		}

		this.maxAge = creatureConfig.maxAge;
		this.mutationRate = creatureConfig.mutationRate;
		this.energy = creatureConfig.energy;
	}

	destroy() {
		if (this.body) {
			this.world.scene.removeMesh(this.body);
			this.body.dispose();
			this.body = undefined;
		}
	}
};
