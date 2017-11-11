var assign =
  Object.assign ||
  function(obj1, obj2) {
    for (var name in obj2) {
      if (obj2.hasOwnProperty(name)) obj1[name] = obj2[name];
    }
    return obj1;
  };

function NormalizeWhitespace(defaults) {
  this.defaults = assign({}, defaults);
}

function toCamelCase(value) {
  return value.replace(/-(\w)/g, function(match, firstChar) {
    return firstChar.toUpperCase();
  });
}

function tabLen(str) {
  var res = 0;
  for (var i = 0; i < str.length; ++i) {
    if (str.charCodeAt(i) == '\t'.charCodeAt(0)) res += 3;
  }
  return str.length + res;
}

NormalizeWhitespace.prototype = {
  setDefaults: function(defaults) {
    this.defaults = assign(this.defaults, defaults);
  },
  normalize: function(input, settings) {
    settings = assign(this.defaults, settings);

    for (var name in settings) {
      var methodName = toCamelCase(name);
      if (
        name !== 'normalize' &&
        methodName !== 'setDefaults' &&
        settings[name] &&
        this[methodName]
      ) {
        input = this[methodName].call(this, input, settings[name]);
      }
    }

    return input;
  },

  /*
   * Normalization methods
   */
  leftTrim: function(input) {
    return input.replace(/^\s+/, '');
  },
  rightTrim: function(input) {
    return input.replace(/\s+$/, '');
  },
  tabsToSpaces: function(input, spaces) {
    spaces = spaces | 0 || 4;
    return input.replace(/\t/g, new Array(++spaces).join(' '));
  },
  spacesToTabs: function(input, spaces) {
    spaces = spaces | 0 || 4;
    return input.replace(new RegExp(' {' + spaces + '}', 'g'), '\t');
  },
  removeTrailing: function(input) {
    return input.replace(/\s*?$/gm, '');
  },
  // Support for deprecated plugin remove-initial-line-feed
  removeInitialLineFeed: function(input) {
    return input.replace(/^(?:\r?\n|\r)/, '');
  },
  removeIndent: function(input) {
    var indents = input.match(/^[^\S\n\r]*(?=\S)/gm);

    if (!indents || !indents[0].length) return input;

    indents.sort(function(a, b) {
      return a.length - b.length;
    });

    if (!indents[0].length) return input;

    return input.replace(new RegExp('^' + indents[0], 'gm'), '');
  },
  indent: function(input, tabs) {
    return input.replace(
      /^[^\S\n\r]*(?=\S)/gm,
      new Array(++tabs).join('\t') + '$&'
    );
  },
  breakLines: function(input, characters) {
    characters = characters === true ? 80 : characters | 0 || 80;

    var lines = input.split('\n');
    for (var i = 0; i < lines.length; ++i) {
      if (tabLen(lines[i]) <= characters) continue;

      var line = lines[i].split(/(\s+)/g),
        len = 0;

      for (var j = 0; j < line.length; ++j) {
        var tl = tabLen(line[j]);
        len += tl;
        if (len > characters) {
          line[j] = '\n' + line[j];
          len = tl;
        }
      }
      lines[i] = line.join('');
    }
    return lines.join('\n');
  }
};

module.exports = NormalizeWhitespace;
