"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.run = run;
const helpers_1 = require("../helpers");
const categories_1 = require("./categories");
const batch_1 = require("../shared/api/batch");
// Run batch operations.
//
// Each operation can be fallible or successful, independently of the other.
//
// For each operation in the input, a `Result` is pushed into the corresponding
// subsection of the request, indicating some useful output result from that operation succeeding.
// If the operation didn't succeed, instead an error will be reported.
//
// Results are ordered the same way as the inputs.
async function run(req, res) {
    try {
        const { id: userId } = req.user;
        const requestBody = req.body;
        const result = {};
        // Handle the categories subsection.
        if (typeof requestBody.categories !== 'undefined') {
            const subsection = requestBody.categories;
            const { toCreate, toDelete } = subsection;
            result.categories = { created: [], deleted: [] };
            if (toCreate) {
                for (const pod of toCreate) {
                    try {
                        const created = await (0, categories_1.createOneCategory)(userId, pod);
                        result.categories.created.push({
                            status: batch_1.BatchStatus.SUCCESS,
                            ...created,
                        });
                    }
                    catch (err) {
                        result.categories.created.push({
                            status: batch_1.BatchStatus.FAILURE,
                            error: err.message,
                        });
                    }
                }
            }
            if (toDelete) {
                for (const [formerId, replaceById] of toDelete) {
                    try {
                        await (0, categories_1.destroyOneCategory)(userId, formerId, replaceById || null);
                        result.categories.deleted.push({ status: batch_1.BatchStatus.SUCCESS });
                    }
                    catch (err) {
                        result.categories.deleted.push({
                            status: batch_1.BatchStatus.FAILURE,
                            error: err.message,
                        });
                    }
                }
            }
        }
        // 207: Multi-Status.
        res.status(207).json(result);
    }
    catch (err) {
        (0, helpers_1.asyncErr)(res, err, 'when handling batch operations');
    }
}
