var hljs = require('highlight.js');

hljs.configure({
  tabReplace: '  '
});

module.exports = function highlightCode(code) {
  var markup = hljs.highlight('javascript', code).value;
  return hljs.fixMarkup(markup);
}
