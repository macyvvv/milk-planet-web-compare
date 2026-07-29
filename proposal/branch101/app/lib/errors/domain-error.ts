export class DomainError extends Error {
  constructor(
    message: string,
    readonly code: string,
  ) {
    super(message);
    this.name = "DomainError";
  }
}

export function userFacingError(error: unknown, fallback = "処理に失敗しました。"): string {
  return error instanceof DomainError ? error.message : fallback;
}
