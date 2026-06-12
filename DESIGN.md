---
name: 杭州机械局 OEE 统计平台
description: 工业 OEE 监控大屏 — 深色高密度数据界面
colors:
  bg-base: "#0B1220"
  bg-surface: "#111827"
  bg-elevated: "#1A2332"
  bg-muted: "#243044"
  border-default: "#2D3A4F"
  border-subtle: "#1E293B"
  text-primary: "#F1F5F9"
  text-secondary: "#94A3B8"
  text-muted: "#64748B"
  accent-primary: "#22C55E"
  accent-info: "#38BDF8"
  status-success: "#22C55E"
  status-warning: "#FBBF24"
  status-danger: "#F87171"
  status-neutral: "#94A3B8"
  status-purple: "#A78BFA"
  status-pink: "#F472B6"
  chart-production: "#22C55E"
  chart-face-change: "#FBBF24"
  chart-production-change: "#A78BFA"
  chart-fault: "#F87171"
typography:
  ui:
    fontFamily: "Inter, PingFang SC, Microsoft YaHei, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Inter, PingFang SC, Microsoft YaHei, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 500
    lineHeight: 1.4
  metric:
    fontFamily: "Inter, PingFang SC, Microsoft YaHei, system-ui, sans-serif"
    fontSize: "22px"
    fontWeight: 600
    lineHeight: 1.2
  title:
    fontFamily: "Inter, PingFang SC, Microsoft YaHei, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 600
    lineHeight: 1.3
  display:
    fontFamily: "Inter, PingFang SC, Microsoft YaHei, system-ui, sans-serif"
    fontSize: "20px"
    fontWeight: 700
    lineHeight: 1.2
rounded:
  sm: "6px"
  md: "8px"
  lg: "10px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "20px"
  xxl: "24px"
components:
  panel:
    backgroundColor: "{colors.bg-surface}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.md}"
    padding: "{spacing.lg}"
  panel-header:
    backgroundColor: "transparent"
    textColor: "{colors.text-secondary}"
    typography: "{typography.title}"
  metric-row:
    backgroundColor: "transparent"
    textColor: "{colors.text-primary}"
    padding: "{spacing.md} {spacing.lg}"
---

## Overview

深色工业 OEE 监控大屏设计系统。面向 1920×1080 固定分辨率，强调数据可读性、状态语义一致与组件复用。优化版（`/dashboard-v2`）遵循 product register：克制用色、单一字体栈、无装饰动效。

## Colors

- **Base / Surface / Elevated**：三层背景区分页面、面板、控件层。
- **Accent Primary（#22C55E）**：仅用于运行状态、正向趋势、主操作焦点。
- **Semantic Status**：success / warning / danger / neutral 对应运行、换面、故障、停机。
- **Chart Colors**：与事件类型绑定，全站一致（生产绿、换面黄、换产紫、故障红）。
- 正文 `#F1F5F9` on `#111827` ≥ 4.5:1；次要文字 `#94A3B8` 仅用于标签，不用于关键数值。

## Typography

- 单一 UI 字体栈：Inter + PingFang SC，数值使用 `font-variant-numeric: tabular-nums`。
- 固定 px 字号（非 fluid clamp）：label 12px、body 14px、metric 22px、panel title 15px。
- 行高：标签 1.4、正文 1.5、数值 1.2。
- 不使用 display 字体或 mono 字体做 UI 标签。

## Elevation

- 面板：`1px solid border-default`，无 heavy shadow；hover 仅加深 border。
- 不使用 backdrop-blur 玻璃拟态（product 界面）。
- z-index 语义层级：base(0) → panel(10) → header(20) → modal(50) → tooltip(60)。

## Components

- **Panel**：surface 背景 + header 分隔线 + body padding 16px。
- **MetricRow**：面板内行布局（非嵌套卡片），icon + label + value + sparkline。
- **StatusBadge**：pill 形，颜色来自 semantic status，无 pulse 动画。
- **DateControl**：header 内 inline 控件，focus ring 使用 accent-primary。

## Do's and Don'ts

**Do**
- 用分隔线/间距组织面板内内容，而非卡片套卡片。
- 保持 accent 色仅用于状态与主交互。
- 图表与时间轴颜色与 DESIGN.md chart colors 对齐。
- 所有可交互元素提供 `:focus-visible` 环。

**Don't**
- 不要每个面板标题用不同 accent 色。
- 不要 text-shadow / glow / shimmer 装饰。
- 不要用 Fira Code 等 display/mono 字体做 UI 标签。
- 不要 orchestrated 页面入场动画。
