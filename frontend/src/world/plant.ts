import { Creature, CreatureConfiguration } from './creature';
import {
	Color4,
	MeshBuilder,
	PhysicsImpostor
} from '@babylonjs/core';

export class Plant extends Creature {
	create(creatureConfig: CreatureConfiguration) {
		const faceColors: Color4[] = [];
		faceColors[2] = new Color4(0, 1, 0, 0);
		this.body = MeshBuilder.CreateCylinder("cylinder", { height: 0.1, diameter: 1, faceColors }, this.world.scene);
		this.body.position.y = 0.1;
		this.body.physicsImpostor = new PhysicsImpostor(this.body, PhysicsImpostor.CylinderImpostor, { mass: 1, restitution: 0.9 }, this.world.scene);
		
		this.world.addCreature(this);
	}
};
