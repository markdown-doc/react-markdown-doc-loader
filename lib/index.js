var fs = require('fs');
var path = require('path');
var _ = require('lodash');
var utils = require('zandoc-loader-utils');
var loaderUtils = require('loader-utils');
var helper = require('./helper');
var template = helper.interopRequireDefault(require('babel-template')).default;
var compileStyle = require('./compile-style');
var compileCode = require('./compile-code');
var compileMarkdown = require('./compile-markdown');
var uniqImports = require('./uniq-imports');
var highlightCode = require('./highlight-code');

function gensym() {
  return 'ReactDemo__' + Date.now() + _.uniqueId('__');
}

/**
 * Do not generate jsx ast, babel escapes all strings in jsx which will result in incorrect jsx output
 */
function prepareAST(sections) {
  sections = sections.map(function(s) {
    if (s.type === 'demo') {
      return Object.assign(s, {
        id: gensym(),
        src: highlightCode(s.src, 'javascript')
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
  var docSections = sections.map(function(s) {
    if (s.type === 'style') {
      return helper.createStyle(s.value);
    } else if (s.type === 'markdown') {
      return helper.createMarkdown(s.value);
    } else if (s.type === 'demo') {
      return helper.createDemo(s.title, s.src, s.id);
    }
  });

  return {
    IMPORTS: importsWithFixAST,
    DEMO_DECLARATIONS: demoDeclarationASTs,
    SECTIONS: docSections
  };
}

module.exports = function (content) {
  var options = loaderUtils.getOptions(this);
  var componentTemplate = template(fs.readFileSync(options.jsTemplate, { encoding: 'utf-8' }), {
    sourceType: 'module',
    plugins: ['jsx', 'classProperties']
  });

  var callback = this.async();
  if (!callback) {
    return this.emitError('zandoc-react-loader must run asynchronously');
  }

  Promise.all(utils.map(content, {
    style: function (node) {
      return compileStyle(node.value).then(function (css) {
        return {
          type: 'style',
          value: css
        };
      });
    },

    demo: function(node){
      var compiled = compileCode(node.value);
      return Promise.resolve(Object.assign(compiled, {
        type: 'demo',
        title: compileMarkdown(node.title)
      }));
    },

    markdown: function(node){
      return Promise.resolve({
        type: 'markdown',
        value: compileMarkdown(node)
      });
    }
  })).then(function (sections) {
    var quasiquotes = prepareAST(sections);
    var tmpl = helper.wrapInProgram(componentTemplate(quasiquotes));
    var comp = helper.generateCode(tmpl);

    callback(null, comp);
  }).catch(function (error) {
    callback(error);
  });
};
