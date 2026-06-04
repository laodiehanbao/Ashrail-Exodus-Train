export interface IAnalyticsService {
  track(eventName: string, payload?: Record<string, unknown>): void;
}
