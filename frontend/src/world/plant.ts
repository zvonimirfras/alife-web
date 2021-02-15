import { World } from './world';
import { Creature, CreatureConfiguration } from './creature';
import {
	Color4,
	Mesh,
	MeshBuilder,
	PhysicsImpostor
} from '@babylonjs/core';

export class Plant extends Creature {
	initalMass = 0;

	create(creatureConfig: CreatureConfiguration) {
		const faceColors: Color4[] = [];
		faceColors[2] = new Color4(0, 1, 0, 0);
		this.body = MeshBuilder.CreateCylinder("cylinder", { height: 0.1, diameter: creatureConfig.size, faceColors }, this.world.scene);
		this.body.position.y = 0.1;
		this.body.physicsImpostor = new PhysicsImpostor(this.body, PhysicsImpostor.CylinderImpostor, { mass: 1, restitution: 0.9 }, this.world.scene);
		this.initalMass = this.body.physicsImpostor.mass;

		this.world.addCreature(this);
	}

	createChild(world: World, config: CreatureConfiguration, body?: Mesh) {
		return new Plant(world, config, body);
	}

	updateEnergy() {
		this.energy = (this.body?.physicsImpostor?.mass || 0) / this.initalMass * this.initialEnergy;
	}

	step() {
		super.step();

		this.updateEnergy();

		// reproduction
		if (this.canReproduce()) {
			if (Math.random() > this.mutationRate) {
				// not every seed succeeds
				this.reproduce(this);
			} else {
				this.reproductionTime = 0;
			}
		}
	}
};
