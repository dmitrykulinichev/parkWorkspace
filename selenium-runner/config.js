module.exports = {
    baseUrl: 'https://app.g24.com.ua',
    screenshot: {
        outputDir: '../user-docs/screenshots',
        landingDir: '../../landing/www/assets/img/docs',
        errorsDir: 'errors',
        theme: 'light', // 'light' або 'dark'
        fullPageDesktop: false,
        fullPageMobile: false,
        mobile: {
            enabled: true,
            width: 375,
            height: 812,
        },
    },
};
