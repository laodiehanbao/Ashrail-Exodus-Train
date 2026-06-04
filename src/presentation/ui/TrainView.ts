import type { TrainSnapshot } from '../../domain/train/Train.types.js';

export class TrainView {
  private snapshot: TrainSnapshot | null = null;

  render(snapshot: TrainSnapshot): void {
    this.snapshot = snapshot;
  }

  getSnapshot(): TrainSnapshot | null {
    return this.snapshot;
  }
}
