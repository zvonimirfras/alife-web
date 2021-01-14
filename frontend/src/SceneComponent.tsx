import { Engine, Scene } from '@babylonjs/core';
import React, { useEffect, useRef } from 'react';

export const SceneComponent = (props: any) => {
	const reactCanvas = useRef(null);
	const {
		antialias,
		engineOptions,
		adaptToDeviceRatio,
		sceneOptions,
		onRender,
		onSceneReady,
		shouldResize,
		setShouldResize,
		...rest
	} = props;

	const engine: React.MutableRefObject<Engine | null> = useRef<Engine>(null);
	const scene: React.MutableRefObject<Scene | null> = useRef<Scene>(null);

	const resize = () => {
		if (scene.current) {
			scene.current.getEngine().resize();
		}
	}

	useEffect(() => {
		if (reactCanvas.current) {
			engine.current = new Engine(reactCanvas.current, antialias, engineOptions, adaptToDeviceRatio);
			scene.current = new Scene(engine.current, sceneOptions);
			if (scene.current.isReady()) {
				onSceneReady(scene.current)
			} else {
				scene.current.onReadyObservable.addOnce(scene => onSceneReady(scene));
			}
			engine.current.runRenderLoop(() => {
				if (typeof onRender === 'function') {
					onRender(scene.current);
				}
				if (scene.current) {
					scene.current.render();
				}
			})
			if (window) {
				window.addEventListener('resize', resize);
			}
			return () => {
				if (scene.current) {
					scene.current.getEngine().dispose();
				}
				if (window) {
					window.removeEventListener('resize', resize);
				}
			}
		}
	}, [
		adaptToDeviceRatio,
		antialias,
		engineOptions,
		onRender,
		onSceneReady,
		reactCanvas,
		sceneOptions
	]);

	useEffect(() => {
		if (shouldResize) {
			resize();
			setShouldResize(false);
		}
	}, [shouldResize, setShouldResize]);
	return (
		<canvas ref={reactCanvas} {...rest} />
	);
}