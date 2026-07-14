export const AUTH_REQUEST_TIMEOUT_MS = 30_000;
export const AUTH_SLOW_NOTICE_MS = 3_000;

export class RequestTimeoutError extends Error {
  constructor(message = 'Request timed out. The server may be waking up — please try again.') {
    super(message);
    this.name = 'RequestTimeoutError';
  }
}

export function withTimeout<T>(
  promise: Promise<T>,
  ms: number = AUTH_REQUEST_TIMEOUT_MS,
  message?: string,
): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => {
      reject(new RequestTimeoutError(message));
    }, ms);

    promise
      .then((value) => {
        window.clearTimeout(timer);
        resolve(value);
      })
      .catch((error: unknown) => {
        window.clearTimeout(timer);
        reject(error);
      });
  });
}

export async function runWithSlowNotice<T>(
  promise: Promise<T>,
  onSlow: () => void,
  slowMs: number = AUTH_SLOW_NOTICE_MS,
): Promise<T> {
  const timer = window.setTimeout(onSlow, slowMs);

  try {
    return await promise;
  } finally {
    window.clearTimeout(timer);
  }
}
