var hljs = require('highlight.js');

module.exports = function highlightCode(code) {
  return hljs.highlight('javascript', code).value;
}
