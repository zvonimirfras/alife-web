
import React, { useState } from 'react';
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
			// TODO randomize configs based on mutation rate
			switch (type) {
				case 'plant': {
					const plant = new Plant(world.current);
					plant.create({
						...config,
						position: randomPosition(world.current.size, config.size)
					} as CreatureConfiguration);
					break;
				}

				case 'herbivore': {
					const herbivore = new Herbivore(world.current);
					herbivore.create({
						...config,
						sensorSize: config.size * 5,
						position: randomPosition(world.current.size, config.size)
					} as CreatureConfiguration);
					break;
				}

				case 'predator': {
					const predator = new Predator(world.current);
					predator.create({
						...config,
						sensorSize: config.size * 10,
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
			onChange={(event: any) => setConfig({ ...config, count: event.imaginaryTarget.value})}
			label='Count'/>
		<NumberInput
			id={`${type}-inhabitant-settings-size`}
			value={config?.size}
			onChange={(event: any) => setConfig({ ...config, size: event.imaginaryTarget.value})}
			label='Size'/>
		<NumberInput
			id={`${type}-inhabitant-settings-growth-rate`}
			value={config?.growthRate}
			onChange={(event: any) => setConfig({ ...config, growthRate: event.imaginaryTarget.value})}
			label='Growth rate'/>
		<NumberInput
			id={`${type}-inhabitant-settings-mutation-rate`}
			value={config?.mutationRate}
			onChange={(event: any) => setConfig({ ...config, mutationRate: event.imaginaryTarget.value})}
			label='Mutation rate'/>
		<NumberInput
			id={`${type}-inhabitant-settings-max-age`}
			value={config?.maxAge}
			onChange={(event: any) => setConfig({ ...config, maxAge: event.imaginaryTarget.value})}
			label='Max age'/>
		<NumberInput
			id={`${type}-inhabitant-settings-energy`}
			value={config?.energy}
			onChange={(event: any) => setConfig({ ...config, energy: event.imaginaryTarget.value})}
			label='Energy'/>
		<Button
		onClick={create}>
			Create
		</Button>
	</div>;
};

export const Controls = ({className, world, ...rest}: any) => {
	const [size, setSize] = useState([20, 20]);
	const [plantsConfig, setPlantsConfig] = useState({
		count: 30,
		size: 2,
		growthRate: 1.0001,
		mutationRate: 0.2,
		maxAge: 70,
		energy: 500
	});
	const [herbivoresConfig, setHerbivoresConfig] = useState({
		count: 30,
		size: 2,
		growthRate: 1.0001,
		mutationRate: 0.2,
		maxAge: 70,
		energy: 500
	});
	const [predatorsConfig, setPredatorsConfig] = useState({
		count: 30,
		size: 2,
		growthRate: 1.0001,
		mutationRate: 0.2,
		maxAge: 70,
		energy: 500
	});

	const clearInhabitants = () => {
		world.current.clearInhabitants();
	};

	const createBorder = () => {
		world.current.createBorder(new Vector2(size[0], size[1]));
	};

	return <div className={'controls ' + className} {...rest}>
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
		<Tabs>
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
