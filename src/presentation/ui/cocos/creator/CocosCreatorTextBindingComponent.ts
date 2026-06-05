import { _decorator, Component, Label } from 'cc';
import type { CocosUiTextBinding } from '../CocosUiBinding.types.js';
import { getOrAddLabel } from './CocosCreatorUiBindingUtils.js';

const { ccclass, property } = _decorator;

@ccclass('CocosCreatorTextBindingComponent')
export class CocosCreatorTextBindingComponent extends Component implements CocosUiTextBinding {
  @property({ type: Label })
  label: Label | null = null;

  setText(text: string): void {
    getOrAddLabel(this.label?.node ?? this.node, this.label).string = text;
  }
}
