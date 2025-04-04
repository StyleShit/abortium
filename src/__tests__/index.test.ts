import { describe, it, expect } from 'vitest';
import { abortableProcess } from '../index';

describe('abortableProcess', () => {
	it('should run the steps in order', async () => {
		// Arrange.
		const abortController = new AbortController();

		let value = '';

		const process = abortableProcess(abortController.signal)
			.then(() => {
				value += 'a';

				return Promise.resolve('b');
			})
			.then((v) => {
				value += v;

				return Promise.resolve('c');
			})
			.then((v) => {
				value += v;
			});

		// Act.
		await process.execute();

		// Assert.
		expect(value).toBe('abc');
	});

	it('should not execute anything when the signal is aborted before the process has started', async () => {
		// Arrange.
		const abortController = new AbortController();

		let value = 'initial';

		const process = abortableProcess(abortController.signal).then(() => {
			value = 'updated';
		});

		// Act.
		abortController.abort();

		await process.execute();

		// Assert.
		expect(value).toBe('initial');
	});

	it('should abort all queued steps when the signal is aborted', async () => {
		// Arrange.
		const abortController = new AbortController();

		let value = '';

		const process = abortableProcess(abortController.signal)
			.then(() => {
				value += 'a';

				return Promise.resolve('b');
			})
			.then((v) => {
				value += v;

				abortController.abort();

				return Promise.resolve('c');
			})
			.then((v) => {
				value += v;
			});

		// Act.
		await process.execute();

		// Assert.
		expect(value).toBe('ab');
	});
});
