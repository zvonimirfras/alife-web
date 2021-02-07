import { World } from './world';
import {
	Mesh,
	Vector3
} from '@babylonjs/core';

export interface CreatureConfiguration {
	growthRate: number;
    maxAge: number;
	size: number;
	sensorSize: number;
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
	nearByCreatures: Creature[] = [];
	touchingCreatures: Creature[] = [];
	age = 0;
	reproductionTime = 0;
	paralyzationTimer = 0;
	// some defaults
	maxAge = 100;
	energy = 100;
	mutationRate = 0.0001;
	growthRate = 1;
	/**
	 * distance from the object sensor creature can "see" another nearby creature
	 */
	sensorSize = 1; // initialized with create

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
		// E = (mv^2)/2
		// v = at
		// F = ma
		// E = F^2 t^2 / (2m)
		this.energy -= force * force / 3600 / 2 / (this.body?.physicsImpostor?.mass || 1);
	}

	step() {
		this.grow();

		this.age += 1.0/30;
		this.reproductionTime += 1.0/30;
		
		if (this.isParalyzed()) {
			this.paralyzationTimer -= 1.0/30;
		}
		this.explore();
	}

	explore() {}

	isDead() {
		return this.energy <= 0 || this.age >= this.maxAge;
	}

	grow(growthRate?: number) {
		if (!growthRate) {
			growthRate = this.growthRate;
			growthRate = 1 + ( growthRate - 1 ) / ( (this.age > 1) ? Math.sqrt(this.age)/10 : 1 ); // reduce the decimal side of the growthRate
		}
    
		const oldMass = this.body?.physicsImpostor?.mass || 0;
		
		if(growthRate < 1 && oldMass < 1) {
			return;
		}

		const oldLinearVlocity = this.body?.physicsImpostor?.getLinearVelocity();
		const oldAngularVelocity = this.body?.physicsImpostor?.getAngularVelocity();
		if (this.body) {
			this.body.scaling.multiplyInPlace(new Vector3(growthRate, growthRate, growthRate));
			this.body.physicsImpostor?.forceUpdate();
			this.body.physicsImpostor?.setLinearVelocity(oldLinearVlocity || null);
			this.body.physicsImpostor?.setAngularVelocity(oldAngularVelocity || null);
		}
		
		this.energy -= 10 * ((this.body?.physicsImpostor?.mass || oldMass) - oldMass);
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
		this.sensorSize = creatureConfig.sensorSize;
	}

	destroy() {
		if (this.body) {
			this.world.scene.removeMesh(this.body);
			this.body.dispose();
			this.body = undefined;
		}
	}
};
