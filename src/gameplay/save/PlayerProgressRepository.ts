import { fail, ok, type Result } from '../../core/Result.types.js';
import type { PlayerProgressSnapshot } from '../../domain/player/PlayerProgress.types.js';
import type { ISaveService } from '../../platform/save/ISaveService.js';
import { ErrorCode } from '../../shared/ErrorCodes.js';
import { createDefaultProgress, SaveVersionMigrator } from './SaveVersionMigrator.js';

export class PlayerProgressRepository {
  constructor(
    private readonly saveService: ISaveService<PlayerProgressSnapshot>,
    private readonly migrator = new SaveVersionMigrator(),
  ) {}

  async loadOrCreate(): Promise<Result<PlayerProgressSnapshot>> {
    try {
      const snapshot = await this.saveService.load();
      if (!snapshot) {
        return ok(createDefaultProgress());
      }

      return this.migrator.migrate(snapshot);
    } catch (error) {
      return fail(ErrorCode.SaveUnavailable, 'Failed to load player progress', error);
    }
  }

  async save(snapshot: PlayerProgressSnapshot): Promise<Result<void>> {
    try {
      await this.saveService.save(snapshot);
      return ok(undefined);
    } catch (error) {
      return fail(ErrorCode.SaveUnavailable, 'Failed to save player progress', error);
    }
  }
}
