var postcss = require('postcss');
var precss = require('precss');
var autoprefixer = require('autoprefixer');

module.exports = function compileStyle(content, context) {
  return postcss([precss, autoprefixer])
    // WTF, ask postcss why `from: undefined` is needed
    // https://github.com/ionic-team/ionic/issues/13763
    .process(content, { from: undefined })
    .then(function (result) {
      return result.css;
    });
}
