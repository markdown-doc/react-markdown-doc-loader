var chalk = require('chalk');
var prismLoader = require('./prism/loader');
var Normalizer = require('./prism/prism-normalize-whitespace');

var prism = prismLoader.createInstance(prismLoader.languages);
var nw = new Normalizer({
  'remove-trailing': true,
  // 'remove-indent': true,
  'left-trim': true,
  'right-trim': true,
  // 'break-lines': 80,
  // indent: 2,
  'remove-initial-line-feed': true,
  'tabs-to-spaces': 2
  // 'spaces-to-tabs': 2
});

module.exports = function highlightCode(code, lang) {
  try {
    var normalizedCode = nw.normalize(code);
    var markup = prism.highlight(normalizedCode, prism.languages[lang]);
    return markup;
  } catch (ex) {
    console.warn(chalk.yellow('\nreact-markdown-doc-loader: highlight failed for lang: ' + lang));
    return normalizedCode || code;
  }
};
