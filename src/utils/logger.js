const fs = require('fs');

class Logger {
  constructor(file) {
    this.file = file;
  }

  log(json) {
    const data = JSON.stringify({
      ...json,
      date: Date.now(),
    });
    fs.appendFileSync(this.file, data + '\n');
  }
}

module.exports = {Logger};
