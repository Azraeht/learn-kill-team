/**
 * Adds a question's follow-up ids to the pending queue, skipping anything
 * already shown this session or already queued — so a chain that loops back
 * on itself (or a question reachable two ways) can't queue duplicates.
 */
export function enqueueFollowUps(
  queue: string[],
  followUps: string[] | undefined,
  shownIds: ReadonlySet<string>,
): string[] {
  if (!followUps || followUps.length === 0) return queue;

  const additions = followUps.filter((id) => !shownIds.has(id) && !queue.includes(id));
  if (additions.length === 0) return queue;

  return [...queue, ...additions];
}

export interface FollowUpPop {
  id: string | null;
  remainingQueue: string[];
}

/**
 * Pops the next still-relevant id off the queue, skipping any that got shown
 * by some other path in the meantime. Pure and queue-only: the caller still
 * has to resolve the id to an actual Question (and treat a missing/unresolvable
 * one — shouldn't happen given validate-content, but a session shouldn't crash
 * over it — as if the queue were empty for this pop).
 */
export function popNextFollowUp(queue: string[], shownIds: ReadonlySet<string>): FollowUpPop {
  const remaining = [...queue];

  while (remaining.length > 0) {
    const id = remaining.shift()!;
    if (!shownIds.has(id)) return { id, remainingQueue: remaining };
  }

  return { id: null, remainingQueue: remaining };
}
