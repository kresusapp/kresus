// Minimal express response mock, for testing controllers without a HTTP layer.
// Note json(), send() and end() are all needed: the controllers' happy paths use
// res.status(x).json() or res.status(x).end() when there is no content, while
// asyncErr() uses res.status(x).send().
export const makeRes = () => {
    return {
        statusCode: null,
        body: null,

        status(code) {
            this.statusCode = code;
            return this;
        },

        json(payload) {
            this.body = payload;
            return this;
        },

        send(payload) {
            this.body = payload;
            return this;
        },

        end() {
            return this;
        },
    };
};

// Minimal express request mock, matching IdentifiedRequest/PreloadedRequest.
export const makeReq = ({ userId, body, params, preloaded } = {}) => {
    return {
        user: { id: userId },
        body: body || {},
        params: params || {},
        preloaded: preloaded || {},
    };
};
