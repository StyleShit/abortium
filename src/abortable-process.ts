// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyFn = (...args: any[]) => any;

type AbortableProcess<TLastResult> = {
	then: <TReturn>(
		cb: (arg: TLastResult, signal: AbortSignal) => TReturn,
	) => AbortableProcess<Awaited<TReturn>>;

	execute: () => Promise<void>;
};

export function abortableProcess<TLastResult = never>(
	signal: AbortSignal,
	steps: AnyFn[] = [],
): AbortableProcess<TLastResult> {
	return {
		then: (cb) => {
			steps.push(cb);

			return abortableProcess(signal, steps);
		},

		execute: async () => {
			let lastResult: TLastResult | undefined;

			for (const step of steps) {
				if (signal.aborted) {
					break;
				}

				lastResult = (await step(lastResult, signal)) as TLastResult;
			}
		},
	};
}
