import { LineChart } from '@carbon/charts-react';
import { Button } from 'carbon-components-react';
import React, { useEffect, useState } from 'react';

import "@carbon/charts/styles.css";

export const StatisticsView = ({ world, className }: any) => {
	const [statistics, setStatistics] = useState([] as any[]);
	const options = {
		title: 'Creature count per type',
		axes: {
			bottom: {
				title: 'Time',
				mapsTo: 'time',
				scaleType: 'linear'
			},
			left: {
				mapsTo: 'value',
				title: 'Creature count',
				scaleType: 'linear'
			}
		},
		points: {
			enabled: false
		},
		color: {
			scale: {
				'Plants': '#00ff00',
				'Herbivores': '#0000ff',
				'Predators': '#ff0000'
			}
		},
		height: '400px'
	} as any;

	// TODO rewrite chartData generation so it doesn't have to map same data that many times
	const chartData = [
		...statistics.map((datapoint, i) => ({
			group: 'Plants',
			time: i,
			value: datapoint.population.filter((creature: any) => creature.type === 'plant').length
		})),
		...statistics.map((datapoint, i) => ({
			group: 'Herbivores',
			time: i,
			value: datapoint.population.filter((creature: any) => creature.type === 'herbivore').length
		})),
		...statistics.map((datapoint, i) => ({
			group: 'Predators',
			time: i,
			value: datapoint.population.filter((creature: any) => creature.type === 'predator').length
		}))
	];

	useEffect(() => {
		world.current.statisticsInterval = 2000; // miliseconds
		world.current.addStatisticsSnapshotCallback = (world: any, statistics: any) => {
			if (
				!world.population ||
				!world.population.length ||
				!world.shouldRunSimulation
			) {
				return;
			}
			setStatistics(statsAccumulator => [...statsAccumulator, statistics]);
		};
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

    return <div className={className}>
		<LineChart
			data={chartData}
			options={options} />
		<Button onClick={() => setStatistics([])}>Clear</Button>
	</div>;
};
