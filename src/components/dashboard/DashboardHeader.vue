<template>
  <header class="dashboard-header">
    <div class="dashboard-header__deco dashboard-header__deco--left" />
    <div class="dashboard-header__center">
      <h1 class="dashboard-header__title">OEE统计大屏</h1>
      <p class="dashboard-header__subtitle">Overall Equipment Effectiveness Dashboard</p>
    </div>
    <div class="dashboard-header__deco dashboard-header__deco--right" />
  </header>
</template>

<style scoped lang="scss">
.dashboard-header {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 72px;
  margin-bottom: 16px;
}

.dashboard-header__center {
  text-align: center;
}

.dashboard-header__title {
  font-size: 32px;
  font-weight: 700;
  letter-spacing: 8px;
  background: linear-gradient(90deg, #00d4ff 0%, #00ffcc 50%, #00d4ff 100%);
  background-size: 200% auto;
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: shimmer 4s linear infinite;
}

@keyframes shimmer {
  to { background-position: 200% center; }
}

.dashboard-header__subtitle {
  margin-top: 2px;
  font-size: 12px;
  color: rgba(232, 244, 255, 0.4);
  letter-spacing: 3px;
  text-transform: uppercase;
}

.dashboard-header__deco {
  position: absolute;
  top: 50%;
  width: 200px;
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(0, 212, 255, 0.5), transparent);

  &--left {
    left: 80px;
    transform: translateY(-50%);
  }

  &--right {
    right: 80px;
    transform: translateY(-50%);
  }
}
</style>
