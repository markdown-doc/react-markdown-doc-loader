/**
 * 对markdown文件做一些处理，主要是加一下class，id之类的东西
 */

var unistIs = require('unist-util-is');
var getNodeText = require('mdast-util-to-string');
var unified = require('unified');
var toHAST = require('mdast-util-to-hast');
var hastToHtml = require('hast-util-to-html');
var rehypeParse = require('rehype-parse');
var visit = require('unist-util-visit');
var u = require('unist-builder');
var transliteration = require('transliteration');
var _ = require('lodash');
var highlightCode = require('./highlight-code');

var htmlToHast = unified()
  .use(rehypeParse, { fragment: true })
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

function createAnchorLink(name) {
  return u('link', {
    title: null,
    url: '#' + name
  }, [
    u('text', '¶')
  ]);
}

function createAnchorPoint(id) {
  return Object.assign({}, u('link', {
    title: null,
    url: 'javascript:void(0)'
  }), {
    data: {
      hProperties: {
        id: id,
        className: 'anchor-point'
      }
    }
  })
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
      var nameASCII = transliteration.slugify(text);

      return Object.assign({}, node, {
        children: [createAnchorLink(nameASCII), createAnchorPoint(nameASCII)].concat(node.children || []),
        data: {
          hProperties: {
            className: 'anchor-heading'
          }
        }
      });
    }
  },

  // Rename to code-block to distinguish from inline code
  // Will be converted back to code later
  {
    test: is('code'),
    transform: function(node) {
      return Object.assign({}, node, {
        value: node.value.replace(/\t/ig, '  '), // replace tab with space
        data: {
          hName: 'code-block',
          hProperties: {
            className: node.lang
          }
        }
      });
    }
  }
];

module.exports = function compileMarkdown(mdast, context) {
  var newMdAst = map(mdast, function (node, index, parent) {
    return transformers.reduce(function (prevNode, t) {
      if (t.test(prevNode)) {
        return t.transform(prevNode);
      }

      return prevNode;
    }, node);
  });

  var hast = toHAST(newMdAst);
  visit(hast, 'element', function(node) {
    if (node.tagName === 'code-block' && node.children && node.children.length > 0 && node.children[0].type === 'text') {
      var className = node.properties.className;
      var hlHtml = highlightCode(node.children[0].value, node.properties.className || 'jsx');
      var hlHast = htmlToHast.parse(hlHtml);

      node.tagName = 'code'; // rename back to code
      node.children = hlHast.children;
      node.properties.className = className ? 'language-' + className : 'language-text';
    }
  });

  return hastToHtml(hast);
};
