var fs = require('fs');
var utils = require('markdown-doc-loader-utils');
var loaderUtils = require('loader-utils');
var helper = require('./helper');
var template = helper.interopRequireDefault(require('@babel/template')).default;
var compileStyle = require('./compile-style');
var compileCode = require('./compile-code');
var compileMarkdown = require('./compile-markdown');
var uniqImports = require('./uniq-imports');
var highlightCode = require('./highlight-code');
var defaultOptions = require('./default-options');

// var beautyConsole = require('./lib').beautyConsole;

/**
 * Do not generate jsx ast, babel escapes all strings in jsx which will result in incorrect jsx output
 */
function prepareAST(sections, options) {
  sections = sections.map(function(s) {
    if (s.type === 'demo') {
      return Object.assign(s, {
        id: s.demoID,
        src: highlightCode(s.src, 'jsx')
      });
    }

    return s;
  });

  var demos = sections.filter(function(s) {
    return s.type === 'demo';
  });

  // 合并import以及重名的fix声明
  var imports = uniqImports(
    demos.reduce(function(acc, d) {
      return acc.concat(d.imports)
    }, [])
  );
  var importsWithFixAST = [].concat(imports.imports, imports.fixes);

  // demo的声明
  var demoDeclarationASTs = demos.map(function (d) {
    return helper.createConstDeclaration(d.id, d.body.expression);
  });

  // 文档渲染
  var renderers = options.renderers;
  var docSections = sections.map(function(s) {
    var secType = s.type;
    var renderer = renderers[secType];
    if (secType === 'style') {
      return helper.createStyle(s.value, renderer);
    } else if (secType === 'markdown') {
      return helper.createMarkdown(s.value, renderer);
    } else if (secType === 'demo') {
      return helper.createDemo(s.title, s.src, s.id, renderer);
    }
  });

  return {
    IMPORTS: importsWithFixAST,
    DEMO_DECLARATIONS: demoDeclarationASTs,
    SECTIONS: docSections
  };
}

module.exports = function (content) {
  var options = Object.assign({}, defaultOptions, loaderUtils.getOptions(this));
  var componentTemplate = template(fs.readFileSync(options.jsTemplate, { encoding: 'utf-8' }), {
    sourceType: 'module',
    plugins: ['jsx', 'classProperties']
  });

  var callback = this.async();
  if (!callback) {
    return this.emitError('react-markdown-doc-loader must run asynchronously');
  }
  var context = this;

  Promise.all(utils.map(content, {
    style: function (node) {
      return compileStyle(node.value, context).then(function (css) {
        return {
          type: 'style',
          value: css
        };
      });
    },

    demo: function(node){
      var compiled = compileCode(node.value, context);
      return Promise.resolve(Object.assign(compiled, {
        type: 'demo',
        title: (node.yaml && node.yaml.title) || '',
        demoID: node.demoID
      }));
    },

    markdown: function(node){
      return Promise.resolve({
        type: 'markdown',
        value: compileMarkdown(node, context)
      });
    }
  })).then(function (sections) {
    var quasiquotes = prepareAST(sections, options);
    var tmpl = helper.wrapInProgram(componentTemplate(quasiquotes));
    var comp = helper.generateCode(tmpl);

    callback(null, comp);
  }).catch(function (error) {
    callback(error);
  });
};
