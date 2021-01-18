import {
	FreeCamera,
	HemisphericLight,
	Mesh,
	MeshBuilder,
	PhysicsImpostor,
	Vector3
} from '@babylonjs/core';
import React, { useState } from 'react';
import { Menu32 } from '@carbon/icons-react';

import './App.scss';
import { Controls } from './Controls';
import { SceneComponent } from './SceneComponent';
import { Button } from 'carbon-components-react';

let box: Mesh;

const onSceneReady = (scene: any) => {
	// This creates and positions a free camera (non-mesh)
	const camera = new FreeCamera("camera1", new Vector3(0, 5, -10), scene);
	// This targets the camera to scene origin
	camera.setTarget(Vector3.Zero());
	const canvas = scene.getEngine().getRenderingCanvas();
	// This attaches the camera to the canvas
	camera.attachControl(canvas, true);
	// This creates a light, aiming 0,1,0 - to the sky (non-mesh)
	const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
	// Default intensity is 1. Let's dim the light a small amount
	light.intensity = 0.7;
	// Our built-in 'box' shape.
	box = MeshBuilder.CreateBox("box", { size: 2 }, scene);
	// Move the box upward 1/2 its height
	box.position.y = 2;
	// Our built-in 'ground' shape.
	const ground = MeshBuilder.CreateGround("ground", { width: 6, height: 6 }, scene);

	box.physicsImpostor = new PhysicsImpostor(box, PhysicsImpostor.BoxImpostor, { mass: 1, restitution: 0.9 }, scene);
	ground.physicsImpostor = new PhysicsImpostor(ground, PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.9 }, scene);
}

const onRender = (scene: any) => {
	if (box !== undefined) {
		// const deltaTimeInMillis = scene.getEngine().getDeltaTime();
		// const rpm = 10;
		// box.rotation.y += ((rpm / 60) * Math.PI * 2 * (deltaTimeInMillis / 1000));
	}
}

function App() {
	const [isMenuOpen, setIsMenuOpen] = useState(true);
	const [shouldSceneResize, setShouldSceneResize] = useState(false);
	
	const toggleMenu = () => {
		setIsMenuOpen(!isMenuOpen);
		setTimeout(() => setShouldSceneResize(true), 150); // after the animation
	};

	return (
		<div className='app'>
			<SceneComponent
				className={'scene ' + (!isMenuOpen ? 'expand-scene' : '')}
				antialias
				onSceneReady={onSceneReady}
				onRender={onRender}
				shouldResize={shouldSceneResize}
				setShouldResize={setShouldSceneResize}
				id='my-canvas' />
			<Controls className={'side-pane ' + (isMenuOpen ? 'menu-open' : '')} />
			<Button
				className='menu-button'
				kind='secondary'
				renderIcon={Menu32}
				iconDescription='Menu'
				hasIconOnly
				onClick={toggleMenu} />
		</div>
	);
}

export default App;
