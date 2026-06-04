# DESIGN_LOOT_SYSTEM

## 第一轮目标

开箱系统只跑通一条可测链路：

```text
LootBoxSystem -> LootGenerator -> RewardService -> InventoryModel / ResourceWallet
```

UI 和动画不得生成掉落，也不得直接发奖励。

## 边界

- `LootGenerator` 只根据 `LootBoxes.json` 和 `LootPools.json` 产出 `rewardId`。
- `RewardService` 只根据 `RewardDefinitions.json` 发放资源、装备、模块碎片和宝箱。
- `LootBoxSystem` 负责校验宝箱数量、开箱消耗、调用掉落和结算。
- 广告倍率通过 `AdRewardService` 修饰 reward bundle，不写广告专用发奖逻辑。

## 数据

- 宝箱：`configs/loot/LootBoxes.json`
- 掉落池：`configs/loot/LootPools.json`
- 奖励定义：`configs/loot/RewardDefinitions.json`
- 装备：`configs/loot/EquipmentItems.json`

## 验证

- `npm test`
- `npm run sim:loot`
