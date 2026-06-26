// Cloudflare D1 caps bound parameters at ~100 per query. Insert wide rows in
// small batches so multi-row inserts never blow that limit.
export const inChunks = async <T>(
  rows: T[],
  run: (batch: T[]) => Promise<unknown>,
  size = 4,
): Promise<void> => {
  for (let i = 0; i < rows.length; i += size) await run(rows.slice(i, i + size))
}
