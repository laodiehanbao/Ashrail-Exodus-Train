import { _decorator, Button, Component, Label } from 'cc';
import type { CocosUiActionBinding } from '../CocosUiBinding.types.js';
import { findDescendantLabel } from './CocosCreatorUiBindingUtils.js';

const { ccclass, property } = _decorator;

@ccclass('CocosCreatorActionBindingComponent')
export class CocosCreatorActionBindingComponent extends Component implements CocosUiActionBinding {
  @property({ type: Button })
  button: Button | null = null;

  @property({ type: Label })
  label: Label | null = null;

  @property({ type: Label })
  disabledReasonLabel: Label | null = null;

  private onPress: (() => void) | null = null;
  private boundClick: (() => void) | null = null;

  setLabel(label: string): void {
    const target = this.label ?? findDescendantLabel(this.node, ['Label', 'Text', 'Title']);
    if (target) target.string = label;
  }

  setEnabled(enabled: boolean): void {
    const button = this.button ?? this.node.getComponent(Button) ?? this.node.addComponent(Button);
    button.interactable = enabled;
  }

  setDisabledReason(reason?: string): void {
    if (this.disabledReasonLabel) {
      this.disabledReasonLabel.string = reason ?? '';
    }
  }

  setOnPress(handler: (() => void) | null): void {
    this.ensureClickBound();
    this.onPress = handler;
  }

  private ensureClickBound(): void {
    if (this.boundClick) return;
    const button = this.button ?? this.node.getComponent(Button) ?? this.node.addComponent(Button);
    this.boundClick = () => this.onPress?.();
    button.node.off(Button.EventType.CLICK, this.boundClick, this);
    button.node.on(Button.EventType.CLICK, this.boundClick, this);
  }
}
