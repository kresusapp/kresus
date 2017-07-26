module.exports = (
    process.env.NODE_ENV === "production" ?
        require("./scripts/webpack/webpack.config.production.js") :
        require("./scripts/webpack/webpack.config.development.js")
);
