import {
	Color4,
	ParticleSystem,
	Scene,
	Texture,
	Vector3
} from "@babylonjs/core";

export const getSameTouchParticleSystem = (position: Vector3, scene: Scene) => {
	var particleSystem = new ParticleSystem("particles", 2000, scene);

	//Texture of each particle
	particleSystem.particleTexture = new Texture("textures/flare.png", scene);

	// Where the particles come from
	particleSystem.emitter = position; // the starting location

	// Colors of all particles
	particleSystem.color1 = new Color4(0.7, 0.8, 1.0, 1.0);
	particleSystem.color2 = new Color4(0.2, 0.5, 1.0, 1.0);
	particleSystem.colorDead = new Color4(0, 0, 0.2, 0.0);

	// Size of each particle (random between...
	particleSystem.minSize = 0.05;
	particleSystem.maxSize = 0.15;

	// Life time of each particle (random between...
	particleSystem.minLifeTime = 0.3;
	particleSystem.maxLifeTime = 1;

	// Emission rate
	particleSystem.emitRate = 1000;


	/******* Emission Space ********/
	particleSystem.createSphereEmitter(0.5);

	// Speed
	particleSystem.minEmitPower = 1;
	particleSystem.maxEmitPower = 3;
	particleSystem.updateSpeed = 0.005;

	particleSystem.updateFunction = function (particles) {
		for (var index = 0; index < particles.length; index++) {
			var particle = particles[index];
			particle.age += (this as any)._scaledUpdateSpeed;

			if (particle.age >= particle.lifeTime) { // Recycle
				particles.splice(index, 1);
				(this as any)._stockParticles.push(particle);
				index--;
				continue;
			}
			else {
				particle.colorStep.scaleToRef((this as any)._scaledUpdateSpeed, (this as any)._scaledColorStep);
				particle.color.addInPlace((this as any)._scaledColorStep);
				particle.color = new Color4(Math.random(), Math.random(), Math.random(), 1)

				if (particle.color.a < 0) {
					particle.color.a = 0;
				}

				particle.angle += particle.angularSpeed * (this as any)._scaledUpdateSpeed;

				particle.direction.scaleToRef((this as any)._scaledUpdateSpeed, (this as any)._scaledDirection);
				particle.position.addInPlace((this as any)._scaledDirection);

				this.gravity.scaleToRef((this as any)._scaledUpdateSpeed, (this as any)._scaledGravity);
				particle.direction.addInPlace((this as any)._scaledGravity);
			}
		}
	}

	return particleSystem;
};

export const runSameTouchParticleSystem = (position: Vector3, scene: Scene) => {
	const particleSystem = getSameTouchParticleSystem(position, scene);
	// Start the particle system
	particleSystem.start();
	particleSystem.disposeOnStop = true;
	setTimeout(() => particleSystem.stop(), 100);
};
