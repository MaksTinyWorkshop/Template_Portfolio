type WithRollbackOptions = {
  // Centralize "best-effort rollback" behavior to avoid ad-hoc try/catch blocks.
  onRollbackError?: (rollbackError: unknown) => void;
};

export async function withRollback<T>(
  operation: () => Promise<T>,
  rollback: () => Promise<void>,
  options: WithRollbackOptions = {},
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    try {
      await rollback();
    } catch (rollbackError) {
      options.onRollbackError?.(rollbackError);
    }
    throw error;
  }
}
