export const CHART_ANIMATION = {
  animation: true,
  animationDuration: 1200,
  animationEasing: 'cubicOut' as const,
  animationDurationUpdate: 600,
}

export function chartSeriesDelay(index: number, step = 80) {
  return index * step
}
