## zandoc-react-loader

A webpack loader to convert `zandoc-loader`'s output to React component.

### Usage

Use as a webpack loader

```
{
	module: {
		rules: [
			{
			test: /\.md$/,
			use: [
				'babel-loader',
				'zandoc-react-loader',
				'zandoc-loader'
			]
			}
		]
	}
}
```

### Options

* `jsTemplate`: path to js template file, supports lodash's template syntax. 

Available properties in the template: 

* `sections`: All sections in the file, `style`, `demo` and `markdown`. 
Styles are compiled to css with `precss`
demos are code fragments that return a React node
markdowns are compiled to html

* `imports`: All imports from demos

Take a look at `sample/template.js`.
