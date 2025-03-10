import chalk from 'chalk';
import morgan from 'morgan';
import winston from 'winston';

export const winstonLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
}); 

export const morganLogger = morgan((tokens, req, res) => {
  const status = Number(tokens.status(req, res)) || 0;
  
  const getStatusColor = (status: number) => {
    switch (true) {
      case status >= 500: return chalk.red;
      case status >= 400: return chalk.yellow;
      case status >= 300: return chalk.cyan;
      case status >= 200: return chalk.green;
      default: return chalk.gray;
    }
  };

  return [
    chalk.blue(tokens.method(req, res)),
    chalk.white(tokens.url(req, res)),
    getStatusColor(status)(status.toString()),
    chalk.yellow(`${tokens['response-time'](req, res)}ms`),
    chalk.gray(`- ${tokens.res(req, res, 'content-length') || '0'}b`)
  ].join(' ');
})