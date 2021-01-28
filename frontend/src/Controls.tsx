
import React, { useState } from 'react';
import {
	Button,
	NumberInput,
	Tabs,
	Tab
} from 'carbon-components-react';

import './Controls.scss';
import { Herbivore } from './world/herbivore';
import { Vector2 } from '@babylonjs/core';

export const InhabitantSettings = ({
	type,
	world,
	count,
	size,
	growthRate,
	mutationRate,
	maxAge,
	energy
}: any) => {
	const create = () => {
		new Herbivore(world.current);
	};

	return <div>
		<NumberInput
			id={`${type}-inhabitant-settings-count`}
			value={count}
			label='Count'/>
		<NumberInput
			id={`${type}-inhabitant-settings-size`}
			value={size}
			label='Size'/>
		<NumberInput
			id={`${type}-inhabitant-settings-growth-rate`}
			value={growthRate}
			label='Growth rate'/>
		<NumberInput
			id={`${type}-inhabitant-settings-mutation-rate`}
			value={mutationRate}
			label='Mutation rate'/>
		<NumberInput
			id={`${type}-inhabitant-settings-max-age`}
			value={maxAge}
			label='Max age'/>
		<NumberInput
			id={`${type}-inhabitant-settings-energy`}
			value={energy}
			label='Energy'/>
		<Button
		onClick={create}>
			Create
		</Button>
	</div>;
};

export const Controls = ({className, world, ...rest}: any) => {
	const [size, setSize] = useState([20, 20]);

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
		<Button>Clear inhabitants</Button>
		<Button onClick={createBorder}>Create</Button>
		<Tabs>
			<Tab label='Plants'>
				<InhabitantSettings
					type='plants'
					world={world}
					count={30}
					size={2}
					growthRate={1.0001}
					mutationRate={0.2}
					maxAge={70}
					energy={500} />
			</Tab>
			<Tab label='Herbivores'>
				<InhabitantSettings
					type='herbivores'
					world={world}
					count={30}
					size={2}
					growthRate={1.0001}
					mutationRate={0.2}
					maxAge={70}
					energy={500} />
			</Tab>
			<Tab label='Predators'>
				<InhabitantSettings
					type='predators'
					world={world}
					count={30}
					size={2}
					growthRate={1.0001}
					mutationRate={0.2}
					maxAge={70}
					energy={500} />
			</Tab>
		</Tabs>
	</div>;
};
