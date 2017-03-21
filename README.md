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

* `jsTemplate`: path to js template file, uses `babel-template`. 

Note: `babel-generator` has trouble with jsx generation, it will escape
all unicode sequences resulting in incorrect jsx code.

Available properties in the template: 

* `SECTIONS`: All sections in the file, `style`, `demo` and `markdown`. 
Styles are compiled to css with `precss`
demos are code fragments that return a React node
markdowns are compiled to html

* `IMPORTS`: All imports from demos

* `DEMO_DECLARATIONS`: Declarations for demos

Take a look at `sample/template.js`.
