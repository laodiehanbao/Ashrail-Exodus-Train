export interface FloatingTextRequest {
  textKey: string;
  amount: number;
}

export class FloatingTextController {
  readonly queue: FloatingTextRequest[] = [];

  enqueue(request: FloatingTextRequest): void {
    this.queue.push(request);
  }
}
