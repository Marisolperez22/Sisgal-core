import { format, transports } from 'winston';

export const auditTransports = [
  new transports.Console(),

  new transports.File({
    filename: 'logs/audit.log',
  }),
];

export const auditFormat = format.combine(
  format.timestamp(),
  format.json(),
);