/** Challenge fixtures use matchdays from 201 so they never collide with league 1–22 or cup 101–104. */
export function nextChallengeMatchday(matchdays: readonly number[]): number {
  const highest = matchdays.reduce((max, day) => (day >= 201 ? Math.max(max, day) : max), 200);
  // 301–322 belong to the first season of the human league.
  return highest + 1 >= 301 && highest + 1 <= 322 ? 323 : highest + 1;
}
