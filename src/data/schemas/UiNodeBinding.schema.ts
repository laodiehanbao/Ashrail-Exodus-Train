import { fail, ok, type Result } from '../../core/Result.types.js';
import { ErrorCode } from '../../shared/ErrorCodes.js';
import {
  P0_UI_NODE_BINDING_SLOT_SPECS,
  type P0UiBindingSlotId,
  type UiNodeBindingSlotSpec,
  type UiNodeBindingConfig,
  type UiNodeBindingEntryConfig,
  type UiNodeBindingKind,
  type UiScreenNodeBindingConfig,
} from '../../shared/ui/P0UiNodeBinding.types.js';
import { P0_UI_ACTION_IDS, P0_UI_SCREEN_IDS, type P0UiScreenId, type UiLayoutConfig } from '../../shared/ui/P0Ui.types.js';
import { asRecord, readArray, readString, validationError } from './commonValidation.js';

const NODE_BINDING_FIELDS = new Set(['bindingSetId', 'sceneId', 'layoutId', 'screens']);
const SCREEN_BINDING_FIELDS = new Set(['screenId', 'rootPath', 'bindings']);
const ENTRY_BINDING_FIELDS = new Set([
  'bindingKey',
  'slotId',
  'nodePath',
  'kind',
  'panelId',
  'componentId',
  'actionId',
  'itemTemplatePath',
  'emptyStatePath',
]);
const NODE_PATH_PATTERN = /^[A-Za-z0-9_/]+$/;

export function validateUiNodeBindingConfig(
  input: unknown,
  layout?: UiLayoutConfig,
): Result<UiNodeBindingConfig> {
  const record = asRecord(input, 'UiNodeBinding');
  if (!record.ok) return record;
  const fieldCheck = validateAllowedFields(record.value, NODE_BINDING_FIELDS, 'UiNodeBinding');
  if (!fieldCheck.ok) return fieldCheck;

  const bindingSetId = readString(record.value, 'bindingSetId');
  const sceneId = readString(record.value, 'sceneId');
  const layoutId = readString(record.value, 'layoutId');
  const screens = readArray(record.value, 'screens');
  if (!bindingSetId.ok || !sceneId.ok || !layoutId.ok || !screens.ok) {
    return validationError<UiNodeBindingConfig>(bindingSetId, sceneId, layoutId, screens);
  }
  if (layout && layoutId.value !== layout.layoutId) {
    return fail(ErrorCode.ConfigMissingReference, `UI node binding references unknown layout ${layoutId.value}`, record.value);
  }

  const parsedScreens = parseScreens(screens.value, layout);
  if (!parsedScreens.ok) return parsedScreens;

  return ok({
    bindingSetId: bindingSetId.value,
    sceneId: sceneId.value,
    layoutId: layoutId.value,
    screens: parsedScreens.value,
  });
}

function parseScreens(input: unknown[], layout?: UiLayoutConfig): Result<UiScreenNodeBindingConfig[]> {
  const ids = new Set<string>();
  const rootPaths = new Set<string>();
  const parsed: UiScreenNodeBindingConfig[] = [];

  for (const item of input) {
    const record = asRecord(item, 'UiNodeBindingScreen');
    if (!record.ok) return record;
    const fieldCheck = validateAllowedFields(record.value, SCREEN_BINDING_FIELDS, 'UiNodeBindingScreen');
    if (!fieldCheck.ok) return fieldCheck;

    const screenId = readString(record.value, 'screenId');
    const rootPath = readNodePath(record.value, 'rootPath');
    const bindings = readArray(record.value, 'bindings');
    if (!screenId.ok || !rootPath.ok || !bindings.ok) {
      return validationError<UiScreenNodeBindingConfig[]>(screenId, rootPath, bindings);
    }
    if (!P0_UI_SCREEN_IDS.includes(screenId.value as P0UiScreenId)) {
      return fail(ErrorCode.ConfigInvalid, `Unknown P0 UI node binding screen ${screenId.value}`, record.value);
    }
    if (ids.has(screenId.value)) {
      return fail(ErrorCode.ConfigInvalid, `Duplicate P0 UI node binding screen ${screenId.value}`, record.value);
    }
    if (rootPaths.has(rootPath.value)) {
      return fail(ErrorCode.ConfigInvalid, `Duplicate P0 UI root path ${rootPath.value}`, record.value);
    }

    const parsedBindings = parseBindings(screenId.value as P0UiScreenId, bindings.value, layout);
    if (!parsedBindings.ok) return parsedBindings;

    ids.add(screenId.value);
    rootPaths.add(rootPath.value);
    parsed.push({
      screenId: screenId.value as P0UiScreenId,
      rootPath: rootPath.value,
      bindings: parsedBindings.value,
    });
  }

  for (const requiredScreenId of P0_UI_SCREEN_IDS) {
    if (!ids.has(requiredScreenId)) {
      return fail(ErrorCode.ConfigInvalid, `Missing P0 UI node binding screen ${requiredScreenId}`, input);
    }
  }

  return ok(parsed);
}

