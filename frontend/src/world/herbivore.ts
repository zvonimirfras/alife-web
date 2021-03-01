import { Plant } from './plant';
import { Predator } from './predator';
import { World } from './world';
import { Creature, CreatureConfiguration } from './creature';
import {
	Color3,
	Color4,
	Mesh,
	MeshBuilder,
	PhysicsImpostor,
	StandardMaterial,
	Vector3
} from '@babylonjs/core';

export class Herbivore extends Creature {
	create(creatureConfig: CreatureConfiguration) {
		const faceColors: Color4[] = [];
		faceColors[4] = new Color4(0, 0, 1, 0);
		this.body = MeshBuilder.CreateBox(
			"herbivore",
			{
				width: creatureConfig.size,
				height: 0.1,
				depth: creatureConfig.size,
				faceColors
			},
			this.world.scene
		);
		this.body.material = new StandardMaterial('herbivore', this.world.scene);
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
		return new Herbivore(world, config, body);
	}

	explore() {
		if (this.isParalyzed()) {
			return;
		}
		const torque = 1 * (this.body?.physicsImpostor?.mass || 0);
	
		if (Math.random() < 0.1 ) // 1 in 10 chance
		{
			this.turn(Math.random() > 0.5 ? torque : -torque);
		}
		if (Math.random() < 0.1) {
			this.go(5);
		}
	}

	updateParalyzedColors(paralyzed = true) {
		if (paralyzed) {
			const color = new Color4(1, 0, 1)
			this.setFaceColor(0, color);
			this.setFaceColor(1, color);
			this.setFaceColor(2, color);
			this.setFaceColor(3, color);
			this.setFaceColor(4, color);
			this.setFaceColor(5, color);
			this.setFaceColor(6, color);
			this.setFaceColor(7, color);
		} else {
			const color = Color4.FromColor3(Color3.Gray());
			this.setFaceColor(0, color);
			this.setFaceColor(1, color);
			this.setFaceColor(2, color);
			this.setFaceColor(3, color);
			this.setFaceColor(4, color);
			this.setFaceColor(5, color);
			this.setFaceColor(6, color);
			this.setFaceColor(7, color);
		}
	}

	step() {
		super.step();
		let busy = false;
		if (this.isParalyzed()) {
			this.updateParalyzedColors();
			return;
		} else {
			this.updateParalyzedColors(false); // TODO find a way to not have to run this every step
		}

		// someone's nearby
		if (this.nearByCreatures.length) {
			if (this.nearByCreatures.some(creature => creature instanceof Predator)) {
				busy = true;
				// run for your life
				// where to run
				const fromTarget = this.body?.position.subtract(this.getClosestVisible(Predator)?.body?.position || new Vector3());
				const desiredAngle = fromTarget ? Math.atan2(fromTarget.y, fromTarget.x) : 0;
				this.turnTo(desiredAngle);
				this.go(1);
			}
		
			// if energy low, check if plants nearby
			if (this.energyPercentage() < 0.50) {
				if (this.nearByCreatures.some(creature => creature instanceof Plant)) {
					busy = true;
					// go eat
					const fromTarget = this.getClosestVisible(Plant)?.body?.position.subtract(this.body?.position || new Vector3());
					const desiredAngle = fromTarget ? Math.atan2(fromTarget.y, fromTarget.x) : 0;
					this.turnTo(desiredAngle);
					this.go(1);
				}
			}
			
			// if all is well, look for herbivores to reproduce with
			if (this.canReproduce()) {
				if (this.nearByCreatures.some(creature => creature instanceof Herbivore)) {
					busy = true;
					// go eat
					const fromTarget = this.getClosestVisible(Herbivore)?.body?.position.subtract(this.body?.position || new Vector3());
					const desiredAngle = fromTarget ? Math.atan2(fromTarget.y, fromTarget.x) : 0;
					this.turnTo(desiredAngle);
					this.go(1);
				}
			}
		}
		
		
		// touchy feely
		this.touchingCreatures.forEach(creature => {
			if (creature instanceof Herbivore) {
				// check for reproduction ability
				if (this.canReproduce() && creature.canReproduce()) {
					busy = true;
					this.reproduce(creature);
				}
			}
			
			if (creature instanceof Plant) {
				// eat
				if (this.energyPercentage() < 2) {
					busy = true;
					creature.shrink( 0.98 );
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
