export interface ICommand {
  readonly id?: string;
}

export interface ICommandHandler<T extends ICommand, R = void> {
  execute(command: T): Promise<R>;
}
