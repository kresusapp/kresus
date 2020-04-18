"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const helpers_1 = require("./helpers");
const models_1 = require("./models");
const poller_1 = __importDefault(require("./lib/poller"));
const DemoController = __importStar(require("./controllers/demo"));
const log = helpers_1.makeLogger('init');
// Checks if the demo mode is enabled, and set it up if that's the case.
async function checkDemoMode() {
    if (process.kresus.forceDemoMode) {
        const isDemoModeEnabled = await models_1.Setting.findOrCreateDefaultBooleanValue(0, 'demo-mode');
        if (!isDemoModeEnabled) {
            try {
                log.info('Setting up demo mode...');
                await DemoController.setupDemoMode(0);
                log.info('Done setting up demo mode...');
            }
            catch (err) {
                log.error(`Fatal error when setting up demo mode : ${err.message}
${err.stack}`);
            }
        }
    }
}
async function init(root, cozyDbName) {
    try {
        // Initialize models.
        await models_1.initModels(root, cozyDbName);
        await checkDemoMode();
        // Localize Kresus
        // TODO : do not localize Kresus globally when Kresus is multi-user.
        const locale = await models_1.Setting.getLocale(process.kresus.user.id);
        helpers_1.setupTranslator(locale);
        // Start bank polling
        log.info('Starting bank accounts polling et al...');
        await poller_1.default.runAtStartup();
        log.info("Server is ready, let's start the show!");
    }
    catch (err) {
        log.error(`Error at initialization:
Message: ${err.message}
${err.stack}`);
    }
}
exports.default = init;
