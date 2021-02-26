import { Vector3 } from '@babylonjs/core';
import { Herbivore } from './herbivore';
import { World } from './world';
import { Creature, CreatureConfiguration } from './creature';
import {
	Color4,
	Mesh,
	MeshBuilder,
	PhysicsImpostor
} from '@babylonjs/core';

export class Predator extends Creature {
	create(creatureConfig: CreatureConfiguration) {
		const faceColors: Color4[] = [];
		faceColors[4] = new Color4(1, 0, 0, 0);
		this.body = MeshBuilder.CreateBox(
			"predator",
			{
				width: creatureConfig.size,
				height: 0.1,
				depth: creatureConfig.size,
				faceColors
			},
			this.world.scene
		);
		this.body.position.y = 0.1;
		this.body.rotation.y = Math.random() * 2 * Math.PI;
		this.body.physicsImpostor = new PhysicsImpostor(
			this.body,
			PhysicsImpostor.BoxImpostor,
			{
				mass: creatureConfig.size,
				restitution: 0.9,
				friction: 0.05
			},
			this.world.scene
		);
		
		this.world.addCreature(this);
	}

	createChild(world: World, config: CreatureConfiguration, body?: Mesh) {
		return new Predator(world, config, body);
	}

	explore() {
		const torque = 1 * (this.body?.physicsImpostor?.mass || 0);

		if (Math.random() < 0.1 ) // 1 in 10 chance
		{
			this.turn(Math.random() > 0.5 ? torque : -torque);
		}
		if (Math.random() < 0.1) {
			this.go(1);
		}
	}

	step() {
		super.step();

		let busy = false;

		// someone's nearby
		if (this.nearByCreatures.length) {
			// if energy low, check if herbivores nearby
			if (this.energyPercentage() < 0.50) {
				if (this.nearByCreatures.some(creature => creature instanceof Herbivore)) {
					busy = true;
					// go eat
					const fromTarget = this.getClosestVisible(Herbivore)?.body?.position.subtract(this.body?.position || new Vector3());
					const desiredAngle = fromTarget ? Math.atan2(fromTarget.y, fromTarget.x) : 0;
					this.turnTo(desiredAngle);
					this.go(1);
				}
			}
			
			// if all is well, look for predatores to reproduce with
			if (this.canReproduce()) {
				if (this.nearByCreatures.some(creature => creature instanceof Predator)) {
					busy = true;
					// go eat
					const fromTarget = this.getClosestVisible(Predator)?.body?.position.subtract(this.body?.position || new Vector3());
					const desiredAngle = fromTarget ? Math.atan2(fromTarget.y, fromTarget.x) : 0;
					this.turnTo(desiredAngle);
					this.go(1);
				}
			}
		}

		// touchy feely
		this.touchingCreatures.forEach(creature => {
			if (creature instanceof Predator) {
				// check for reproduction ability
				if (this.canReproduce() && creature.canReproduce()) {
					busy = true;
					this.reproduce(creature);
				}
			}
			
			if (creature instanceof Herbivore) {
				// eat
				if (this.energyPercentage() < 1.2) {
					busy = true;
					creature.paralyze();
					creature.shrink();
					creature.takeEnergy(this);
				}
			}
		});

		if( !busy )
		{
			this.explore();
		}
	}
};
