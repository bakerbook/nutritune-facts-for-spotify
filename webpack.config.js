import path from 'path'

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
                use: 'css-loader'
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