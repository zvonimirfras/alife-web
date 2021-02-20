import { Button } from 'carbon-components-react';
import React, { useEffect, useState } from 'react';

export const StatisticsView = ({ world }: any) => {
	const [statistics, setStatistics] = useState([] as any[]);
	
	useEffect(() => {
		const interval = setInterval(() => {
			if (
				!world.current.population ||
				!world.current.population.length ||
				!world.current.shouldRunSimulation
			) {
				return;
			}
			setStatistics(statistics => [...statistics, world.current.statisticsSnapshot()]);
		}, 500);

		return () => clearInterval(interval);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

    return <>
		{statistics.length}
		<Button onClick={() => setStatistics([])}>Clear</Button>
	</>;
};
