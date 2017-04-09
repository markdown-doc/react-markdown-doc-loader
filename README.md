## react-markdown-doc-loader

A webpack loader to convert `markdown-doc-loader`'s output to React component.

`markdown-doc-loader` converts a markdown file to a list of sections. There're three
types of section: markdown, style and demo.

### Usage

Use as a webpack loader

```js
{
	module: {
		rules: [
			{
			test: /\.md$/,
			use: [
				'babel-loader',
				{
					loader: require.resolve('react-markdown-doc-loader'),
					options: {
						jsTemplate: path.join(__dirname, './react-template.js'),
						renderers: {
							markdown: 'Markdown',
							style: 'Style',
							demo: 'Demo'
						}
					}
				}
				'markdown-doc-loader'
			]
			}
		]
	}
}
```

### Options

* `jsTemplate`: path to js template file, uses `babel-template`. 
* `renderers`: a map of component names to different types of sections

Available properties in the template: 

* `SECTIONS`: All sections in the file, `style`, `demo` and `markdown`. 
Styles are compiled to css with `precss`
demos are code fragments that return a React node
markdowns are compiled to html

* `IMPORTS`: All imports from demos

* `DEMO_DECLARATIONS`: Declarations for demos

Take a look at `sample/template.js`.
