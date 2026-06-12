import { onMounted, onUnmounted, ref } from 'vue'

const DESIGN_WIDTH = 1920
const DESIGN_HEIGHT = 1080

export function useScreenScale() {
  const scale = ref(1)

  function updateScale() {
    const scaleX = window.innerWidth / DESIGN_WIDTH
    const scaleY = window.innerHeight / DESIGN_HEIGHT
    scale.value = Math.min(scaleX, scaleY)
  }

  onMounted(() => {
    updateScale()
    window.addEventListener('resize', updateScale)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', updateScale)
  })

  return {
    designWidth: DESIGN_WIDTH,
    designHeight: DESIGN_HEIGHT,
    scale,
  }
}
