export const checkObjectIsSubsetOf = (toCompare, reference) => {
    if (toCompare instanceof Array) {
        for (const prop of toCompare) {
            // Check that reference contains it.
            if (!reference.some(r => checkObjectIsSubsetOf(prop, r))) {
                return false;
            }
        }

        return true;
    }

    if (toCompare instanceof Date) {
        return reference instanceof Date && toCompare.getTime() === reference.getTime();
    }

    if (typeof toCompare === 'object') {
        if (toCompare === null) {
            return reference === null;
        }

        // eslint-disable-next-line guard-for-in
        for (const key in toCompare) {
            if (!checkObjectIsSubsetOf(toCompare[key], reference[key])) {
                return false;
            }
        }
    }

    return true;
};
