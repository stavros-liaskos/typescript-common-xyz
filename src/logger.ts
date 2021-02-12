import { createLogger, format, transports } from 'winston';
import Transport from 'winston-transport';
import { ConsoleTransportOptions } from 'winston/lib/winston/transports';
import { Response } from 'node-fetch';

class FingersCrossedTransport extends Transport {
  private decoratedTransport: Transport;
  private infoStore: any[];
  private loggingEnabled: boolean;
  private logLevel: string;

  constructor(decoratedTransport: Transport, options?: ConsoleTransportOptions) {
    super(options);
    this.reset();
    this.logLevel = process.env.FINGERS_CROSSED_LOG_LEVEL || 'info';
    if (decoratedTransport.log === undefined) {
      throw new Error('transport has no log method');
    }
    this.decoratedTransport = decoratedTransport;
  }

  log(info: any, next: () => void): any {
    setImmediate(() => {
      this.emit('logged', info);
    });

    if (!this.loggingEnabled && info[Symbol.for('level')] !== this.logLevel) {
      this.infoStore.push(info);

      next();

      return;
    }

    this.loggingEnabled = true;

    this.infoStore.forEach((infoStoreObject) => {
      if (this.decoratedTransport.log !== undefined) {
        // tslint:disable-next-line:no-empty
        this.decoratedTransport.log(infoStoreObject, () => {});
      }
    });

    this.infoStore = [];

    if (this.decoratedTransport.log !== undefined) {
      this.decoratedTransport.log(info, next);
    }
  }

  reset() {
    this.infoStore = [];
    this.loggingEnabled = false;
  }
}
const handleResponse = format((info, opts) => {
  const splat = Symbol.for('splat');

  // @ts-ignore
  const obj = info[splat];

  if (Array.isArray(obj)) {
    // @ts-ignore
    info[splat] = obj.map((object) => {
      if (object instanceof Response) {
        return {
          body: object.buffer(),
          status: object.status,
        };
      }

      return object;
    });
  }

  return info;
});

const transport = new FingersCrossedTransport(new transports.Console());

const DEFAULT_LOGGER_CONFIG = {
  level: process.env.LOG_LEVEL || 'info',
  format: format.combine(
    handleResponse(),
    format.colorize(),
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  transports: [transport],
};

export const logger = createLogger(DEFAULT_LOGGER_CONFIG);
