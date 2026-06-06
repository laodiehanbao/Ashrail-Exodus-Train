declare module 'cc' {
  export const _decorator: {
    ccclass(name?: string): ClassDecorator;
    property(options?: unknown): PropertyDecorator;
  };

  export class Component {
    node: Node;
  }

  export class Node {
    static EventType: { TOUCH_END: string };
    active: boolean;
    children: Node[];
    name: string;
    parent: Node | null;
    constructor(name?: string);
    addChild(child: Node): void;
    addComponent<T extends Component>(type: new () => T): T;
    destroy(): void;
    getChildByName(name: string): Node | null;
    getComponent<T extends Component>(type: new () => T): T | null;
    off(eventType: string, callback: (...args: unknown[]) => void, target?: unknown): void;
    on(eventType: string, callback: (...args: unknown[]) => void, target?: unknown): void;
    setPosition(x: number, y: number, z?: number): void;
  }

  export class Label extends Component {
    color: Color;
    string: string;
  }

  export class Button extends Component {
    static EventType: { CLICK: string };
    interactable: boolean;
  }

  export class Sprite extends Component {
    color: Color;
    spriteFrame: SpriteFrame | null;
  }

  export class SpriteFrame {}

  export class AudioClip {}

  export class AudioSource extends Component {
    clip: AudioClip | null;
    loop: boolean;
    volume: number;
    play(): void;
    playOneShot(clip: AudioClip, volumeScale?: number): void;
    stop(): void;
  }

  export class UITransform extends Component {
    setContentSize(width: number, height: number): void;
  }

  export class Color {
    static WHITE: Color;
    constructor(r?: number, g?: number, b?: number, a?: number);
  }

  export const CCInteger: unknown;
  export const CCString: unknown;

  export class JsonAsset {
    json: unknown;
    name: string;
  }

  export function instantiate<T extends Node>(original: T): T;
}
