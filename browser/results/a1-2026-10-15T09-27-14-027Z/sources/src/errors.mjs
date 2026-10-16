export class BrowserError extends Error {
  constructor(code, message = code, details = {}) {
    super(message);
    this.name = 'BrowserError';
    this.code = code;
    this.details = details;
  }
  toJSON() { return {code: this.code, message: this.message, details: this.details}; }
}
export function requireValue(condition, code, message) {
  if (!condition) throw new BrowserError(code, message);
}
