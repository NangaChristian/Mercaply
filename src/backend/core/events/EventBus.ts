import { IDomainEvent, IEventHandler } from './DomainEvent.js';
import { logger } from '../logger/Logger.js';

export interface IEventBus {
  publish(event: IDomainEvent): Promise<void>;
  subscribe<T extends IDomainEvent>(eventName: string, handler: IEventHandler<T>): void;
}

export class InMemoryEventBus implements IEventBus {
  private handlers: Map<string, IEventHandler<any>[]> = new Map();

  subscribe<T extends IDomainEvent>(eventName: string, handler: IEventHandler<T>): void {
    if (!this.handlers.has(eventName)) {
      this.handlers.set(eventName, []);
    }
    this.handlers.get(eventName)!.push(handler);
    logger.debug(`Subscribed to event: ${eventName}`);
  }

  async publish(event: IDomainEvent): Promise<void> {
    const handlers = this.handlers.get(event.eventName);
    if (handlers) {
      logger.info(`Publishing event: ${event.eventName}`, { eventId: event.id });
      // In Enterprise: Push to BullMQ or Kafka for reliable processing
      const promises = handlers.map(handler => 
        handler.handle(event).catch(err => {
          logger.error(`Error handling event ${event.eventName}`, err);
          // Retry logic would go here in a distributed system
        })
      );
      await Promise.allSettled(promises);
    }
  }
}

export const eventBus = new InMemoryEventBus();
