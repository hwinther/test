/** A stand-in for an orval mutation hook's result, with each call recorded. */
export interface FakeMutation {
  isPending: boolean
  error: unknown
  calls: { variables: unknown; onSuccess?: () => void }[]
  mutate: (variables: unknown, options?: { onSuccess?: () => void }) => void
}

/**
 * A fresh fake mutation: `mutate` records the call, and the test runs `onSuccess` when it wants.
 * @returns {FakeMutation} The fake.
 */
export function fakeMutation(): FakeMutation {
  const fake: FakeMutation = {
    isPending: false,
    error: null,
    calls: [],
    mutate: (variables, options) => {
      fake.calls.push({ variables, onSuccess: options?.onSuccess })
    },
  }
  return fake
}
