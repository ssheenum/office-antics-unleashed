export function timeBonus(secondsLeft: number, perSecond = 5) {
  return Math.max(0, Math.floor(secondsLeft * perSecond));
}

export function xpFromScore(score: number) {
  return Math.floor(Math.sqrt(score) * 2);
}
