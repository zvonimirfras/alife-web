
import React, { useEffect, useState } from 'react';
import {
	Button,
	NumberInput,
	Tabs,
	Tab
} from 'carbon-components-react';
import { Vector2 } from '@babylonjs/core';

import './Controls.scss';
import { Herbivore } from './world/herbivore';
import { Plant } from './world/plant';
import { Predator } from './world/predator';
import { CreatureConfiguration } from './world/creature';
import { Utils } from './world/utils';

const randomPosition = (worldSize: Vector2, creatureSize: number) => {
	return new Vector2(
		Math.random() * (worldSize.x - 2 * creatureSize) - (worldSize.x - 2 * creatureSize) / 2,
		Math.random() * (worldSize.y - 2 * creatureSize) - (worldSize.y - 2 * creatureSize) / 2
	);
};

export const InhabitantSettings = ({
	type,
	world,
	config,
	setConfig
}: any) => {
	const create = () => {
		for (let i = 0; i < config.count; i++) {
			const mutatedConfig = Utils.mutate(config, config.mutationRate);
			mutatedConfig.growthRate = config.growthRate;

			switch (type) {
				case 'plant': {
					new Plant(world.current, {
						...mutatedConfig,
						position: randomPosition(world.current.size, config.size)
					} as CreatureConfiguration);
					break;
				}

				case 'herbivore': {
					new Herbivore(world.current, {
						...mutatedConfig,
						sensorSize: config.size * 7,
						position: randomPosition(world.current.size, config.size)
					} as CreatureConfiguration);
					break;
				}

				case 'predator': {
					new Predator(world.current, {
						...mutatedConfig,
						sensorSize: config.size * 15,
						position: randomPosition(world.current.size, config.size)
					} as CreatureConfiguration);
					break;
				}
			
				default:
					break;
			}
		}
	};

	return <div>
		<NumberInput
			id={`${type}-inhabitant-settings-count`}
			value={config?.count}
			min={1}
			onChange={(event: any) => setConfig({ ...config, count: Number(event.imaginaryTarget.value)})}
			label='Count'/>
		<NumberInput
			id={`${type}-inhabitant-settings-size`}
			value={config?.size}
			min={0}
			onChange={(event: any) => setConfig({ ...config, size: Number(event.imaginaryTarget.value)})}
			label='Size'/>
		<NumberInput
			id={`${type}-inhabitant-settings-growth-rate`}
			value={config?.growthRate}
			min={0}
			step={0.00001}
			onChange={(event: any) => setConfig({ ...config, growthRate: Number(event.imaginaryTarget.value)})}
			label='Growth rate'/>
		<NumberInput
			id={`${type}-inhabitant-settings-mutation-rate`}
			value={config?.mutationRate}
			min={0}
			step={0.05}
			onChange={(event: any) => setConfig({ ...config, mutationRate: Number(event.imaginaryTarget.value)})}
			label='Mutation rate'/>
		<NumberInput
			id={`${type}-inhabitant-settings-max-age`}
			value={config?.maxAge}
			min={0}
			onChange={(event: any) => setConfig({ ...config, maxAge: Number(event.imaginaryTarget.value)})}
			label='Max age'/>
		<NumberInput
			id={`${type}-inhabitant-settings-energy`}
			value={config?.energy}
			min={0}
			onChange={(event: any) => setConfig({ ...config, energy: Number(event.imaginaryTarget.value)})}
			label='Energy'/>
		<Button
		onClick={create}>
			Create
		</Button>
	</div>;
};

export const Controls = ({
	className,
	world,
	...rest
}: any) => {
	const [size, setSize] = useState([20, 20]);
	const [plantsConfig, setPlantsConfig] = useState({
		count: 5,
		size: 1,
		growthRate: 1.0001,
		mutationRate: 0.2,
		maxAge: 120,
		energy: 10
	});
	const [herbivoresConfig, setHerbivoresConfig] = useState({
		count: 20,
		size: 1,
		growthRate: 1.0001,
		mutationRate: 0.2,
		maxAge: 50,
		energy: 20
	});
	const [predatorsConfig, setPredatorsConfig] = useState({
		count: 10,
		size: 1,
		growthRate: 1.0001,
		mutationRate: 0.2,
		maxAge: 70,
		energy: 50
	});

	useEffect(() => {
		if (!world.current.ground || !world.current.walls.length) {
			createBorder();
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [world]);

	const clearInhabitants = () => {
		world.current.clearInhabitants();
	};

	const createBorder = () => {
		world.current.createBorder(new Vector2(size[0], size[1]));
	};

	return <div className={'controls ' + className} {...rest}>
		<h4 className='world-title'>World</h4>

		<NumberInput
			id='world-width'
			value={size[0]}
			min={1}
			onChange={(event) => setSize([Number((event as any).imaginaryTarget.value), size[1]])}
			label='Width'/>
		<NumberInput
			id='world-height'
			min={1}
			value={size[1]}
			onChange={(event) => setSize([size[0], Number((event as any).imaginaryTarget.value)])}
			label='Height'/>
		<Button onClick={clearInhabitants}>Clear inhabitants</Button>
		<Button onClick={createBorder}>Create</Button>

		<h4 className='inhabitants-title'>Inhabitants</h4>
		
		<Tabs className='controls-tabs'>
			<Tab label='Plants'>
				<InhabitantSettings
					type='plant'
					world={world}
					config={plantsConfig}
					setConfig={setPlantsConfig} />
			</Tab>
			<Tab label='Herbivores'>
				<InhabitantSettings
					type='herbivore'
					world={world}
					config={herbivoresConfig}
					setConfig={setHerbivoresConfig} />
			</Tab>
			<Tab label='Predators'>
				<InhabitantSettings
					type='predator'
					world={world}
					config={predatorsConfig}
					setConfig={setPredatorsConfig} />
			</Tab>
		</Tabs>
	</div>;
};
