import { Vector3 } from "@babylonjs/core";

export class Utils {
	static mutate(initialValue: number | Vector3, randomization: number) : any {
		if (initialValue instanceof Vector3) {
			return new Vector3(
				this.mutate(initialValue.x, randomization),
				this.mutate(initialValue.y, randomization),
				this.mutate(initialValue.z, randomization)
			);
		}

		const sign = Math.random() > 0.5 ? -1 : 1;
		const num = Math.random() * randomization;
		return initialValue + (sign * num);
	}
}