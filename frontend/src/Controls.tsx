
import React from 'react';
import {
	Button,
	NumberInput,
	Tabs,
	Tab
} from 'carbon-components-react';

import './Controls.scss';

export const InhabitantSettings = ({
	type,
	count,
	size,
	growthRate,
	mutationRate,
	maxAge,
	energy
}: any) => {
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
		<Button>Create</Button>
	</div>;
};

export const Controls = ({className, ...rest}: any) => {
	return <div className={'controls ' + className} {...rest}>
		<NumberInput
			id='world-width'
			value={200}
			label='Width'/>
		<NumberInput
			id='world-height'
			value={200}
			label='Height'/>
		<Button>Clear inhabitants</Button>
		<Button>Create</Button>
		<Tabs>
			<Tab label='Plants'>
				<InhabitantSettings
					type='plants'
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
