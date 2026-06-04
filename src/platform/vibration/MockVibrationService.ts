import type { IVibrationService } from './IVibrationService.js';

export class MockVibrationService implements IVibrationService {
  vibrateLight(): void {
    return;
  }
}
