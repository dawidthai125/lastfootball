/** Challenge fixtures use matchdays from 201 so they never collide with league 1–22 or cup 101–104. */
export function nextChallengeMatchday(matchdays: readonly number[]): number {
  const highest = matchdays.reduce((max, day) => (day >= 201 ? Math.max(max, day) : max), 200);
  return highest + 1;
}
