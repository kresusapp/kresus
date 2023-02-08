export interface Hideable {
    show: () => void;
    hide: () => void;

    showCategory: (name: string) => void;
    hideCategory: (name: string) => void;
}
