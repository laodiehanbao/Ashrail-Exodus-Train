# DESIGN_AD_PLACEMENTS

## 第一轮目标

只实现 Mock 激励广告，不接真实 Douyin API。

```text
IAdService -> MockAdService -> AdLimitService -> AdRewardService
```

## 状态

广告播放必须处理：

- `success`
- `cancelled`
- `failed`
- `no_fill`
- `timeout`

`success` 应用倍率；`no_fill` 和 `timeout` 使用 fallback reward；取消和失败返回基础奖励。

## 数据

- 广告位：`configs/ads/AdPlacements.json`

## 验证

- `AdRewardService.test.ts`
- `npm run sim:ads`
