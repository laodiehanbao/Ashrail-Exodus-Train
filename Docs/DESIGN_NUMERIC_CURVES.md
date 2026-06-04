# DESIGN_NUMERIC_CURVES

## 第一轮目标

数值先少而可调，不堆指数。

当前只维护：

- `EconomyCurve.json`
- `CombatCurve.json`
- `BaseCurve.json`
- 掉落权重表
- 模块升级成本

## 当前观测

- `sim:loot`：普通补给箱约 55% 装备、25% 模块碎片、20% 金币。
- `sim:combat`：首两关在测试战力下 60 秒内可通关。
- `sim:economy`：前 30 分钟金币和碎片按分段曲线增长。
- `sim:ads`：30 分钟内受每日上限控制，展示 10 次。

## 后续

Vertical Slice 前补：

- 前 30-60 分钟升级耗时目标。
- 第一处资源卡点。
- 广告触发频率上限。
- 第一个 Boss 的战力门槛。
