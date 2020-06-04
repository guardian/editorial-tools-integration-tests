const fs = require('fs');
const path = require('path');

class Logger {
  constructor({ logDir, logFile }) {
    this.file = path.join(logDir, logFile);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  executionDate() {
    return new Date().toISOString();
  }

  prepopulated(json, level) {
    return JSON.stringify({
      level,
      ...json,
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

module.exports = { Logger };
