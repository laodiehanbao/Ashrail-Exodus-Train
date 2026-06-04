import { fail, ok, type Result } from '../../core/Result.types.js';
import { ErrorCode } from '../../shared/ErrorCodes.js';
import type {
  P0UiScreenId,
  UiColorTokenConfig,
  UiComponentSkinConfig,
  UiCopyConfig,
  UiCopyEntryConfig,
  UiLayoutConfig,
  UiPanelLayoutConfig,
  UiSafeAreaConfig,
  UiScreenLayoutConfig,
} from '../../shared/ui/P0Ui.types.js';
import { P0_UI_SCREEN_IDS } from '../../shared/ui/P0Ui.types.js';
import { asArray, asRecord, readArray, readNumber, readString, validationError } from './commonValidation.js';

const SCREEN_IDS: readonly P0UiScreenId[] = P0_UI_SCREEN_IDS;

export interface UiConfigSources {
  uiCopy: unknown;
  uiLayout: unknown;
}

export interface UiConfigRegistry {
  uiCopy: UiCopyConfig;
  uiLayout: UiLayoutConfig;
}

export function validateUiConfigSources(sources: UiConfigSources): Result<UiConfigRegistry> {
  const uiCopy = validateUiCopy(sources.uiCopy);
  const uiLayout = validateUiLayout(sources.uiLayout);
  if (!uiCopy.ok) return uiCopy;
  if (!uiLayout.ok) return uiLayout;

  return ok({
    uiCopy: uiCopy.value,
    uiLayout: uiLayout.value,
  });
}

export function validateUiCopy(input: unknown): Result<UiCopyConfig> {
  const record = asRecord(input, 'UiCopy');
  if (!record.ok) return record;

  const locale = readString(record.value, 'locale');
  const entries = readArray(record.value, 'entries');
  if (!locale.ok || !entries.ok) {
    return validationError<UiCopyConfig>(locale, entries);
  }

  const parsedEntries: UiCopyEntryConfig[] = [];
  const keys = new Set<string>();
  for (const item of entries.value) {
    const entry = asRecord(item, 'UiCopyEntry');
    if (!entry.ok) return entry;

    const key = readString(entry.value, 'key');
    const text = readString(entry.value, 'text');
    if (!key.ok || !text.ok) {
      return validationError<UiCopyConfig>(key, text);
    }

    if (keys.has(key.value)) {
      return fail(ErrorCode.ConfigInvalid, `Duplicate UI copy key ${key.value}`, entry.value);
    }
    keys.add(key.value);
    parsedEntries.push({ key: key.value, text: text.value });
  }

  return ok({ locale: locale.value, entries: parsedEntries });
}

export function validateUiLayout(input: unknown): Result<UiLayoutConfig> {
  const record = asRecord(input, 'UiLayout');
  if (!record.ok) return record;

  const layoutId = readString(record.value, 'layoutId');
  const designWidth = readNumber(record.value, 'designWidth', 320);
  const designHeight = readNumber(record.value, 'designHeight', 480);
  if (!layoutId.ok || !designWidth.ok || !designHeight.ok) {
    return validationError<UiLayoutConfig>(layoutId, designWidth, designHeight);
  }

  const safeArea = parseSafeArea(record.value.safeArea);
  const colorTokens = parseColorTokens(record.value.colorTokens);
  const componentSkins = parseComponentSkins(record.value.componentSkins);
  const screens = parseScreens(record.value.screens, designWidth.value, designHeight.value);
  if (!safeArea.ok || !colorTokens.ok || !componentSkins.ok || !screens.ok) {
    return validationError<UiLayoutConfig>(
      safeArea,
      colorTokens,
      componentSkins,
      screens,
    );
  }

  return ok({
    layoutId: layoutId.value,
    designWidth: designWidth.value,
    designHeight: designHeight.value,
    safeArea: safeArea.value,
    colorTokens: colorTokens.value,
    componentSkins: componentSkins.value,
    screens: screens.value,
  });
}

function parseSafeArea(input: unknown): Result<UiSafeAreaConfig> {
  const record = asRecord(input, 'UiSafeArea');
  if (!record.ok) return record;

  const top = readNumber(record.value, 'top', 0);
  const right = readNumber(record.value, 'right', 0);
  const bottom = readNumber(record.value, 'bottom', 0);
  const left = readNumber(record.value, 'left', 0);
  if (!top.ok || !right.ok || !bottom.ok || !left.ok) {
    return validationError<UiSafeAreaConfig>(top, right, bottom, left);
  }

  return ok({ top: top.value, right: right.value, bottom: bottom.value, left: left.value });
}

