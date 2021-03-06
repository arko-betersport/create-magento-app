const createNginxConfig = require('./create-nginx-config');
const createPhpConfig = require('./create-php-config');
const createPhpFpmConfig = require('./create-php-fpm-config');

const prepareFileSystem = {
    title: 'Preparing file system',
    task: async (ctx, task) => task.newListr([
        createNginxConfig,
        createPhpFpmConfig,
        createPhpConfig
    ], {
        concurrent: true,
        rendererOptions: {
            collapse: false
        },
        exitOnError: true,
        ctx
    })
};

module.exports = {
    prepareFileSystem
};
