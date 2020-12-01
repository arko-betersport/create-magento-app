/* eslint-disable no-multi-str */
const osPlatform = require('./os-platform');
const os = require('os');

const getInstallDependenciesCommand = async () => {
    switch (os.platform()) {
    case 'darwin': {
        return 'brew install zlib \
        bzip2 \
        libiconv \
        curl \
        libpng \
        gd \
        freetype \
        oniguruma \
        icu4c';
    }
    case 'linux': {
        const { dist } = await osPlatform();
        switch (dist) {
        case 'Arch Linux':
        case 'Manjaro': {
            return 'pamac install freetype2 \
            lib32-freetype2 \
            openssl \
            oniguruma';
        }
        case 'Fedora':
        case 'CentOS': {
            return 'yum install --enablerepo=PowerTools openssl-devel \
            libjpeg-turbo-devel \
            libpng-devel \
            gd-devel \
            libicu libicu-devel \
            libzip-devel \
            libtool-ltdl-devel \
            oniguruma-devel';
        }
        case 'Linux Mint':
        case 'Ubuntu':
        default: {
            return 'apt-get install \
                libcurl4-openssl-dev \
                libonig-dev \
                libjpeg-dev \
                libjpeg8-dev \
                libjpeg-turbo8-dev \
                libpng-dev \
                libicu-dev \
                libfreetype6-dev \
                libzip-dev \
                libssl-dev \
                build-essential \
                libbz2-dev \
                libreadline-dev \
                libsqlite3-dev \
                libssl-dev \
                libxml2-dev \
                libxslt-dev \
                libonig-dev \
                php-cli \
                php-bz2 \
                pkg-config \
                autoconf';
        }
        }
    }
    default: {
        return 'platform is not supported';
    }
    }
};

module.exports = getInstallDependenciesCommand;
