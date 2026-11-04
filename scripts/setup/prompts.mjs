/**
 * Thin layer over @clack/prompts for the setup assistant: every prompt goes through `ask()`, so
 * Ctrl+C anywhere ends the assistant cleanly (nothing has been written at that point), text
 * answers come back trimmed, and the current value is shown as the editable default.
 */
import * as clack from '@clack/prompts';

export const { intro, outro, note, log, spinner, isCancel } = clack;

// Unwraps a prompt result; a cancelled prompt ends the assistant.
export async function ask(promise) {
    const result = await promise;
    if (clack.isCancel(result)) {
        clack.cancel('Setup cancelled. Nothing was changed.');
        process.exit(0);
    }
    return result;
}

/** Text input. `initialValue` (the current value) is shown and can be edited; the answer is trimmed. */
export async function text({ initialValue, ...options }) {
    const value = await ask(clack.text({ initialValue: initialValue || undefined, ...options }));
    return (value ?? '').trim();
}

export const confirm = (options) => ask(clack.confirm(options));
export const select = (options) => ask(clack.select(options));
export const multiselect = (options) => ask(clack.multiselect(options));
