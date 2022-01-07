const fs = require('fs');
const path = require('path');

class Logger {
  file;
  uid;
  suite;

  constructor({
    logDir,
    logFile,
    uid,
    suite,
  }) {
    this.uid = uid;
    this.suite = suite;
    this.file = path.join(logDir, logFile);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  setUid(uid) {
    this.uid = uid;
  }

  executionDate() {
    return new Date().toISOString();
  }

  prepopulated(json, level) {
    return JSON.stringify({
      level,
      ...json,
      suite: process.env.SUITE || this.suite || 'unknown',
      uid: process.env.UID || this.uid || 'unknown',
      testExecutionTime: this.executionDate(),
    });
  }

  log(json) {
    const data = this.prepopulated(json, 'INFO');
    fs.appendFileSync(this.file, data + '\n');
  }

  error(json) {
    const data = this.prepopulated(json, 'ERROR');
    fs.appendFileSync(this.file, data + '\n');
  }
}

module.exports = { Logger }
