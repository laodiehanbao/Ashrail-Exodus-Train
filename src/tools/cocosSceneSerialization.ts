import { stableUuid } from './cocosCreatorAssetUtils.js';
import {
  addChild,
  addComponent,
  color,
  pushObject,
  quat,
  vec3,
  vec4,
  type NodeOptions,
  type SceneBuildContext,
  type SceneObject,
} from './cocosSceneSerialization.types.js';

export function createSceneContext(): SceneBuildContext {
  return { objects: [], nodeIdsByPath: new Map() };
}

export function createNode(context: SceneBuildContext, options: NodeOptions): number {
  const id = pushObject(context, {
    __type__: 'cc.Node',
    _name: options.name,
    _objFlags: 0,
    _parent: { __id__: options.parentId },
    _children: [],
    _active: options.active ?? true,
    _components: [],
    _prefab: null,
    _lpos: vec3(options.x ?? 0, options.y ?? 0),
    _lrot: quat(),
    _lscale: vec3(1, 1, 1),
    _layer: 33554432,
    _euler: vec3(0, 0, 0),
    _id: shortId(options.path),
  });
  addChild(context, options.parentId, id);
  context.nodeIdsByPath.set(options.path, id);
  return id;
}

export function createUiTransform(context: SceneBuildContext, nodeId: number, width: number, height: number): number {
  return addNodeComponent(context, nodeId, {
    __type__: 'cc.UITransform',
    _name: '',
    _objFlags: 0,
    node: { __id__: nodeId },
    _enabled: true,
    __prefab: null,
    _contentSize: { __type__: 'cc.Size', width, height },
    _anchorPoint: { __type__: 'cc.Vec2', x: 0.5, y: 0.5 },
    _id: shortId(`component:uiTransform:${nodeId}`),
  });
}

export function createCameraComponent(context: SceneBuildContext, nodeId: number): number {
  return addNodeComponent(context, nodeId, {
    __type__: 'cc.Camera',
    _name: '',
    _objFlags: 0,
    node: { __id__: nodeId },
    _enabled: true,
    __prefab: null,
    _projection: 0,
    _priority: 0,
    _fov: 45,
    _fovAxis: 0,
    _orthoHeight: 10,
    _near: 0,
    _far: 2000,
    _color: color(0, 0, 0, 255),
    _depth: 1,
    _stencil: 0,
    _clearFlags: 7,
    _rect: { __type__: 'cc.Rect', x: 0, y: 0, width: 1, height: 1 },
    _aperture: 19,
    _shutter: 7,
    _iso: 0,
    _screenScale: 1,
    _visibility: 1108344832,
    _targetTexture: null,
    _id: shortId(`component:camera:${nodeId}`),
  });
}

export function createCanvasComponent(context: SceneBuildContext, nodeId: number, cameraComponentId: number): number {
  return addNodeComponent(context, nodeId, {
    __type__: 'cc.Canvas',
    _name: '',
    _objFlags: 0,
    node: { __id__: nodeId },
    _enabled: true,
    __prefab: null,
    _cameraComponent: { __id__: cameraComponentId },
    _alignCanvasWithScreen: true,
    _id: shortId(`component:canvas:${nodeId}`),
  });
}

export function createWidgetComponent(context: SceneBuildContext, nodeId: number): number {
  return addNodeComponent(context, nodeId, {
    __type__: 'cc.Widget',
    _name: '',
    _objFlags: 0,
    node: { __id__: nodeId },
    _enabled: true,
    __prefab: null,
    _alignFlags: 45,
    _target: null,
    _left: 0,
    _right: 0,
    _top: 0,
    _bottom: 0,
    _horizontalCenter: 0,
    _verticalCenter: 0,
    _isAbsLeft: true,
    _isAbsRight: true,
    _isAbsTop: true,
    _isAbsBottom: true,
    _isAbsHorizontalCenter: true,
    _isAbsVerticalCenter: true,
    _originalWidth: 0,
    _originalHeight: 0,
    _alignMode: 2,
    _lockFlags: 0,
    _id: shortId(`component:widget:${nodeId}`),
  });
}

