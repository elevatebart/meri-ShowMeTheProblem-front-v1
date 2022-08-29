module.exports = {
    // set your styleguidist configuration here
    title: 'Default Style Guide',
    components: 'src/components/**/*.vue',
    // defaultExample: true,
    sections: [
        {
            name: 'First Section',
            components: 'src/components/**/[a-zA-Z]*.vue',
        },
    ],
    webpackConfig: {
        // custom config goes here
    },
    exampleMode: 'expand',
}