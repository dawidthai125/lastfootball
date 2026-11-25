import { describe, expect, it, vi } from 'vitest';

import { keepFields, settleForm } from './kept-form';

function fakeForm() {
  const password = { value: 'tajne' };
  const form = {
    reset: vi.fn(),
    querySelectorAll: vi.fn(() => [password]),
  };
  return { form, password, as: form as unknown as Parameters<typeof settleForm>[0] };
}

describe('kept form', () => {
  it('keeps the fields after an error and clears only the current password', () => {
    const { form, password, as } = fakeForm();
    settleForm(as, { error: 'Nieprawidłowe hasło.' });
    expect(form.reset).not.toHaveBeenCalled();
    expect(form.querySelectorAll).toHaveBeenCalledWith('input[autocomplete="current-password"]');
    expect(password.value).toBe('');
  });

  it('starts the form over after success', () => {
    const { form, as } = fakeForm();
    settleForm(as, { error: null });
    expect(form.reset).toHaveBeenCalledOnce();
  });

  it('stops the React form action, so React does not clear the form', () => {
    class FakeFormData {}
    vi.stubGlobal('FormData', FakeFormData);
    const action = vi.fn();
    const preventDefault = vi.fn();
    keepFields(action)({ preventDefault, currentTarget: {} } as unknown as Parameters<
      ReturnType<typeof keepFields>
    >[0]);
    vi.unstubAllGlobals();
    expect(preventDefault).toHaveBeenCalledOnce();
    expect(action).toHaveBeenCalledWith(expect.any(FakeFormData));
  });
});
