import type { UiActionState, UiMetricState, UiScreenLayoutConfig } from '../../shared/ui/P0Ui.types.js';
import type { P0UiSnapshot } from './P0UiSnapshot.types.js';
import type { UiTextService } from './UiTextService.js';

export interface MainHudState {
  title: string;
  statusText: string;
  power: number;
  coin: number;
  currentStageId: string;
  metrics: UiMetricState[];
  actions: UiActionState[];
  layout?: UiScreenLayoutConfig;
}

export function createMainHudState(
  snapshot: P0UiSnapshot,
  text?: UiTextService,
  layout?: UiScreenLayoutConfig,
): MainHudState {
  const power = snapshot.power;
  const coin = snapshot.progress.resources.coin ?? 0;
  const currentStageId = snapshot.progress.currentStageId;

  return {
    title: getText(text, 'ui.screen.mainHud.title'),
    statusText: getText(text, 'ui.status.stage.ready'),
    power,
    coin,
    currentStageId,
    metrics: [
      {
        labelKey: 'ui.label.power',
        label: getText(text, 'ui.label.power'),
        value: String(power),
        accentToken: 'ember_orange',
      },
      {
        labelKey: 'ui.label.coin',
        label: getText(text, 'ui.label.coin'),
        value: String(coin),
        accentToken: 'warning_yellow',
      },
      {
        labelKey: 'ui.label.stage',
        label: getText(text, 'ui.label.stage'),
        value: currentStageId,
        accentToken: 'steel_white',
      },
    ],
    actions: [
      {
        actionId: 'ui_request_stage_start',
        labelKey: 'ui.button.stage.start',
        label: getText(text, 'ui.button.stage.start'),
        enabled: true,
      },
    ],
    layout,
  };
}

function getText(text: UiTextService | undefined, key: string): string {
  return text?.text(key) ?? key;
}
