export interface IQuery {
  readonly id?: string;
}

export interface IQueryHandler<T extends IQuery, R> {
  execute(query: T): Promise<R>;
}
