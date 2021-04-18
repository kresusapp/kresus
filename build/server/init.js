"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const helpers_1 = require("./helpers");
const settings_1 = require("./shared/settings");
const models_1 = require("./models");
const poller_1 = __importDefault(require("./lib/poller"));
const DemoController = __importStar(require("./controllers/demo"));
const log = helpers_1.makeLogger('init');
// Checks if the demo mode is enabled, and set it up if that's the case.
async function checkDemoMode() {
    if (process.kresus.forceDemoMode) {
        const userId = process.kresus.user.id;
        const isDemoModeEnabled = await models_1.Setting.findOrCreateDefaultBooleanValue(userId, settings_1.DEMO_MODE);
        if (!isDemoModeEnabled) {
            try {
                log.info('Setting up demo mode...');
                await DemoController.setupDemoMode(userId);
                log.info('Done setting up demo mode...');
            }
            catch (err) {
                log.error(`Fatal error when setting up demo mode : ${err.message}
${err.stack}`);
            }
        }
    }
}
async function init() {
    try {
        // Initialize models.
        await models_1.initModels();
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
