import { World } from './world';
import { Creature } from './creature';
import {
	Color4,
	Mesh,
	MeshBuilder,
	PhysicsImpostor
} from '@babylonjs/core';

export class Herbivore extends Creature {
	constructor(world: World, body?: Mesh) {
		super(world, body);

		if (!body) {
			this.create();
		}
	}

	create() {
		const faceColors: Color4[] = [];
		faceColors[4] = new Color4(0, 0, 1, 0);
		this.body = MeshBuilder.CreateBox("box", { width: 2, height: 0.1, depth: 2, faceColors }, this.world.scene);
		this.body.position.y = 0.1;
		this.body.physicsImpostor = new PhysicsImpostor(this.body, PhysicsImpostor.BoxImpostor, { mass: 1, restitution: 0.9 }, this.world.scene);
		
		this.world.addCreature(this);
	}

	explore() {
		const torque = 1 * (this.body?.physicsImpostor?.mass || 0);
	
		console.log("explore")
		if (Math.random() < 0.1 ) // 1 in 10 chance
		{
			this.turn(Math.random() > 0.5 ? torque : -torque);
			this.go(1);
		}
	}
};
