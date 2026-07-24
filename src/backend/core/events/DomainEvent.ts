export interface IDomainEvent {
  readonly id: string;
  readonly eventName: string;
  readonly occurredOn: Date;
  readonly payload: any;
}

export abstract class DomainEvent implements IDomainEvent {
  public readonly id: string;
  public readonly occurredOn: Date;

  constructor(
    public readonly eventName: string,
    public readonly payload: any
  ) {
    this.id = crypto.randomUUID();
    this.occurredOn = new Date();
  }
}

export interface IEventHandler<T extends IDomainEvent> {
  handle(event: T): Promise<void>;
}
