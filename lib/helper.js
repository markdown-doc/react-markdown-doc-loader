function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

var generate = _interopRequireDefault(require('babel-generator')).default;
var types = require('babel-types');
var traverse = _interopRequireDefault(require('babel-traverse')).default;

exports.interopRequireDefault = _interopRequireDefault;

exports.generateCode = function generateCode(ast) {
  return generate(ast, {
    retainFunctionParens: true
  }).code;
};

exports.wrapInProgram = function wrapInProgram(body) {
  return types.program(body);
};

exports.createMarkdown = function(html, renderer) {
  return types.callExpression(
    types.memberExpression(
      types.identifier('React'),
      types.identifier('createElement')
    ),
    [
      types.identifier(renderer),
      types.objectExpression([
        types.objectProperty(
          types.identifier('html'),
          types.stringLiteral(html)
        )
      ])
    ]
  );
};

exports.createStyle = function(style, renderer) {
  return types.callExpression(
    types.memberExpression(
      types.identifier('React'),
      types.identifier('createElement')
    ),
    [
      types.identifier(renderer),
      types.objectExpression([
        types.objectProperty(
          types.identifier('style'),
          types.stringLiteral(style)
        )
      ])
    ]
  );
}

exports.createConstDeclaration = function(id, init) {
  return types.variableDeclaration(
    'const',
    [types.variableDeclarator(
      types.identifier(id),
      init
    )]
  );
};

exports.createDemo = function(title, src, id, renderer) {
  return types.callExpression(
    types.memberExpression(
      types.identifier('React'),
      types.identifier('createElement')
    ),
    [
      types.identifier(renderer),
      types.objectExpression([
        types.objectProperty(
          types.identifier('title'),
          types.stringLiteral(title)
        ),
        types.objectProperty(
          types.identifier('src'),
          types.stringLiteral(src)
        ),
        types.objectProperty(
          types.identifier('demo'),
          types.identifier(id)
        )
      ])
    ]
  );
};

exports.fixJSXAttributeStringLiteral = function(ast) {
  traverse(ast, {
    JSXAttribute: function(path) {
      var node = path.node;
      var value = node.value;

      // babel has trouble generating jsx string attributes
      // Wrap in an expression to fix string escape
      if (types.isStringLiteral(value)) {
        node.value = types.jSXExpressionContainer(value);
      }
    }
  });

  return ast;
};
