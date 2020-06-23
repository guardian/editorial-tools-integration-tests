module.exports = (on) => {
  // `on` is used to hook into various events Cypress emits
  // `config` is the resolved Cypress config
  on('task', {
    readFileMaybe(filename) {
      const fs = require('fs');
      if (fs.existsSync(filename)) {
        return fs.readFileSync(filename);
      }
      return undefined;
    },
  });
};
