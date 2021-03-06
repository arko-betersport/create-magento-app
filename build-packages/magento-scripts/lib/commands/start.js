/* eslint-disable no-param-reassign */
const path = require('path');
const logger = require('@scandipwa/scandipwa-dev-utils/logger');
const { Listr } = require('listr2');
const start = require('../tasks/start');
const pathExists = require('../util/path-exists');
const { baseConfig } = require('../config');
const linkTheme = require('../tasks/theme/link-theme');

module.exports = (yargs) => {
    yargs.command('start', 'Deploy the application.', (yargs) => {
        yargs.option(
            'port',
            {
                alias: 'p',
                describe: 'Suggest a port for an application to run.',
                type: 'number',
                nargs: 1
            }
        );

        yargs.option(
            'no-open',
            {
                alias: 'n',
                describe: 'Do not open browser after command finished',
                type: 'boolean',
                default: false
            }
        );

        yargs.option(
            'debug',
            {
                alias: 'd',
                describe: 'Enable PHP xdebug.',
                type: 'boolean',
                default: false
            }
        );

        yargs.option(
            'skip-setup', {
                alias: 's',
                describe: 'Skip Magento setup',
                type: 'boolean',
                default: false
            }
        );
    }, async (args = {}) => {
        const tasks = new Listr([start], {
            exitOnError: true,
            ctx: args,
            concurrent: false,
            rendererOptions: { collapse: false }
        });

        if (args.debug) {
            logger.warn('You are running in debug mode. Magento setup will be slow.');
        }
        const legacyMagentoConfigExists = await pathExists(path.join(baseConfig.cacheDir, 'app-config.json'));
        const currentConfigExists = await pathExists(path.join(process.cwd(), 'cma.js'));
        if (legacyMagentoConfigExists && !currentConfigExists) {
            logger.warn('Magento configuration from app-config.json will be moved to cma.js in your projects directory.');
        }

        try {
            const ctx = await tasks.run();

            if (ctx.checkForInstalledThemesAfterStartUp) {
                if (ctx.themePaths && ctx.themePaths.length > 0) {
                    // eslint-disable-next-line no-restricted-syntax
                    for (const themepath of ctx.themePaths) {
                        // eslint-disable-next-line no-await-in-loop
                        await new Listr([linkTheme], {
                            concurrent: false,
                            exitOnError: true,
                            ctx: {
                                ...ctx,
                                themepath
                            },
                            rendererOptions: { collapse: false }
                        }).run();
                    }
                }
            }
            const {
                ports,
                config: { magentoConfiguration, overridenConfiguration: { host, ssl } }
            } = ctx;

            logger.logN();
            logger.log(`Web location: ${logger.style.link(`${ssl.enabled ? 'https' : 'http'}://${host}${ports.app === 80 ? '' : `:${ports.app}`}/`)}`);
            logger.log(`Magento Admin panel location: ${logger.style.link(`${ssl.enabled ? 'https' : 'http'}://${host}${ports.app === 80 ? '' : `:${ports.app}`}/${magentoConfiguration.adminuri}`)}`);
            logger.logN(`Magento Admin panel credentials: ${logger.style.misc(magentoConfiguration.user)} - ${logger.style.misc(magentoConfiguration.password)}`);
            process.exit(0);
        } catch (e) {
            logger.error(e.message || e);
            process.exit(1);
        }
    });
};
