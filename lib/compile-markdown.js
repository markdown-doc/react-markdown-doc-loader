/**
 * 对markdown文件做一些处理，主要是加一下class，id之类的东西
 */

var unistIs = require('unist-util-is');
var getNodeText = require('mdast-util-to-string');
var unified = require('unified');
var remarkHtml = require('remark-html');
var u = require('unist-builder');
var pinyin = require("pinyin");
var _ = require('lodash');

var markdownToHtmlProcessor = unified()
  .use(remarkHtml)
  .freeze();

function map(ast, mapFn) {
  return (function postorder(node, index, parent) {
    var newNode = node;

    if (node.children) {
      newNode = Object.assign({}, node, {
        children: node.children.map(function (child, index) {
          return postorder(child, index, node);
        })
      });
    }

    newNode = Object.assign({}, mapFn(newNode, index, parent));
    return newNode;
  }(ast, null, null));
};

function is(check) {
  return function (node) {
    return unistIs(check, node);
  };
}

function createHeaderAnchor(name) {
  return u('link', {
    title: null,
    url: '#' + name
  }, [
    u('text', '¶')
  ]);
}

/**
 * A list of transformers, runs in the order they appear in array.
 *
 * The output of the transformer is fed into the next transformer.
 */
var transformers = [
  {
    test: is('table'),
    transform: function(node) {
      return Object.assign({}, node, {
        data: {
          hProperties: {
            className: 'table'
          }
        }
      });
    }
  },

  {
    test: is('heading'),
    transform: function(node) {
      var text = getNodeText(node).slice(0, 30).toLowerCase();
      var namePinyin = _.flatten(pinyin(text, {
        style: pinyin.STYLE_NORMAL
      })).join('-');

      return Object.assign({}, node, {
        children: [createHeaderAnchor(namePinyin)].concat(node.children || []),
        data: {
          hProperties: {
            id: namePinyin
          }
        }
      });
    }
  }
];

module.exports = function compileMarkdown(mdast) {
  var newAst = map(mdast, function (node, index, parent) {
    return transformers.reduce(function (prevNode, t) {
      if (t.test(prevNode)) {
        return t.transform(prevNode);
      }

      return prevNode;
    }, node);
  });

  return markdownToHtmlProcessor.stringify(newAst);
};
