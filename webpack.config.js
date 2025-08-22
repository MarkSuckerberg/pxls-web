const CopyPlugin = require("copy-webpack-plugin");
const path = require("path");
const webpack = require("webpack");

function translate(pofile) {
	return through.obj(function (file, enc, callback) {
		if (file.isBuffer()) {
			PO.load(pofile, (error, pofile) => {
				if (error) {
					callback(error);
				} else {
					let contents = file.contents.toString();
					const script = esprima.parseScript(contents, { range: true });
					const translationCalls = script.body
						.map(findTranslationCalls)
						.flat()
						.sort((a, b) => a.range.start - b.range.start);

					let offset = 0;

					for (const call of translationCalls) {
						const [argument] = call.arguments;

						const [start, end] = call.range;
						const length = end - start;

						const original = contract(contents.substring(...argument.range.map((p) => p + offset)), 1);
						const quote = contents[argument.range[0] + offset];

						const item = pofile.items.find((i) => i.msgid === original);

						const replaceContent = (item && item.msgstr[0]) || original;
						const replace = quote + replaceContent.replace(new RegExp(`([^\\\\])([${quote}])`, "g"), "$1\\$2") + quote;

						// just in case something goes wrong
						if (contents.substring(start + offset, start + offset + 2) !== "__") {
							callback(new Error("Translation offset drift"));
						}

						contents = contents.substring(0, offset + start) + replace + contents.substring(offset + end);
						offset += replace.length - length;
					}

					file.contents = Buffer.from(contents);

					callback(null, file);
				}
			});
		} else {
			callback(new Error("Expected buffer"));
		}
	});
}

module.exports = {
	mode: "development",
	context: path.resolve(__dirname, "public"),
	entry: { pxls: "./pxls.js", SLIDEIN: { import: "./SLIDEIN.js", filename: "SLIDEIN.js" }, serviceworker: { import: "./serviceWorker.js", filename: "serviceWorker.js" } },
	output: {
		path: path.resolve(__dirname, "dist"),
		filename: "pxls.js",
		clean: true,
	},

	module: {
		/**
		 * rules needs to be Array []
		 */
		rules: [
			{
				test: /\.css$/,
				use: [
					"style-loader",
					{
						loader: "css-loader",
						options: {
							minimize: true,
						},
					},
				],
			},
			{
				test: /\.(jpeg|png|gif|svg)$/,
				use: [
					{
						loader: "file-loader",
						options: {
							name: "[name].[ext]",
						},
					},
					"image-webpack-loader",
				],
			},
		],
	},
	/**
	 * plugins needs to be Array []
	 */
	plugins: [
		new webpack.optimize.ModuleConcatenationPlugin(),
		new CopyPlugin({
			patterns: [
				{ from: "*.css", to: "../dist" },
				{ from: "*.min.js", to: "../dist" },
				{ from: "*.wav", to: "../dist" },
				{ from: "*.html", to: "../dist" },
				{ from: "admin/**/*", to: "../dist" },
				{ from: "themes/**/*", to: "../dist" },
				{ from: "webfonts/**/*", to: "../dist" },
				{ from: "profile/**/*", to: "../dist" },
			],
		}),
	],
	/**
	 * webpack-dev-server
	 */
	devServer: {
		contentBase: "./public",
	},
};

