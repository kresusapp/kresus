type Query<T> = {
    where(query: Object): Query<T>;
    patch(attributes: Object): Query<T>;
    insert(attributes: Object): Query<T>;
}

declare module 'objection' {
    declare class Model<T> {
        static query(): Query<Array<T>>;
    }
}

declare function $await<T>(q: Query<T> | Promise<T> | T): T;
