import fs from 'fs';
import path from 'path';

type LogData = { [key: string]: any };

export class Logger {
  file: string;
  private uid: string | undefined;
  private suite: string | undefined;
  constructor({
    logDir,
    logFile,
    uid,
    suite,
  }: {
    logDir: string;
    logFile: string;
    uid?: string;
    suite?: string;
  }) {
    this.uid = uid;
    this.suite = suite;
    this.file = path.join(logDir, logFile);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  setUid(uid: string) {
    this.uid = uid;
  }

  setSuite(suite: string) {
    this.suite = suite;
  }

  executionDate() {
    return new Date().toISOString();
  }

  prepopulated(json: LogData, level: string) {
    return JSON.stringify({
      level,
      ...json,
      suite: process.env.SUITE || this.suite || 'unknown',
      uid: process.env.UID || this.uid || 'unknown',
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
