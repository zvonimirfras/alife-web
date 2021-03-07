import {
	ArcRotateCamera,
	Vector3
} from '@babylonjs/core';
import React, { useEffect, useState } from 'react';
import {
	Menu32,
	Play32,
	Pause32,
	Help32,
	Help16
} from '@carbon/icons-react';

import './App.scss';
import { Controls } from './Controls';
import { SceneComponent } from './SceneComponent';
import { Button, Checkbox, Modal } from 'carbon-components-react';
import { World } from './world/world';
import { StatisticsView } from './StatisticsView';

let world: {current: World | undefined} = { current: undefined };

const onSceneReady = (scene: any) => {
	// This creates and positions a free camera (non-mesh)
	const camera = new ArcRotateCamera('camera1', 0, 1, 25, new Vector3(0, 0, 0), scene);
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
	const [shouldShowModal, setShouldShowModal] = useState(false);
	const [shouldHideHelpModalAtStart, setShouldHideHelpModalAtStart] = useState(false);

	const toggleMenu = () => {
		setIsMenuOpen(!isMenuOpen);
		setTimeout(() => setShouldSceneResize(true), 150); // after the animation
	};

	useEffect(() => {
		const hideHelpModalAtStart = JSON.parse(localStorage.getItem('hideHelpModalAtStart') || 'false');
		setShouldHideHelpModalAtStart(hideHelpModalAtStart);
		setShouldShowModal(!hideHelpModalAtStart);
	}, []);

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
				className={`help-button${!isMenuOpen ? ' menu-hidden' : ''}`}
				kind='ghost'
				renderIcon={Help32}
				iconDescription='Help'
				hasIconOnly
				onClick={() => setShouldShowModal(true)} />
			<Button
				className='menu-button'
				kind='secondary'
				renderIcon={Menu32}
				iconDescription='Menu'
				hasIconOnly
				onClick={toggleMenu} />
			<Modal
			open={shouldShowModal}
			passiveModal
			onRequestClose={() => setShouldShowModal(false)}
			className='hello-modal'
			modalHeading="Welcome to the simulation!">
				<p>
					ALife simulation enables you to experiment with starting parameters of the artificial world and see how
					they influence development of its inhabitants and the stability of the system.
				</p>
				<p>
					Initial parameters for a cohort (Plants, Herbivores, or Predators) are randomized around the values you
					put in the boxes. Spread depends on the mutation rate. This makes a more natural, diverse, world to start with.
				</p>
				<p>
					Their decision making is entirely instinctual and pre-coded. Behaviour changes with the environment they are
					in and their immediate surroundings. They inherit their parents' genetics with mutation rate dependant on the
					mutation rate.
				</p>
				<h4>Plants</h4>
				<p>
					Plants provide source of energy into the world. They grow with time and increase the energy with their size.
					When eaten, they decrease in size and energy transfers to the inhabitant that ate it.
					They periodically try to reproduce.
				</p>
				<h4>Herbivores</h4>
				<p>
					Herbivores consume plants for energy and will go after them if they are low on energy. They use energy to
					move around and to reproduce.
					If there are predators near by, they try to run away. If they are capable, they look for a partner and try
					to reproduce.
				</p>
				<h4>Predators</h4>
				<p>
					Predators chase and consume herbivores for energy. When they catch a herbivore, they stun them and make them
					paralized for a little while. That helps them feed. They use energy to
					move around and to reproduce. If they are capable, they look for a partner and try
					to reproduce.
				</p>
				<em>
					Press <Help16 /> on the top-right to show this modal again.
				</em>
				<Checkbox
					id='show-at-start'
					labelText='Show at start'
					className='show-at-start-checkbox'
					onChange={(checked) => {
						setShouldHideHelpModalAtStart(!checked);
						localStorage.setItem('hideHelpModalAtStart', JSON.stringify(!checked));
					}}
					checked={!shouldHideHelpModalAtStart} />
			</Modal>
		</div>
	);
}

export default App;
