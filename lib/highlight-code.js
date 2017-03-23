var hljs = require('highlight.js');

hljs.configure({
  tabReplace: '  '
});

module.exports = function highlightCode(code, lang) {
  try {
    var markup = lang ? hljs.highlight(lang, code).value : hljs.highlightAuto(code).value;
    return hljs.fixMarkup(markup);
  } catch (ex) {
    return code;
  }
}
