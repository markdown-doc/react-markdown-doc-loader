function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

var generate = _interopRequireDefault(require('babel-generator')).default;
var types = require('babel-types');

exports.interopRequireDefault = _interopRequireDefault;

exports.generateCode = function generateCode(ast) {
  return generate(ast, {
    retainFunctionParens: true
  }).code;
};

exports.wrapInProgram = function wrapInProgram(body) {
  return types.program(body);
};

exports.createMarkdown = function(html) {
  return types.callExpression(
    types.memberExpression(
      types.identifier('React'),
      types.identifier('createElement')
    ),
    [
      types.identifier('Markdown'),
      types.objectExpression([
        types.objectProperty(
          types.identifier('html'),
          types.stringLiteral(html)
        )
      ])
    ]
  );
};

exports.createStyle = function(style) {
  return types.callExpression(
    types.memberExpression(
      types.identifier('React'),
      types.identifier('createElement')
    ),
    [
      types.identifier('Style'),
      types.objectExpression([
        types.objectProperty(
          types.identifier('style'),
          types.stringLiteral(style)
        )
      ])
    ]
  );
}

// exports.createRawHtmlRenderer = function(tag, html) {
//   return types.callExpression(
//     types.memberExpression(
//       types.identifier('React'),
//       types.identifier('createElement')
//     ),
//     [
//       types.identifier('RawHtmlRenderer'),
//       types.objectExpression([
//         types.objectProperty(
//           types.identifier('tag'),
//           types.stringLiteral(tag)
//         ),
//         types.objectProperty(
//           types.identifier('html'),
//           types.stringLiteral(html)
//         )
//       ])
//     ]
//   );
// };

exports.createConstDeclaration = function(id, init) {
  return types.variableDeclaration(
    'const',
    [types.variableDeclarator(
      types.identifier(id),
      init
    )]
  );
};

exports.createDemo = function(title, src, id) {
  return types.callExpression(
    types.memberExpression(
      types.identifier('React'),
      types.identifier('createElement')
    ),
    [
      types.identifier('DemoRenderer'),
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
