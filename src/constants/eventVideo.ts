export const CAMERA_VIDEO_SOURCES = {
  inner: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  outer: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
} as const

export type CameraType = keyof typeof CAMERA_VIDEO_SOURCES

export const CAMERA_LABELS: Record<CameraType, string> = {
  inner: '机内摄像头',
  outer: '机外摄像头',
}
