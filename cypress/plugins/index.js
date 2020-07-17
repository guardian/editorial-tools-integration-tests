const browserify = require('@cypress/browserify-preprocessor');
const fs = require('fs');
const { cookie } = require('../../src/utils/cookie');

module.exports = (on) => {
  // `on` is used to hook into various events Cypress emits
  // `config` is the resolved Cypress config
  on('task', {
    async getCookie(stage) {
      return await cookie(stage, false);
    },
    readFileMaybe(filename) {
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
