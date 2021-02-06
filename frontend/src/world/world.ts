import { Creature } from './creature';
import {
	Color3,
	DirectionalLight,
	Mesh,
	MeshBuilder,
	PhysicsImpostor,
	PhysicsImpostorParameters,
	Scene,
	ShadowGenerator,
	StandardMaterial,
	Vector2,
	Vector3
} from '@babylonjs/core';

export class World {
	scene: Scene;
	population: Creature[] = [];
	ground: Mesh | null = null;
	walls: Mesh[] = [];
	size = new Vector2(0, 0);

	constructor(scene: Scene) {
		this.scene = scene;

		// This creates a light, aiming 0,1,0 - to the sky (non-mesh)
		const light = new DirectionalLight("dir01", new Vector3(-1, -2, -1), this.scene);
		light.position = new Vector3(20, 40, 20);
		// Default intensity is 1. Let's dim the light a small amount
		light.intensity = 0.7;

		const shadowGenerator = new ShadowGenerator(1024, light);
		// shadowGenerator.getShadowMap()?.renderList?.push(box);
		shadowGenerator.useBlurExponentialShadowMap = true;
		shadowGenerator.useKernelBlur = true;
		shadowGenerator.blurKernel = 64;
	}
	
	addCreature(creature: Creature) {
		this.population.push(creature);
	}

	clearInhabitants() {
		for (let i = 0; i < this.population.length; i++) {
			const creature = this.population[i];
			creature.destroy();
		}
		this.population = [];
	}

	createBorder(size: Vector2) {
		this.size = size.clone();
		// Our built-in 'ground' shape.
		if (this.ground) {
			this.scene.removeMesh(this.ground);
			this.ground.dispose();
			this.ground = null
		}

		if (this.walls.length) {
			this.walls.forEach(wall => {
				this.scene.removeMesh(wall);
				wall.dispose();
			});
			this.walls = [];
		}

		const wallThickness = 1;
		const groundImposterOptions: PhysicsImpostorParameters = { mass: 0, friction: 0.01, restitution: 0 };
		const wallImposterOptions: PhysicsImpostorParameters = { mass: 0, friction: 0.01, restitution: 0.5 };

		this.ground = MeshBuilder.CreateBox("ground", { width: size.x, height: wallThickness, depth: size.y }, this.scene);
		this.ground.position = new Vector3(0, -wallThickness, 0);
		
		this.ground.physicsImpostor = new PhysicsImpostor(this.ground, PhysicsImpostor.BoxImpostor, groundImposterOptions, this.scene);

		const wallHeight = 5;

		const wallY = (wallHeight - wallThickness)/2 - wallThickness;
		const wallMaterial = new StandardMaterial('wallMaterial', this.scene);
		wallMaterial.diffuseColor = Color3.Gray();
		wallMaterial.emissiveColor = new Color3(0.1, 0.1, 0.1);
		wallMaterial.alpha = 0.5;

		const newWallImposter = () => new PhysicsImpostor(wall, PhysicsImpostor.BoxImpostor, wallImposterOptions, this.scene);

		let wall = MeshBuilder.CreateBox("wall1", { width: size.x, height: wallHeight, depth: wallThickness }, this.scene);
		wall.position = new Vector3(0, wallY, (-size.y - wallThickness)/2);
		wall.physicsImpostor = newWallImposter();
		wall.material = wallMaterial;
		this.walls.push(wall);

		wall = MeshBuilder.CreateBox("wall2", { width: size.x, height: wallHeight, depth: wallThickness }, this.scene);
		wall.position = new Vector3(0, wallY, (size.y - wallThickness)/2);
		wall.physicsImpostor = newWallImposter();
		wall.material = wallMaterial;
		this.walls.push(wall);

		wall = MeshBuilder.CreateBox("wall3", { width: wallThickness, height: wallHeight, depth: size.y }, this.scene);
		wall.position = new Vector3((size.x - wallThickness)/2, wallY, 0);
		wall.physicsImpostor = newWallImposter();
		wall.material = wallMaterial;
		this.walls.push(wall);

		wall = MeshBuilder.CreateBox("wall4", { width: wallThickness, height: wallHeight, depth: size.y }, this.scene);
		wall.position = new Vector3((-size.x + wallThickness)/2, wallY, 0);
		wall.physicsImpostor = newWallImposter();
		wall.material = wallMaterial;
		this.walls.push(wall);

		this.ground.receiveShadows = true;
	}

	updateNearBy() {
		for (let i = 0; i < this.population.length; i++) {
			const creature = this.population[i];
			creature.nearByCreatures = [];
			creature.touchingCreatures = [];
		}

		for (let i = 0; i < this.population.length; i++) {
			const creature = this.population[i];
			for (let j = i + 1; j < this.population.length; j++) {
				const creature2 = this.population[j];
				const distance = Vector3.Distance(creature.body?.position || new Vector3(), creature2.body?.position || new Vector3());
				
				// nearby
				if (distance < creature.sensorSize) {
					creature.nearByCreatures.push(creature2);
				}

				if (distance < creature2.sensorSize) {
					creature2.nearByCreatures.push(creature);
				}

				// touching
				if (creature2.body &&creature.body?.intersectsMesh(creature2.body)) {
					creature.touchingCreatures.push(creature2);
					creature2.touchingCreatures.push(creature);
				}
			}
		}
	}

	step() {
		this.population.forEach(creature => {
			this.updateNearBy();
			creature.step();

			if (creature.isDead()) {
				// TODO remove from population etc
			}
		});
	}
};
