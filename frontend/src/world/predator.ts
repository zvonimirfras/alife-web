import { Creature, CreatureConfiguration } from './creature';
import {
	Color4,
	MeshBuilder,
	PhysicsImpostor
} from '@babylonjs/core';

export class Predator extends Creature {
	create(creatureConfig: CreatureConfiguration) {
		const faceColors: Color4[] = [];
		faceColors[4] = new Color4(1, 0, 0, 0);
		this.body = MeshBuilder.CreateBox("box", { width: creatureConfig.size, height: 0.1, depth: creatureConfig.size, faceColors }, this.world.scene);
		this.body.position.y = 0.1;
		this.body.physicsImpostor = new PhysicsImpostor(this.body, PhysicsImpostor.BoxImpostor, { mass: 1, restitution: 0.9, friction: 0.05 }, this.world.scene);

		this.init(creatureConfig);
		
		this.world.addCreature(this);
	}

	explore() {
		const torque = 1 * (this.body?.physicsImpostor?.mass || 0);
	
		console.log("explore")
		if (Math.random() < 0.1 ) // 1 in 10 chance
		{
			this.turn(Math.random() > 0.5 ? torque : -torque);
		}
		if (Math.random() < 0.1) {
			this.go(1);
		}
	}
};
