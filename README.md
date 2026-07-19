# ExerPedia

面向健身新手的双语健身动作百科。用户无需登录或创建训练计划，可以按身体部位、器械或中英文名称自由探索 48 个精选动作。

## 技术栈

- Vue 3 + TypeScript + Vite
- Vue Router（Hash 模式）
- Pinia + Vue I18n
- SCSS + CSS Variables
- GSAP + ScrollTrigger
- pnpm

## 本地运行

```bash
pnpm install
pnpm dev
```

生产构建：

```bash
pnpm build
pnpm preview
```

如需从父目录的 `exercises-dataset` 重新生成 V1 数据和媒体子集：

```bash
pnpm prepare:data
```

## 页面

- `/#/`：品牌首页与身体部位入口
- `/#/explore`：搜索、身体部位与器械筛选
- `/#/exercise/:id`：独立动作详情
- 未知路由与无效动作 ID：404 状态

## 媒体说明

动作图片与 GIF 为 180×180 媒体，版权归 Gym Visual 所有。每个动作详情页均保留：

`© Gym visual — https://gymvisual.com/`

完整条款见 [NOTICE.md](./NOTICE.md) 与 [LICENSE](./LICENSE)。