function parseColorTokens(input: unknown): Result<UiColorTokenConfig[]> {
  const array = asArray(input, 'UiColorTokens');
  if (!array.ok) return array;

  const tokens = new Set<string>();
  const parsed: UiColorTokenConfig[] = [];
  for (const item of array.value) {
    const record = asRecord(item, 'UiColorToken');
    if (!record.ok) return record;

    const token = readString(record.value, 'token');
    const hex = readString(record.value, 'hex');
    if (!token.ok || !hex.ok) return validationError<UiColorTokenConfig[]>(token, hex);
    if (!/^#[0-9a-fA-F]{6}$/.test(hex.value)) {
      return fail(ErrorCode.ConfigInvalid, `Invalid UI color hex ${hex.value}`, record.value);
    }
    if (tokens.has(token.value)) {
      return fail(ErrorCode.ConfigInvalid, `Duplicate UI color token ${token.value}`, record.value);
    }
    tokens.add(token.value);
    parsed.push({ token: token.value, hex: hex.value });
  }

  return ok(parsed);
}

function parseComponentSkins(input: unknown): Result<UiComponentSkinConfig[]> {
  const array = asArray(input, 'UiComponentSkins');
  if (!array.ok) return array;

  const ids = new Set<string>();
  const parsed: UiComponentSkinConfig[] = [];
  for (const item of array.value) {
    const record = asRecord(item, 'UiComponentSkin');
    if (!record.ok) return record;

    const componentId = readString(record.value, 'componentId');
    const assetId = readString(record.value, 'assetId');
    const minWidth = readNumber(record.value, 'minWidth', 1);
    const minHeight = readNumber(record.value, 'minHeight', 1);
    if (!componentId.ok || !assetId.ok || !minWidth.ok || !minHeight.ok) {
      return validationError<UiComponentSkinConfig[]>(componentId, assetId, minWidth, minHeight);
    }
    if (ids.has(componentId.value)) {
      return fail(ErrorCode.ConfigInvalid, `Duplicate UI component skin ${componentId.value}`, record.value);
    }
    ids.add(componentId.value);
    parsed.push({
      componentId: componentId.value,
      assetId: assetId.value,
      minWidth: minWidth.value,
      minHeight: minHeight.value,
    });
  }

  return ok(parsed);
}

function parseScreens(input: unknown, designWidth: number, designHeight: number): Result<UiScreenLayoutConfig[]> {
  const array = asArray(input, 'UiScreens');
  if (!array.ok) return array;

  const ids = new Set<string>();
  const parsed: UiScreenLayoutConfig[] = [];
  for (const item of array.value) {
    const record = asRecord(item, 'UiScreen');
    if (!record.ok) return record;

    const screenId = readString(record.value, 'screenId');
    const backgroundAssetId = readString(record.value, 'backgroundAssetId');
    const panels = parsePanels(record.value.panels, designWidth, designHeight);
    if (!screenId.ok || !backgroundAssetId.ok || !panels.ok) {
      return validationError<UiScreenLayoutConfig[]>(screenId, backgroundAssetId, panels);
    }
    if (!SCREEN_IDS.includes(screenId.value as P0UiScreenId)) {
      return fail(ErrorCode.ConfigInvalid, `Unknown P0 UI screen ${screenId.value}`, record.value);
    }
    if (ids.has(screenId.value)) {
      return fail(ErrorCode.ConfigInvalid, `Duplicate P0 UI screen ${screenId.value}`, record.value);
    }
    ids.add(screenId.value);
    parsed.push({
      screenId: screenId.value as P0UiScreenId,
      backgroundAssetId: backgroundAssetId.value,
      panels: panels.value,
    });
  }

  for (const requiredScreenId of SCREEN_IDS) {
    if (!ids.has(requiredScreenId)) {
      return fail(ErrorCode.ConfigInvalid, `Missing P0 UI screen ${requiredScreenId}`, input);
    }
  }

  return ok(parsed);
}

function parsePanels(input: unknown, designWidth: number, designHeight: number): Result<UiPanelLayoutConfig[]> {
  const array = asArray(input, 'UiPanels');
  if (!array.ok) return array;

  const ids = new Set<string>();
  const parsed: UiPanelLayoutConfig[] = [];
  for (const item of array.value) {
    const record = asRecord(item, 'UiPanel');
    if (!record.ok) return record;

    const panelId = readString(record.value, 'panelId');
    const x = readNumber(record.value, 'x', 0);
    const y = readNumber(record.value, 'y', 0);
    const width = readNumber(record.value, 'width', 1);
    const height = readNumber(record.value, 'height', 1);
    if (!panelId.ok || !x.ok || !y.ok || !width.ok || !height.ok) {
      return validationError<UiPanelLayoutConfig[]>(panelId, x, y, width, height);
    }
    if (ids.has(panelId.value)) {
      return fail(ErrorCode.ConfigInvalid, `Duplicate UI panel ${panelId.value}`, record.value);
    }
    if (x.value + width.value > designWidth || y.value + height.value > designHeight) {
      return fail(ErrorCode.ConfigInvalid, `UI panel ${panelId.value} exceeds design bounds`, record.value);
    }
    ids.add(panelId.value);
    parsed.push({ panelId: panelId.value, x: x.value, y: y.value, width: width.value, height: height.value });
  }

  return ok(parsed);
}
