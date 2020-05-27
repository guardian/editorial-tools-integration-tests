const fs = require('fs');
const path = require('path');

class Logger {
  constructor({logDir, logFile}) {
    this.file = path.join(logDir, logFile);
    fs.mkdirSync(logDir, {recursive: true});
  }

  executionDate() {
    return new Date();
  }

  log(json) {
    const data = JSON.stringify({
      ...json,
      testExecutionDate: this.executionDate(),
      level: 'INFO',
    });
    fs.appendFileSync(this.file, data + '\n');
  }

  error(json) {
    const data = JSON.stringify({
      ...json,
      testExecutionDate: this.executionDate(),
      level: 'ERROR',
    });
    fs.appendFileSync(this.file, data + '\n');
  }
}

module.exports = {Logger};
