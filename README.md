# Vue Keep Alive iFrame

> 一个支持 keep-alive 功能的 Vue 2.7+ iframe 组件，解决 iframe 在路由切换时被销毁的问题。

[![npm version](https://img.shields.io/npm/v/vue-keep-alive-iframe.svg)](https://www.npmjs.com/package/vue-keep-alive-iframe)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Vue 2.7+](https://img.shields.io/badge/Vue-2.7+%20%7C%203.x-brightgreen.svg)](https://vuejs.org/)

## 核心特性

- **Keep-Alive 支持** - iframe 在路由切换时保持状态不被销毁
- **Vue 2.7+ 双版本兼容** - 一套代码，两个版本通用
- **响应式设计** - 自动适配容器尺寸变化
- **智能缓存管理** - 支持最大缓存数量限制和 LRU 策略
- **灵活样式** - 支持自定义加载和错误状态
- **TypeScript 支持** - 完整的类型定义
- **编程式 API** - 提供 FrameManager 用于手动管理
- **零外部依赖** - 仅需 Vue 作为 peer dependency

## 安装

```bash
# npm
npm install vue-keep-alive-iframe

# yarn
yarn add vue-keep-alive-iframe

# pnpm
pnpm add vue-keep-alive-iframe
```

## 使用方法

### 基础用法

```vue
<template>
  <div>
    <KeepAliveFrame
      :src="currentSrc"
      keep-alive
      @load="handleLoad"
      @error="handleError"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { KeepAliveFrame } from 'vue-keep-alive-iframe'

import 'vue-keep-alive-iframe/style.css'

const currentSrc = ref('https://example.com')

const handleLoad = () => console.log('iframe loaded')
const handleError = () => console.log('iframe load error')
</script>
```

### 高级用法

```vue
<template>
  <KeepAliveFrame
    :src="dynamicUrl"
    :keep-alive="enableCache"
    :iframe-attrs="iframeAttributes"
    :max-cache-size="maxCache"
    :parent-container="scrollContainer"
    @load="handleLoad"
    @error="handleError"
    @activated="handleActivated"
    @deactivated="handleDeactivated"
    @resize="handleResize"
    @cache-hit="handleCacheHit"
    @cache-miss="handleCacheMiss"
  >
    <!-- 自定义加载状态 -->
    <template #loading>
      <div class="custom-loading">
        <span>正在加载...</span>
      </div>
    </template>

    <!-- 自定义错误状态 -->
    <template #error>
      <div class="custom-error">
        <span>加载失败，请重试</span>
      </div>
    </template>

    <!-- 自定义空状态 -->
    <template #empty>
      <div class="custom-empty">
        <span>请输入有效的 URL</span>
      </div>
    </template>
  </KeepAliveFrame>
</template>

<script setup>
import KeepAliveFrame, { FrameManager, generateId } from 'vue-keep-alive-iframe'
import { ref } from 'vue'

const dynamicUrl = ref('https://example.com')
const enableCache = ref(true)
const maxCache = ref(5)
const scrollContainer = ref(null)

const iframeAttributes = {
  allow: 'camera; microphone; clipboard-read; clipboard-write',
  sandbox: 'allow-scripts allow-same-origin',
  referrerpolicy: 'strict-origin-when-cross-origin'
}

const handleLoad = (event) => console.log('加载完成', event)
const handleError = (error) => console.error('加载错误', error)
const handleActivated = () => console.log('组件激活')
const handleDeactivated = () => console.log('组件停用')
const handleResize = (rect) => console.log('尺寸变化', rect)
const handleCacheHit = () => console.log('缓存命中')
const handleCacheMiss = () => console.log('缓存未命中')
</script>
```

### 编程式 API

```javascript
import { FrameManager, generateId } from 'vue-keep-alive-iframe'

// 创建 iframe
const frameId = generateId()
const frame = FrameManager.create({
  uid: frameId,
  src: 'https://example.com',
  width: 800,
  height: 600,
  top: 100,
  left: 100,
  keepAlive: true,
  attrs: { allow: 'clipboard-read' },
  onLoaded: (e) => console.log('加载完成'),
  onError: (e) => console.log('加载失败')
})

// 管理 iframe
FrameManager.show(frameId)        // 显示
FrameManager.hide(frameId)        // 隐藏
FrameManager.resize(frameId, {    // 调整大小
  width: 1000,
  height: 800,
  top: 50,
  left: 50
})
FrameManager.destroy(frameId)     // 销毁
FrameManager.clear()              // 清空所有缓存
FrameManager.setMaxCacheSize(20)  // 设置最大缓存数
```

## API 文档

### Props

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `src` | `string` | - | iframe 的 URL 地址 |
| `keepAlive` | `boolean` | `true` | 是否启用 keep-alive 缓存 |
| `iframeAttrs` | `Record<string, any>` | `{}` | iframe 元素的原生属性 |
| `maxCacheSize` | `number` | `10` | 最大缓存 iframe 数量 |
| `parentContainer` | `HTMLElement` | - | 父级滚动容器（用于滚动同步） |
| `zIndex` | `number` | `0` | iframe 的 z-index |

### Events

| 事件名 | 参数 | 描述 |
|--------|------|------|
| `load` | `(event: Event)` | iframe 加载完成 |
| `error` | `(error: Event \| string)` | iframe 加载失败 |
| `activated` | `()` | 组件被激活（keep-alive） |
| `deactivated` | `()` | 组件被停用（keep-alive） |
| `destroy` | `()` | iframe 被销毁 |
| `resize` | `(rect: HTMLElementRect)` | 容器尺寸改变 |
| `cacheHit` | `()` | 缓存命中 |
| `cacheMiss` | `()` | 缓存未命中 |

### Slots

| 插槽名 | 作用域 | 描述 |
|--------|--------|------|
| `loading` | `{ zIndex }` | 自定义加载状态 |
| `error`   | -            | 自定义错误状态 |
| `empty`   | -            | 自定义空状态（无 src 时） |

### Expose Methods

| 方法名      | 返回值                      | 描述                  |
|-------------|-----------------------------|-----------------------|
| `getFrame()` | `HTMLIFrameElement \| null` | 获取当前 iframe 元素 |

## TypeScript 支持

```typescript
import type {
  HTMLElementRect,
  IFrameOptions,
  IFrameInstance
} from 'vue-keep-alive-iframe'

const options: IFrameOptions = {
  uid: 'my-frame',
  src: 'https://example.com',
  width: 800,
  height: 600,
}
```

## 工作原理

1. **iframe 脱离组件** - iframe 实际挂载在 `document.body` 上，而不是组件内部
2. **位置同步** - 使用 fixed 定位让 iframe 与组件容器位置同步
3. **智能缓存** - 通过 `FrameManager` 管理 iframe 生命周期和 LRU 缓存策略
4. **响应式布局** - 监听容器尺寸变化，实时调整 iframe 大小

## 注意事项

### 跨域限制
- iframe 内容需要允许跨域嵌入
- 可能需要设置适当的 CSP 策略

### 滚动同步
当启用 `keepAlive` 时，如果父容器有滚动：
- 传递 `parentContainer` 属性以启用滚动同步
- 或考虑将 `keepAlive` 设为 `false`

### 性能考虑
- 合理设置 `maxCacheSize` 避免内存过度占用
- 及时清理不需要的 iframe 缓存

## 开发

```bash
# 安装依赖
pnpm install

# 开发模式
pnpm run dev

# 构建库
pnpm run build:lib

# 构建演示站点
pnpm run build
```

## 致谢

本项目基于 [keep-alive-iframe](https://github.com/XinXiaoIsMe/keep-alive-iframe) 开发，感谢原作者 [@XinXiaoIsMe](https://github.com/XinXiaoIsMe) 的工作。

## 许可证

[MIT](LICENSE) © 2024
