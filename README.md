# Abortable Process

Halt a process of asynchronous steps using an AbortSignal.

# Why

JavaScript is single-threaded, which means you can't really halt a running process.
However, it provides us an API called `AbortController` that is basically usable only in specific
scenarios and APIs, such as `fetch` and `addEventListener`.

If you want to use the `AbortController` API in your code, you need to wait for each function to
finish, and check between the function runs whether the `AbortSignal` has been aborted.
This is a tedious task, and it can be easily forgotten:

```typescript
const controller = new AbortController();

async function processData() {
  const result1 = await heavyDataProcessing(data, controller.signal);

  if (controller.signal.aborted) {
    return;
  }

  const result2 = await heavyDataProcessing(result1, controller.signal);

  if (controller.signal.aborted) {
    return;
  }

  const result3 = await heavyDataProcessing(result2, controller.signal);

  if (controller.signal.aborted) {
    return;
  }

  const result4 = await heavyDataProcessing(result3, controller.signal);

  if (controller.signal.aborted) {
    return;
  }

  return result4;
}

button.addEventListener('click', () => {
  controller.abort();
});
```

# What

This package lets you create a process of asynchronous steps that can will be halted when the
`AbortSignal` is aborted. It uses the `AbortController` API under the hood, but it provides a
more convenient API to use:

```typescript
import { abortableProcess } from 'abortable-process';

const controller = new AbortController();

async function processData() {
  const process = abortableProcess(controller.signal)
    .then((_, signal) => heavyDataProcessing(data, signal))
    .then((result1, signal) => heavyDataProcessing(result1, signal))
    .then((result2, signal) => heavyDataProcessing(result2, signal))
    .then((result3, signal) => heavyDataProcessing(result3, signal));

  const finalResult = await process.execute();

  return finalResult;
}
```

It's somewhat similar to the `Promise` API. You chain the steps using `.then()`, and the
library gives you the previous step's result and the `AbortSignal` as arguments.

Each step in the chain is typed, so the next step will have the correct type for the previous
step's result.

When the `AbortSignal` is aborted, the process will be halted, and all queued steps will be
skipped.
