const browserify = require('@cypress/browserify-preprocessor');

module.exports = (on) => {
  // `on` is used to hook into various events Cypress emits
  // `config` is the resolved Cypress config
  on('task', {
    async getCookie(stage) {
      const { cookie } = require('../../src/utils/cookie.js');
      return await cookie(stage, false);
    },
    readFileMaybe(filename) {
      const fs = require('fs');
      if (fs.existsSync(filename)) {
        return fs.readFileSync(filename);
      }
      return undefined;
    },
  });
  on(
    'file:preprocessor',
    browserify({
      typescript: require.resolve('typescript'),
    })
  );
};
