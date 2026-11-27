// Integer arithmetic avoids rounding a borderline attendance result upward.
export function calculateAttendance(attended, total, target) {
  if (![attended, total, target].every(Number.isSafeInteger) ||
      attended < 0 || total < 0 || attended > total || total > 1000000 ||
      target < 1 || target > 100) throw new RangeError('Invalid attendance inputs');
  const deficit = target * total - 100 * attended;
  return {
    percentage: total === 0 ? null : attended / total * 100,
    safeSkips: Math.max(0, Math.floor(100 * attended / target) - total),
    recovery: deficit <= 0 ? 0 : target === 100 ? null : Math.ceil(deficit / (100 - target)),
    meetsTarget: total > 0 && deficit <= 0,
  };
}
