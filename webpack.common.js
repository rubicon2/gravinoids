const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
    entry: {
        game: "./src/game.js",
    },
    module: {
        rules: [
            {
                test: /\.css$/i,
                use: ["style-loader", "css-loader"],
            },
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: "GRAVINOIDS",
        }),
    ]
}