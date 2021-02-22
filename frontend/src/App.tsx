import {
	ArcRotateCamera,
	Vector3
} from '@babylonjs/core';
import React, { useEffect, useState } from 'react';
import { Menu32, Play32, Pause32 } from '@carbon/icons-react';

import './App.scss';
import { Controls } from './Controls';
import { SceneComponent } from './SceneComponent';
import { Button } from 'carbon-components-react';
import { World } from './world/world';
import { StatisticsView } from './StatisticsView';

let world: {current: World | undefined} = { current: undefined };

const onSceneReady = (scene: any) => {
	// This creates and positions a free camera (non-mesh)
	const camera = new ArcRotateCamera('camera1', 0, 1, 15, new Vector3(0, 0, 0), scene);
	camera.maxZ = 150;

	const canvas = scene.getEngine().getRenderingCanvas();
	world.current = new World(scene);

	// This attaches the camera to the canvas
	camera.attachControl(canvas, true);
}

const onRender = (scene: any) => {
	// if (box !== undefined) {
		// const deltaTimeInMillis = scene.getEngine().getDeltaTime();
		// const rpm = 10;
		// box.rotation.y += ((rpm / 60) * Math.PI * 2 * (deltaTimeInMillis / 1000));
	// }
	if (world.current) {
		world.current.step();
	}
}

function App() {
	const [isMenuOpen, setIsMenuOpen] = useState(true);
	const [shouldSceneResize, setShouldSceneResize] = useState(false);
	const [shouldRunSimulation, setShouldRunSimulation] = useState(true);

	const toggleMenu = () => {
		setIsMenuOpen(!isMenuOpen);
		setTimeout(() => setShouldSceneResize(true), 150); // after the animation
	};

	useEffect(() => {
		if (!world.current) {
			return;
		}
		world.current.shouldRunSimulation = !!shouldRunSimulation;
	}, [shouldRunSimulation]);

	return (
		<div className='app'>
			<SceneComponent
				className={'scene ' + (!isMenuOpen ? 'expand-scene' : '')}
				antialias
				onSceneReady={onSceneReady}
				onRender={onRender}
				shouldResize={shouldSceneResize}
				setShouldResize={setShouldSceneResize}
				shouldRunSimulation={shouldRunSimulation}
				id='my-canvas' />
			<button
			className='run-button'
			onClick={() => setShouldRunSimulation(!shouldRunSimulation)}>
				{shouldRunSimulation ? <Pause32 /> : <Play32 />}
			</button>
			<div className={isMenuOpen ? '' : 'hide-content'}>
				<Controls
					className={'side-pane ' + (isMenuOpen ? 'menu-open' : '')}
					world={world} />
			</div>
			<StatisticsView
				className={'scene ' + (!isMenuOpen ? 'expand-scene' : '')}
				world={world} />
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
