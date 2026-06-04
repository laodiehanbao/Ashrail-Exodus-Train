import type { IAnalyticsService } from './IAnalyticsService.js';

export class MockAnalyticsService implements IAnalyticsService {
  readonly events: Array<{ eventName: string; payload?: Record<string, unknown> }> = [];

  track(eventName: string, payload?: Record<string, unknown>): void {
    this.events.push({ eventName, payload });
  }
}
