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

exports.createRawHtmlRenderer = function(tag, html) {
  return types.callExpression(
    types.memberExpression(
      types.identifier('React'),
      types.identifier('createElement')
    ),
    [
      types.identifier('RawHtmlRenderer'),
      types.objectExpression([
        types.objectProperty(
          types.identifier('tag'),
          types.stringLiteral(tag)
        ),
        types.objectProperty(
          types.identifier('html'),
          types.stringLiteral(html)
        )
      ])
    ]
  );


  // return types.jSXElement(
  //   types.jSXOpeningElement(
  //     types.jSXIdentifier('RawHtmlRenderer'),
  //     [
  //       types.jSXAttribute(
  //         types.jSXIdentifier('tag'),
  //         types.stringLiteral(tag)
  //       ),
  //       types.jSXAttribute(
  //         types.jSXIdentifier('html'),
  //         types.stringLiteral(html)
  //       )
  //     ],
  //     true
  //   ),
  //   null,
  //   []
  // );
};

exports.createConstDeclaration = function(id, init) {
  return types.variableDeclaration(
    'const',
    [types.variableDeclarator(
      types.identifier(id),
      init
    )]
  );
};

exports.createDemoRenderer = function(title, src, id) {
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

  // return types.jSXElement(
  //   types.jSXOpeningElement(
  //     types.jSXIdentifier('DemoRenderer'),
  //     [
  //       types.jSXAttribute(
  //         types.jSXIdentifier('title'),
  //         types.stringLiteral(title)
  //       ),
  //       types.jSXAttribute(
  //         types.jSXIdentifier('src'),
  //         types.stringLiteral(src)
  //       ),
  //       types.jSXAttribute(
  //         types.jSXIdentifier('demo'),
  //         types.jSXExpressionContainer(types.identifier(id))
  //       )
  //     ],
  //     true
  //   ),
  //   null,
  //   []
  // )
};

exports.createDocContainerElement = function(children) {
  return types.callExpression(
    types.memberExpression(
      types.identifier('React'),
      types.identifier('createElement')
    ),
    [
      types.stringLiteral('div'),
      types.objectExpression([
        types.objectProperty(
          types.identifier('className'),
          types.stringLiteral('zandoc-react-container')
        )
      ])
    ].concat(children)
  );

  // return types.jSXElement(
  //   types.jSXOpeningElement(
  //     types.jSXIdentifier('div'),
  //     [
  //       types.jSXAttribute(
  //         types.jSXIdentifier('className'),
  //         types.stringLiteral('zent-doc-container')
  //       )
  //     ]
  //   ),
  //   types.jSXClosingElement(
  //     types.jSXIdentifier('div')
  //   ),
  //   children
  // );
}
