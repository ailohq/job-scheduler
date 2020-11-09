/* eslint-disable @typescript-eslint/no-explicit-any */

export interface LoggerInterface {
  debug(...data: any[]): void;
  error(...data: any[]): void;
  info(...data: any[]): void;
  log(...data: any[]): void;
  warn(...data: any[]): void;
}
