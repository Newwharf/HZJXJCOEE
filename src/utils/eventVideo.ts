import { minutesToTime, timeToMinutes } from '@/utils/time'

export interface EventPlaybackRange {
  playbackStart: string
  playbackEnd: string
  playbackDurationSeconds: number
}

export function getEventPlaybackRange(start: string, end: string): EventPlaybackRange {
  const startMin = timeToMinutes(start)
  const endMin = timeToMinutes(end)

  return {
    playbackStart: minutesToTime(startMin - 30),
    playbackEnd: minutesToTime(endMin + 30),
    playbackDurationSeconds: endMin - startMin + 60,
  }
}
