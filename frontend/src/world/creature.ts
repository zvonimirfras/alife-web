
import { World } from './world';
import {
	Color4,
	Mesh,
	Vector3,
	VertexBuffer
} from '@babylonjs/core';
import { Utils } from './utils';

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
	constructor(world: World, config: CreatureConfiguration, body?: Mesh) {
		this.world = world;
		this.body = body;
		this.create(config);
		this.init(config);
	}

	world: World;
	body: Mesh | undefined;
	nearByCreatures: Creature[] = [];
	touchingCreatures: Creature[] = [];
	age = 0;
	reproductionTime = 0;
	paralyzationTimer = 0;
	forwardVector = new Vector3(.707, 0, .707);
	// some defaults
	maxAge = 100;
	reproductionTimeThreshold = 0.3 * this.maxAge;
	energy = 100;
	mutationRate = 0.1;
	growthRate = 1;
	initialSize = 1;
	initialEnergy = 100;
	// TODO initialize these below somehow?
	maxForce = 0.5;
	maxTorque = 0.1;
	maxAngularSpeed = 5;
	maxSpeed = 5;

	/**
	 * distance from the object sensor creature can "see" another nearby creature
	 */
	sensorSize = 1; // initialized with create

	paralyze(time = 2) {
		this.paralyzationTimer = time;
	}

	isParalyzed() {
		return this.paralyzationTimer > 0;
	}

	energyPercentage() {
		return this.energy / this.initialEnergy;
	}

	canReproduce() {
		return this.reproductionTime > this.reproductionTimeThreshold
			&& this.energyPercentage() > 0.60
			&& !this.isParalyzed();
	}

	turn(torque: number) {
		if (this.isParalyzed() || !this.body || !this.body.physicsImpostor) {
			return;
		}

		const angularVelocity = this.body.physicsImpostor.getAngularVelocity()?.y || 0;

		if (
			(torque > 0 && angularVelocity >= this.maxAngularSpeed) ||
			(torque < 0 && angularVelocity <= -this.maxAngularSpeed)
		) {
			return;
		}

		this.body?.physicsImpostor?.applyImpulse(new Vector3(torque / 2, 0, 0), this.body?.getAbsolutePosition().add(new Vector3(0, 0, 1)));
		this.body?.physicsImpostor?.applyImpulse(new Vector3(-torque / 2, 0, 0), this.body?.getAbsolutePosition().add(new Vector3(0, 0, -1)));
	}

	creatureDirection() {
		return this.body?.getDirection(this.forwardVector).clone().normalize() || this.forwardVector;
	}

	absoluteCreatureAngle() {
		return Vector3.GetAngleBetweenVectors(this.creatureDirection(), this.forwardVector, new Vector3(0, 1, 0));
	}

	turnTo(angle: number) {
		if (this.isParalyzed() || !this.body || !this.body.physicsImpostor) {
			return;
		}
		
		const angularVelocity = this.body.physicsImpostor.getAngularVelocity()?.y || 0;
		const nextAngle = this.absoluteCreatureAngle() + angularVelocity / 15;
		let totalRotation = angle - nextAngle;
		
		// L = m v r
		const angularMomentum = this.body.physicsImpostor.mass * angularVelocity * this.initialSize * this.body.scaling.x;
		// I = L / w
		const rotationalInertia = angularMomentum / angularVelocity;
		const desiredAngularVelocity = totalRotation * 10;
		let torque = rotationalInertia * desiredAngularVelocity;

		// no infinite torque
		if (torque >= 0) {
			torque = torque > this.maxTorque ? this.maxTorque : torque
		} else {
			torque = torque < -this.maxTorque ? -this.maxTorque : torque
		}
		
		this.turn(torque);
	}

	getClosestVisible(creatureType: any): Creature | null {
		let closestCreature: Creature | null = null;
		let shortestDistance = -1;
		this.nearByCreatures.filter(creature => creature instanceof creatureType).forEach(creature => {
			if (!creature.body || !this.body) {
				return;
			}
			const distance = Vector3.Distance(creature.body.position, this.body.position);
			if (shortestDistance < 0 || distance < shortestDistance) {
				closestCreature = creature;
				shortestDistance = distance;
			}
		});

		return closestCreature;
	}

	go(force: number) {
		if (this.isParalyzed()) {
			return;
		}

		const direction = this.creatureDirection();

		const velocity = this.body?.physicsImpostor?.getLinearVelocity();
		const goAngle = Vector3.GetAngleBetweenVectors(direction, velocity || direction, new Vector3(0, 1, 0));
		
		if ((velocity?.length() || 0) >= this.maxSpeed && goAngle < Math.PI/2) {
			// can't go faster than max speed but can slow down if you go under the right angle
			return;
		}

		this.body?.physicsImpostor?.applyImpulse(direction.multiplyByFloats(force, force, force), this.body?.getAbsolutePosition());
		// E = (mv^2)/2
		// v = at
		// F = ma
		// E = F^2 t^2 / (2m)
		this.energy -= force * force / 900 / 2 / (this.body?.physicsImpostor?.mass || 1);
	}

	step() {
		this.grow();

		this.age += 1.0 / 30;
		this.reproductionTime += 1.0 / 30;

		// transparency shows the level of energy
		let alpha = this.energyPercentage();
		if  (alpha < 0) {
			alpha = 0;
		} else if (alpha > 1) {
			alpha = 1
		}

		if (this.body?.material) {
			this.body.material.alpha = alpha;
		}

		if (this.isParalyzed()) {
			this.paralyzationTimer -= 1.0 / 30;
		}
	}

	setFaceColor(faceIndex: number, color: Color4) {
		if (!this.body) {
			return;
		}
		const faceIndexT = 2 * Math.floor(faceIndex / 2);

		const indices = this.body.getIndices() || [];
		let colors = this.body.getVerticesData(VertexBuffer.ColorKind) || [];
		let vertex;
		for (let i = 0; i < 6; i++) {
			vertex = indices[3 * faceIndexT + i];
			colors[4 * vertex] = color.r;
			colors[4 * vertex + 1] = color.g;
			colors[4 * vertex + 2] = color.b;
			colors[4 * vertex + 3] = color.a;
		}
		this.body.setVerticesData(VertexBuffer.ColorKind, colors);
	}

	explore() { }

	isDead() {
		return this.energy <= 0 || this.age >= this.maxAge;
	}

	reproduce(other: Creature) {
		if (!this.body || !other.body) {
			return;
		}
		// new initial values
		const position = Utils.mutate(
			this.body.position.add(other.body.position).multiply(new Vector3(0.5, 0.5, 0.5)),
			this.initialSize * this.mutationRate
		);
		let size = (this.initialSize + other.initialSize) / 2;
		size = Utils.mutate(size, size * this.mutationRate);
		if (size < 0.01) size = 0.01;

		// create new creature
		let newCreature: Creature;

		// mix between parents + mutate
		const growthRateAverage = (this.growthRate + other.growthRate) / 2;
		const maxAgeAverage = (this.maxAge + other.maxAge) / 2;
		const sensorSizeAverage = (this.sensorSize + other.sensorSize) / 2;
		const reproductionTimeThresholdAverage = (this.reproductionTimeThreshold + other.reproductionTimeThreshold) / 2;
		const thisEnergy = this.energy > this.initialEnergy ? this.initialEnergy : this.energy;
		const otherEnergy = other.energy > other.initialEnergy ? other.initialEnergy : other.energy;
		const energyAverage = (thisEnergy + otherEnergy) / 2;
		const mutationRateAverage = (this.mutationRate + other.mutationRate) / 2;

		const config: CreatureConfiguration = {
			growthRate: Utils.mutate(growthRateAverage, growthRateAverage * Math.pow(this.mutationRate, 10)),
			maxAge: Utils.mutate(maxAgeAverage, maxAgeAverage * this.mutationRate),
			size,
			sensorSize: Utils.mutate(sensorSizeAverage, sensorSizeAverage * this.mutationRate),
			energy: Utils.mutate(energyAverage, energyAverage * this.mutationRate),
			mutationRate: Utils.mutate(mutationRateAverage, mutationRateAverage * this.mutationRate),
			position
		};

		newCreature = this.createChild(this.world, config);
		// energy conservation
		newCreature.energy = energyAverage;
		this.energy /= 2;
		other.energy /= 2;

		newCreature.reproductionTimeThreshold = Utils.mutate(reproductionTimeThresholdAverage, reproductionTimeThresholdAverage * this.mutationRate) as number;

		// reset reproduction
		this.reproductionTime = 0;
		other.reproductionTime = 0;
	}

	grow(growthRate?: number) {
		if (!growthRate) {
			growthRate = this.growthRate;
			growthRate = 1 + (growthRate - 1) / ((this.age > 1) ? Math.sqrt(this.age) / 10 : 1); // reduce the decimal side of the growthRate
		}

		const oldMass = this.body?.physicsImpostor?.mass || 0;

		if (growthRate <= 0 && oldMass <= 0) {
			return;
		}

		const oldLinearVlocity = this.body?.physicsImpostor?.getLinearVelocity();
		const oldAngularVelocity = this.body?.physicsImpostor?.getAngularVelocity();
		if (this.body) {
			this.body.scaling.multiplyInPlace(new Vector3(growthRate, growthRate, growthRate));
			this.body.physicsImpostor?.setMass(oldMass * growthRate); // TODO needs better mass formula (based on density and volume)
			this.body.physicsImpostor?.forceUpdate();
			this.body.physicsImpostor?.setLinearVelocity(oldLinearVlocity || null);
			this.body.physicsImpostor?.setAngularVelocity(oldAngularVelocity || null);
		}

		this.energy -= 10 * ((this.body?.physicsImpostor?.mass || oldMass) - oldMass);
	}

	shrink(shrinkRate?: number) {
		if (!shrinkRate) {
			shrinkRate = Math.pow(2 - this.growthRate, 2);
		}
		this.grow(shrinkRate);
	}

	takeEnergy(taker: Creature) {
		const v = taker.body?.physicsImpostor?.getLinearVelocity() || new Vector3();
		const guaranteedEnergy = 0.1 * taker.initialEnergy; // 10% initial energy just by touching
		const e = (taker.body?.physicsImpostor?.mass || 0) * v.length() + guaranteedEnergy;
		this.energy -= e;
		taker.energy += e;
	}

	create(creatureConfig: CreatureConfiguration) {
		console.log('You need to implement `create()` function when you subclass.');
	}

	/**
	 * returns a new instance of the current creature (`this`)
	 */
	createChild(world: World, config: CreatureConfiguration, body?: Mesh) {
		console.log('You need to implement `createChild()` function when you subclass.');
		return new Creature(world, config, body);
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
		this.initialSize = creatureConfig.size;
		this.initialEnergy = creatureConfig.energy;
		this.growthRate = creatureConfig.growthRate;
		this.reproductionTimeThreshold = 0.3 * this.maxAge;
	}

	destroy() {
		if (this.body) {
			this.world.scene.removeMesh(this.body);
			this.body.dispose();
			this.body = undefined;
		}
		this.world.population.splice(this.world.population.indexOf(this), 1)
	}
};
