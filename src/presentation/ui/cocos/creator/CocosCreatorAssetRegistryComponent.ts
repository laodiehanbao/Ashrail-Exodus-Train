import { _decorator, CCString, Color, Component, SpriteFrame } from 'cc';

const { ccclass, property } = _decorator;

interface CocosCreatorColorTokenEntry {
  token: string;
  hex: string;
}

@ccclass('CocosCreatorAssetRegistryComponent')
export class CocosCreatorAssetRegistryComponent extends Component {
  @property({ type: [CCString] })
  spriteFrameAssetIds: string[] = [];

  @property({ type: [SpriteFrame] })
  spriteFrames: SpriteFrame[] = [];

  @property({ multiline: true })
  colorTokensJson = '[]';

  private colorTokenCache: Map<string, string> | null = null;

  resolveSpriteFrame(assetId: string): SpriteFrame | null {
    const index = this.spriteFrameAssetIds.findIndex((entryAssetId) => entryAssetId === assetId);
    return index >= 0 ? this.spriteFrames[index] ?? null : null;
  }

  resolveColor(token: string | undefined): Color | null {
    const hex = token ? this.getColorTokens().get(token) : undefined;
    return hex ? colorFromHex(hex) : null;
  }

  private getColorTokens(): Map<string, string> {
    if (!this.colorTokenCache) {
      this.colorTokenCache = parseColorTokens(this.colorTokensJson);
    }
    return this.colorTokenCache;
  }
}

function parseColorTokens(json: string): Map<string, string> {
  const entries = parseColorTokenEntries(json);
  return new Map(entries.map((entry) => [entry.token, entry.hex]));
}

function parseColorTokenEntries(json: string): CocosCreatorColorTokenEntry[] {
  try {
    const raw = JSON.parse(json) as unknown;
    if (!Array.isArray(raw)) return [];
    return raw.filter(isColorTokenEntry);
  } catch {
    return [];
  }
}

function isColorTokenEntry(value: unknown): value is CocosCreatorColorTokenEntry {
  if (!value || typeof value !== 'object') return false;
  const record = value as Record<string, unknown>;
  return typeof record.token === 'string' && typeof record.hex === 'string';
}

function colorFromHex(hex: string): Color {
  const normalized = hex.replace('#', '');
  const value = Number.parseInt(normalized, 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  return new Color(r, g, b, 255);
}
