const viewPort = {
    width: 1024,
    height: 768,
    header: { // height of top bar
        height: 250
    },
    footer: { // height of bottom tab bar
        height: 100
    },
    sidebar: { // width of sidebar
        width: 200
    },
    content: { // content area dimensions
        padding: 20,
        margin: 15
    },
    button: { // common button dimensions
        width: 150,
        height: 50
    },
    input: { // common input field dimensions
        width: 300,
        height: 40
    }
    , devices: {
        mobile: {
            width: 375,
            height: 667
        },
        tablet: {
            width: 768,
            height: 1024
        },
        desktop: {
            width: 1440,
            height: 900
        }
    },
    breakpoints: {
        Y: {
            mobile: 375,
            tablet: 768,
            desktop: 1024
        },
        X: {
            mobile: 667,
            tablet: 1024,
            desktop: 1440
        }
    }
}



export { viewPort };