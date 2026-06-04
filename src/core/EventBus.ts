import type { GameEvent } from '../shared/GameEvents.events.js';

type Handler<TEvent extends GameEvent> = (event: TEvent) => void;

export class EventBus {
  private readonly handlers = new Map<GameEvent['type'], Set<Handler<GameEvent>>>();

  on<TType extends GameEvent['type']>(
    type: TType,
    handler: Handler<Extract<GameEvent, { type: TType }>>,
  ): () => void {
    const typedHandler = handler as Handler<GameEvent>;
    const currentHandlers = this.handlers.get(type) ?? new Set<Handler<GameEvent>>();
    currentHandlers.add(typedHandler);
    this.handlers.set(type, currentHandlers);

    return () => {
      currentHandlers.delete(typedHandler);
    };
  }

  emit(event: GameEvent): void {
    const currentHandlers = this.handlers.get(event.type);
    if (!currentHandlers) {
      return;
    }

    for (const handler of currentHandlers) {
      handler(event);
    }
  }
}
