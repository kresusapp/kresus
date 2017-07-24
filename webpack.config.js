module.exports = (
    process.env.NODE_ENV === "production" ?
        require("./scripts/webpack/production.js") :
        require("./scripts/webpack/development.js")
);
