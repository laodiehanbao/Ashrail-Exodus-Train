# DESIGN_TRAIN_MODULES

## 第一轮目标

列车模块必须存在于业务模型和存档中，不只存在于 UI 或贴图。

```text
TrainModel -> TrainModuleRepository -> TrainModuleSystem -> PowerChangedEvent
```

## 边界

- `TrainModel` 保存已安装模块和等级。
- `TrainModuleRepository` 读取模块配置。
- `TrainModuleSystem` 校验碎片成本、升级模块、发出战力变化事件。
- `TrainView` 只显示 `TrainSnapshot`，不计算升级成本。

## 数据

- 模块配置：`configs/train/TrainModules.json`
- 模块碎片作为 `module_fragment` reward item 发放。

## 验证

- `TrainModuleSystem.test.ts`
- `prototypeLoop.test.ts`
