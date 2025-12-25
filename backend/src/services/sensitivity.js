export const analyze = async () => {
  const score = Math.random()
  return score > 0.7 ? "flagged" : "safe"
}
