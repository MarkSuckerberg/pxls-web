const CopyPlugin = require("copy-webpack-plugin");
const path = require("path");
const webpack = require("webpack");
const GettextWebpackPlugin = require("gettext-webpack-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const devMode = process.env.NODE_ENV !== "production";

const locales = devMode ? [""] : ["", "bg", "de", "fi", "fr", "lv", "ru", "sv", "tok"];

module.exports = locales.map(function (locale) {
	return {
		mode: devMode ? "development" : "production",
		devtool: devMode ? "inline-source-map" : false,
		context: path.resolve(__dirname, "public"),
		entry: {
			pxls: "./pxls.js",
			SLIDEIN: { import: "./SLIDEIN.js", filename: "SLIDEIN.js" },
			serviceworker: { import: "./serviceWorker.js", filename: "serviceWorker.js" },
			admin: { import: "./admin/admin.js", filename: path.join("admin", locale ? `admin_${locale}.js` : "admin.js") },
		},
		output: {
			path: path.resolve(__dirname, "dist"),
			filename: locale ? `pxls_${locale}.js` : "pxls.js",
			publicPath: "/",
			clean: !locale, // only clean for the first (default) locale
		},

		module: {
			/**
			 * rules needs to be Array []
			 */
			rules: [
				{
					test: /\.css$/,
					use: [
						devMode
							? "style-loader"
							: {
									loader: MiniCssExtractPlugin.loader,
									options: {
										publicPath: (resourcePath, context) =>
											// publicPath is the relative path of the resource to the context
											// e.g. for ./css/admin/main.css the publicPath will be ../../
											// while for ./css/main.css the publicPath will be ../
											`${path.relative(path.dirname(resourcePath), context)}/`,
									},
							  },
						"css-loader",
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
		optimization: {
			minimizer: [new CssMinimizerPlugin()],
		},
		/**
		 * plugins needs to be Array []
		 */
		plugins: [
			new GettextWebpackPlugin({ translation: locale ? path.join(__dirname, "po", `Localization_${locale}.po`) : null, fallbackTranslation: path.join(__dirname, "po", "Localization.po") }),
			new webpack.optimize.ModuleConcatenationPlugin(),
			new CopyPlugin({
				patterns: [
					{ from: "*.css", to: "../dist" },
					{ from: "*.min.js", to: "../dist" },
					{ from: "*.wav", to: "../dist" },
					{ from: "*.html", to: "../dist" },
					{ from: "admin/**/*.css", to: "../dist" },
					{ from: "themes/**/*", to: "../dist" },
					{ from: "webfonts/**/*", to: "../dist" },
					{ from: "profile/**/*", to: "../dist" },
				],
			}),
			new webpack.DefinePlugin({
				"process.env.locale": JSON.stringify(locale),
			}),
		].concat(devMode ? [] : [new MiniCssExtractPlugin()]),
	};
});

