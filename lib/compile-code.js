var babylon = require('babylon');
var types = require('babel-types');

var helper = require('./helper');

var traverse = helper.interopRequireDefault(require('babel-traverse')).default;
var template = helper.interopRequireDefault(require('babel-template')).default;

var demoBodyTemplate = template(
'  (function() {\n' +
'    BODY\n' +
'    return function() {'
'      return REACT_NODE;\n' +
'    };\n' +
'  })();\n'
);

function isReactDOMRenderMemberExpression(node) {
  return types.isMemberExpression(node) &&
    types.isIdentifier(node.object, { name: 'ReactDOM' }) &&
    types.isIdentifier(node.property, { name: 'render' });
}

function isReactDOMRenderCallExpressionStatement(node) {
  return types.isExpressionStatement(node) &&
    types.isCallExpression(node.expression) &&
    isReactDOMRenderMemberExpression(node.expression.callee);
}

function getReactDOMRenderNodeArgument(node, context) {
  var args = node.expression.arguments;
  if (args.length < 2) {
    context.emitError('ReactDOM.render requires at least two arguments');
    return null;
  }

  return args[0];
}

module.exports = function compileCode(code, context) {
  var ast = babylon.parse(code, {
    sourceType: 'module',
    plugins: [
      'jsx',
      'flow',
      'doExpressions',
      'objectRestSpread',
      'decorators',
      'classProperties',
      'exportExtensions',
      'asyncGenerators',
      'functionBind',
      'functionSent',
      'dynamicImport'
    ]
  });
  var imports = [];
  var reactNode;

  helper.fixJSXAttributeStringLiteral(ast);

  traverse(ast, {
    enter: function (path) {
      var node = path.node;
      if (types.isImportDeclaration(node)) {
        imports.push(node);
        path.remove();
      } else if (isReactDOMRenderCallExpressionStatement(node)) {
        reactNode = getReactDOMRenderNodeArgument(node, context);
        path.remove();
      }
    }
  });

  var demo = demoBodyTemplate({
    BODY: ast,
    REACT_NODE: reactNode
  });

  return {
    body: demo,
    imports: imports,
    src: code
  };
}