export function createSpriteComponent(
  context: SceneBuildContext,
  nodeId: number,
  tint = color(43, 41, 37, 220),
  spriteFrameUuid?: string,
): number {
  return addNodeComponent(context, nodeId, {
    __type__: 'cc.Sprite',
    _name: '',
    _objFlags: 0,
    node: { __id__: nodeId },
    _enabled: true,
    __prefab: null,
    _visFlags: 0,
    _customMaterial: null,
    _srcBlendFactor: 2,
    _dstBlendFactor: 4,
    _color: tint,
    _spriteFrame: spriteFrameUuid ? spriteFrameRef(spriteFrameUuid) : null,
    _type: 0,
    _fillType: 0,
    _sizeMode: 0,
    _fillCenter: { __type__: 'cc.Vec2', x: 0, y: 0 },
    _fillStart: 0,
    _fillRange: 0,
    _isTrimmedMode: true,
    _useGrayscale: false,
    _id: shortId(`component:sprite:${nodeId}`),
  });
}

export function spriteFrameRef(uuid: string): SceneObject {
  return {
    __uuid__: uuid,
    __expectedType__: 'cc.SpriteFrame',
  };
}

export function audioClipRef(uuid: string): SceneObject {
  return {
    __uuid__: uuid,
    __expectedType__: 'cc.AudioClip',
  };
}

export function createLabelComponent(context: SceneBuildContext, nodeId: number, text: string, fontSize = 28): number {
  const labelId = addNodeComponent(context, nodeId, {
    __type__: 'cc.Label',
    _name: '',
    _objFlags: 0,
    node: { __id__: nodeId },
    _enabled: true,
    __prefab: null,
    _visFlags: 0,
    _customMaterial: null,
    _srcBlendFactor: 2,
    _dstBlendFactor: 4,
    _color: color(231, 225, 213, 255),
    _string: text,
    _horizontalAlign: 1,
    _verticalAlign: 1,
    _actualFontSize: fontSize,
    _fontSize: fontSize,
    _fontFamily: 'Arial',
    _lineHeight: fontSize + 4,
    _overflow: 0,
    _enableWrapText: true,
    _font: null,
    _isSystemFontUsed: true,
    _spacingX: 0,
    _isItalic: false,
    _isBold: false,
    _isUnderline: false,
    _underlineHeight: 2,
    _cacheMode: 0,
    _id: shortId(`component:label:${nodeId}`),
  });
  createLabelOutlineComponent(context, nodeId);
  return labelId;
}

export function createLabelOutlineComponent(context: SceneBuildContext, nodeId: number): number {
  return addNodeComponent(context, nodeId, {
    __type__: 'cc.LabelOutline',
    _name: '',
    _objFlags: 0,
    node: { __id__: nodeId },
    _enabled: true,
    __prefab: null,
    _color: color(20, 17, 14, 235),
    _width: 2,
    _id: shortId(`component:labelOutline:${nodeId}`),
  });
}

export function createButtonComponent(context: SceneBuildContext, nodeId: number): number {
  return addNodeComponent(context, nodeId, {
    __type__: 'cc.Button',
    _name: '',
    _objFlags: 0,
    node: { __id__: nodeId },
    _enabled: true,
    __prefab: null,
    clickEvents: [],
    _interactable: true,
    _transition: 0,
    _normalColor: color(255, 255, 255, 255),
    _hoverColor: color(230, 230, 230, 255),
    _pressedColor: color(255, 255, 255, 255),
    _disabledColor: color(124, 124, 124, 255),
    _normalSprite: null,
    _hoverSprite: null,
    _pressedSprite: null,
    _disabledSprite: null,
    _duration: 0.1,
    _zoomScale: 1.05,
    _target: { __id__: nodeId },
    _id: shortId(`component:button:${nodeId}`),
  });
}

export function createLayoutComponent(context: SceneBuildContext, nodeId: number): number {
  return addNodeComponent(context, nodeId, {
    __type__: 'cc.Layout',
    _name: '',
    _objFlags: 0,
    node: { __id__: nodeId },
    _enabled: true,
    __prefab: null,
    _resizeMode: 0,
    _layoutType: 3,
    _cellSize: { __type__: 'cc.Size', width: 160, height: 72 },
    _startAxis: 0,
    _paddingLeft: 8,
    _paddingRight: 8,
    _paddingTop: 8,
    _paddingBottom: 8,
    _spacingX: 8,
    _spacingY: 8,
    _verticalDirection: 1,
    _horizontalDirection: 0,
    _constraint: 0,
    _constraintNum: 2,
    _affectedByScale: false,
    _isAlign: true,
    _id: shortId(`component:layout:${nodeId}`),
  });
}

export function addNodeComponent(context: SceneBuildContext, nodeId: number, component: Record<string, unknown>): number {
  const id = pushObject(context, component);
  addComponent(context, nodeId, id);
  return id;
}

export function shortId(seed: string): string {
  return stableUuid(`cocos-id:${seed}`).replaceAll('-', '').slice(0, 22);
}

export { color, pushObject, vec3, vec4 };