function parseBindings(
  screenId: P0UiScreenId,
  input: unknown[],
  layout?: UiLayoutConfig,
): Result<UiNodeBindingEntryConfig[]> {
  const bindingKeys = new Set<string>();
  const slotIds = new Set<string>();
  const nodePaths = new Set<string>();
  const parsed: UiNodeBindingEntryConfig[] = [];

  for (const item of input) {
    const record = asRecord(item, 'UiNodeBindingEntry');
    if (!record.ok) return record;
    const fieldCheck = validateAllowedFields(record.value, ENTRY_BINDING_FIELDS, 'UiNodeBindingEntry');
    if (!fieldCheck.ok) return fieldCheck;

    const binding = parseBinding(screenId, record.value, layout);
    if (!binding.ok) return binding;
    if (bindingKeys.has(binding.value.bindingKey)) {
      return fail(ErrorCode.ConfigInvalid, `Duplicate UI node binding key ${binding.value.bindingKey}`, record.value);
    }
    if (slotIds.has(binding.value.slotId)) {
      return fail(ErrorCode.ConfigInvalid, `Duplicate UI node binding slot ${binding.value.slotId}`, record.value);
    }
    if (nodePaths.has(binding.value.nodePath)) {
      return fail(ErrorCode.ConfigInvalid, `Duplicate UI node path ${binding.value.nodePath}`, record.value);
    }
    for (const extraPath of [binding.value.itemTemplatePath, binding.value.emptyStatePath]) {
      if (!extraPath) continue;
      if (nodePaths.has(extraPath)) {
        return fail(ErrorCode.ConfigInvalid, `Duplicate UI node path ${extraPath}`, record.value);
      }
      nodePaths.add(extraPath);
    }

    bindingKeys.add(binding.value.bindingKey);
    slotIds.add(binding.value.slotId);
    nodePaths.add(binding.value.nodePath);
    parsed.push(binding.value);
  }

  return validateRequiredSlots(screenId, slotIds, parsed);
}

function parseBinding(
  screenId: P0UiScreenId,
  record: Record<string, unknown>,
  layout?: UiLayoutConfig,
): Result<UiNodeBindingEntryConfig> {
  const bindingKey = readString(record, 'bindingKey');
  const slotId = readString(record, 'slotId');
  const kind = readString(record, 'kind');
  const nodePath = readNodePath(record, 'nodePath');
  if (!bindingKey.ok || !slotId.ok || !kind.ok || !nodePath.ok) {
    return validationError<UiNodeBindingEntryConfig>(bindingKey, slotId, kind, nodePath);
  }

  const spec: UiNodeBindingSlotSpec | undefined = P0_UI_NODE_BINDING_SLOT_SPECS.find((item) => item.slotId === slotId.value);
  if (!spec || spec.screenId !== screenId) {
    return fail(ErrorCode.ConfigInvalid, `Unknown UI node binding slot ${slotId.value} for ${screenId}`, record);
  }
  if (spec.kind !== kind.value) {
    return fail(ErrorCode.ConfigInvalid, `UI node binding ${slotId.value} must use kind ${spec.kind}`, record);
  }

  const actionId = readOptionalString(record, 'actionId');
  if (!actionId.ok) return actionId;
  if (spec.actionId && actionId.value !== spec.actionId) {
    return fail(ErrorCode.ConfigInvalid, `UI node binding ${slotId.value} must emit ${spec.actionId}`, record);
  }
  if (!spec.actionId && actionId.value) {
    return fail(ErrorCode.ConfigInvalid, `UI node binding ${slotId.value} must not define an action`, record);
  }
  if (actionId.value && !P0_UI_ACTION_IDS.includes(actionId.value as (typeof P0_UI_ACTION_IDS)[number])) {
    return fail(ErrorCode.ConfigInvalid, `Unknown UI node binding action ${actionId.value}`, record);
  }

  const panelId = readOptionalString(record, 'panelId');
  const componentId = readOptionalString(record, 'componentId');
  const itemTemplatePath = readOptionalNodePath(record, 'itemTemplatePath');
  const emptyStatePath = readOptionalNodePath(record, 'emptyStatePath');
  if (!panelId.ok || !componentId.ok || !itemTemplatePath.ok || !emptyStatePath.ok) {
    return validationError<UiNodeBindingEntryConfig>(panelId, componentId, itemTemplatePath, emptyStatePath);
  }
  const layoutCheck = validateLayoutReferences(screenId, panelId.value, componentId.value, layout);
  if (!layoutCheck.ok) {
    return layoutCheck;
  }
  if (spec.requiresItemTemplate && !itemTemplatePath.value) {
    return fail(ErrorCode.ConfigInvalid, `UI node binding ${slotId.value} requires an item template path`, record);
  }
  if (!spec.requiresItemTemplate && itemTemplatePath.value) {
    return fail(ErrorCode.ConfigInvalid, `UI node binding ${slotId.value} must not define an item template path`, record);
  }

  return ok({
    bindingKey: bindingKey.value,
    slotId: slotId.value as P0UiBindingSlotId,
    nodePath: nodePath.value,
    kind: kind.value as UiNodeBindingKind,
    panelId: panelId.value,
    componentId: componentId.value,
    actionId: actionId.value as UiNodeBindingEntryConfig['actionId'],
    itemTemplatePath: itemTemplatePath.value,
    emptyStatePath: emptyStatePath.value,
  });
}

