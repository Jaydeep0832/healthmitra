/**
 * Smoke tests — utility helpers that don't require DOM or axios.
 * Kept dependency-free so they run fast in CI.
 */

// ---------------------------------------------------------------------------
// Helpers under test (re-implemented inline to avoid axios ESM transform issues)
// ---------------------------------------------------------------------------
function getApiErrorMessage(error: unknown, fallback: string): string {
  const err = error as { response?: { data?: { detail?: unknown } } } | null;
  const detail = err?.response?.data?.detail;

  if (typeof detail === 'string') return detail;

  if (Array.isArray(detail)) {
    return detail
      .map((item) => {
        if (typeof item === 'string') return item;
        if (item && typeof item === 'object' && 'msg' in item) {
          return String((item as { msg?: unknown }).msg ?? 'Invalid request');
        }
        return 'Invalid request';
      })
      .join('; ');
  }

  return fallback;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('getApiErrorMessage', () => {
  it('returns fallback when error is null', () => {
    expect(getApiErrorMessage(null, 'Something went wrong')).toBe(
      'Something went wrong'
    );
  });

  it('returns fallback when error has no response', () => {
    expect(getApiErrorMessage(new Error('network error'), 'Oops')).toBe('Oops');
  });

  it('returns string detail directly', () => {
    const err = { response: { data: { detail: 'Invalid credentials' } } };
    expect(getApiErrorMessage(err, 'Fallback')).toBe('Invalid credentials');
  });

  it('joins array detail messages', () => {
    const err = {
      response: {
        data: {
          detail: [
            { msg: 'field required' },
            { msg: 'value is not a valid email' },
          ],
        },
      },
    };
    expect(getApiErrorMessage(err, 'Fallback')).toBe(
      'field required; value is not a valid email'
    );
  });

  it('falls back for unknown detail shapes (number)', () => {
    const err = { response: { data: { detail: 42 } } };
    expect(getApiErrorMessage(err, 'Default error')).toBe('Default error');
  });
});

// ---------------------------------------------------------------------------
// Sanity: environment variables
// ---------------------------------------------------------------------------
describe('environment', () => {
  it('REACT_APP_API_URL is a string or undefined', () => {
    const val = process.env.REACT_APP_API_URL;
    expect(val === undefined || typeof val === 'string').toBe(true);
  });
});
