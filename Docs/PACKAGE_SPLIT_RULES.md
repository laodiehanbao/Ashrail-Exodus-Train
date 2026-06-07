# PACKAGE_SPLIT_RULES

## 主包

只放：

- 启动代码
- 第一屏 UI
- 第一段可玩战斗
- 基础字体和短音效
- 核心配置
- 必要图集

当前 Creator 同步规则：

- `npm run sync:cocos` 只同步配置声明过的 P0 runtime 资源。
- 视觉资源来源于 `configs/ui/P0VisualAssets.json`，不直接同步 source/contact sheet。
- 音频资源只同步 `AudioCues.json` 中非 `remote`、非 `deferred` 的 cue。
- 当前 P0 scene 会同步/生成 `assets/scenes/scene_p0_exodus_train_main.scene`。

## 分包 / 远程

优先放：

- 后续章节
- 活动和赛季资源
- 皮肤资源
- 长音频
- 大图
- 高帧率动画
- 宣传素材

当前远程保留：

- `packageTag: "remote"` 的 ElevenLabs voice cue 不进入 Creator 首包同步。
- concept/key visual/source sheet 只留在主仓库作为生产资料，不进入 Creator runtime asset mirror。

## 禁止

- 构建产物、缓存和临时文件入库。
- 同一资源多格式重复提交。
- `.psd`、`.blend`、`.fbx`、`.wav`、视频、压缩包默认进入普通 Git。
- Cocos 首包同步不得回退到 `assets/textures`、`assets/icons`、`assets/ui` 整目录复制。
