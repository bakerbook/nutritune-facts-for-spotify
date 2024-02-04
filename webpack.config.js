import path from 'path'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'

const __dirname = path.resolve('')

export default {
    entry: './src/main.tsx',

    output: {
        path: path.join(__dirname, '/dist'),
        filename: 'bundle.js'
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js', '.css', '.png', '.ttf']
    },

    plugins: [new MiniCssExtractPlugin()],

    module: {
        rules: [
            {
                test: /\.tsx?$/,
                exclude: /node_modules/,
                use: 'babel-loader'
            },
            {
                test: /\.css$/,
                exclude: /node_modules/,
                use: [MiniCssExtractPlugin.loader, 'css-loader']
            },
            {
                test: /\.png$/,
                type: 'asset/resource'
            },
            {
                test: /\.ttf$/,
                type: 'asset/resource'
            }
        ]
    }
}