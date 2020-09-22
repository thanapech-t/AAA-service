import * as configJson from './config.json';

const UNDERSCORE = '_';
let hasRunOnce: boolean = false;
let currentConfig = configJson;

const readConfig = (env: string) => {
    if (configJson[UNDERSCORE] && configJson[UNDERSCORE][env]) {
        return configJson[UNDERSCORE][env];
    }
    return null;
};

const init = (env: string) => {
    if (hasRunOnce) {
        return;
    }
    hasRunOnce = true;
    if (env && readConfig(env)) {
        currentConfig = readConfig(env);
        return;
    }
    currentConfig = configJson;
    return;
};

init(process.env.PX_ENV);

export const getConfig = () => {
    return currentConfig;
};
