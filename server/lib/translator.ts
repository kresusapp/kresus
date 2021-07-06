import { unwrap } from '../helpers';
import { Setting } from '../models';
import { I18NObject, setupTranslator } from '../shared/helpers';

const LOCALE_ID_TO_TRANSLATOR: Map<string, I18NObject> = new Map();
const USER_TO_TRANSLATOR: Map<number, I18NObject> = new Map();

function ensureSharedTranslator(locale: string) {
    if (!LOCALE_ID_TO_TRANSLATOR.has(locale)) {
        // Initialize local object for every user of this locale.
        LOCALE_ID_TO_TRANSLATOR.set(locale, setupTranslator(locale));
    }
}

export async function getTranslator(userId: number): Promise<I18NObject> {
    if (!USER_TO_TRANSLATOR.has(userId)) {
        // Initialize translator.
        const locale = await Setting.getLocale(userId);
        ensureSharedTranslator(locale);
        const i18n = unwrap(LOCALE_ID_TO_TRANSLATOR.get(locale));
        USER_TO_TRANSLATOR.set(userId, i18n);
    }
    return unwrap(USER_TO_TRANSLATOR.get(userId));
}

export function resetTranslator(userId: number, locale: string) {
    ensureSharedTranslator(locale);
    USER_TO_TRANSLATOR.set(userId, unwrap(LOCALE_ID_TO_TRANSLATOR.get(locale)));
}