function validateRequiredSlots(
  screenId: P0UiScreenId,
  slotIds: Set<string>,
  parsed: UiNodeBindingEntryConfig[],
): Result<UiNodeBindingEntryConfig[]> {
  for (const spec of P0_UI_NODE_BINDING_SLOT_SPECS) {
    if (spec.screenId === screenId && !slotIds.has(spec.slotId)) {
      return fail(ErrorCode.ConfigInvalid, `Missing UI node binding slot ${spec.slotId}`, parsed);
    }
  }

  return ok(parsed);
}

function validateLayoutReferences(
  screenId: P0UiScreenId,
  panelId: string | undefined,
  componentId: string | undefined,
  layout?: UiLayoutConfig,
): Result<void> {
  if (!layout) return ok(undefined);

  const screen = layout.screens.find((item) => item.screenId === screenId);
  if (!screen) {
    return fail(ErrorCode.ConfigMissingReference, `UI node binding references unknown layout screen ${screenId}`);
  }
  if (panelId && !screen.panels.some((panel) => panel.panelId === panelId)) {
    return fail(ErrorCode.ConfigMissingReference, `UI node binding references unknown panel ${panelId}`);
  }
  if (componentId && !layout.componentSkins.some((component) => component.componentId === componentId)) {
    return fail(ErrorCode.ConfigMissingReference, `UI node binding references unknown component ${componentId}`);
  }

  return ok(undefined);
}

function validateAllowedFields(
  record: Record<string, unknown>,
  allowedFields: Set<string>,
  label: string,
): Result<void> {
  for (const key of Object.keys(record)) {
    if (!allowedFields.has(key)) {
      return fail(ErrorCode.ConfigInvalid, `${label} has forbidden or unknown field ${key}`, record);
    }
  }

  return ok(undefined);
}

function readOptionalString(record: Record<string, unknown>, field: string): Result<string | undefined> {
  if (!(field in record)) return ok(undefined);
  const value = record[field];
  if (value === undefined) return ok(undefined);
  if (typeof value !== 'string' || value.length === 0) {
    return fail(ErrorCode.ConfigInvalid, `${field} must be a non-empty string`, record);
  }

  return ok(value);
}

function readNodePath(record: Record<string, unknown>, field: string): Result<string> {
  const path = readString(record, field);
  if (!path.ok) return path;
  return validateNodePath(path.value, record);
}

function readOptionalNodePath(record: Record<string, unknown>, field: string): Result<string | undefined> {
  if (!(field in record)) return ok(undefined);
  const path = readOptionalString(record, field);
  if (!path.ok || !path.value) return path;
  return validateNodePath(path.value, record);
}

function validateNodePath(path: string, context: unknown): Result<string> {
  if (!path.startsWith('Canvas/') || path.includes('..') || path.includes('//') || !NODE_PATH_PATTERN.test(path)) {
    return fail(ErrorCode.ConfigInvalid, `Invalid UI node path ${path}`, context);
  }

  return ok(path);
}
