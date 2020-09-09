import fs from 'fs';
import path from 'path';

type LogData = { [key: string]: any };

export class Logger {
  file: string;
  constructor({ logDir, logFile }: { logDir: string; logFile: string }) {
    this.file = path.join(logDir, logFile);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  executionDate() {
    return new Date().toISOString();
  }

  prepopulated(json: LogData, level: string) {
    return JSON.stringify({
      level,
      ...json,
      testExecutionTime: this.executionDate(),
    });
  }

  log(json: LogData) {
    const data = this.prepopulated(json, 'INFO');
    fs.appendFileSync(this.file, data + '\n');
  }

  error(json: LogData) {
    const data = this.prepopulated(json, 'ERROR');
    fs.appendFileSync(this.file, data + '\n');
  }
}

module.exports = { Logger };
