export type Result<V, E> = Ok<V> | Err<E>;

export function success<V, E>(value: V): Result<V, E> {
  return new Ok(value);
}
export function failure<V, E>(error: E): Result<V, E> {
  return new Err(error);
}

class Ok<V> {
  readonly value: V;

  constructor(value: V) {
    this.value = value;
  }

  isOk(): this is Ok<V> {
    return true;
  }

  isErr(): this is Err<never> {
    return false;
  }
}

class Err<E> {
  readonly value: E;

  constructor(error: E) {
    this.value = error;
  }

  isOk(): this is Ok<never> {
    return false;
  }

  isErr(): this is Err<E> {
    return true;
  }
}
