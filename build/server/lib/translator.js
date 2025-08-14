"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTranslator = getTranslator;
exports.resetTranslator = resetTranslator;
const helpers_1 = require("../helpers");
const models_1 = require("../models");
const helpers_2 = require("../shared/helpers");
const LOCALE_ID_TO_TRANSLATOR = new Map();
const USER_TO_TRANSLATOR = new Map();
function ensureSharedTranslator(locale) {
    if (!LOCALE_ID_TO_TRANSLATOR.has(locale)) {
        // Initialize local object for every user of this locale.
        LOCALE_ID_TO_TRANSLATOR.set(locale, (0, helpers_2.setupTranslator)(locale));
    }
}
async function getTranslator(userId) {
    if (!USER_TO_TRANSLATOR.has(userId)) {
        // Initialize translator.
        const locale = await models_1.Setting.getLocale(userId);
        ensureSharedTranslator(locale);
        const i18n = (0, helpers_1.unwrap)(LOCALE_ID_TO_TRANSLATOR.get(locale));
        USER_TO_TRANSLATOR.set(userId, i18n);
    }
    return (0, helpers_1.unwrap)(USER_TO_TRANSLATOR.get(userId));
}
function resetTranslator(userId, locale) {
    ensureSharedTranslator(locale);
    USER_TO_TRANSLATOR.set(userId, (0, helpers_1.unwrap)(LOCALE_ID_TO_TRANSLATOR.get(locale)));
}
