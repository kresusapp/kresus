import { IdentifiedRequest } from './routes';
import express from 'express';
import { asyncErr } from '../helpers';
import { createOneCategory, destroyOneCategory } from './categories';
import { BatchRequest, BatchResponse, BatchStatus } from '../shared/api/batch';

// Run batch operations.
//
// Each operation can be fallible or successful, independently of the other.
//
// For each operation in the input, a `Result` is pushed into the corresponding
// subsection of the request, indicating some useful output result from that operation succeeding.
// If the operation didn't succeed, instead an error will be reported.
//
// Results are ordered the same way as the inputs.
export async function run(req: IdentifiedRequest<any>, res: express.Response) {
    try {
        const { id: userId } = req.user;
        const requestBody = req.body as BatchRequest;

        const result: BatchResponse = {};

        // Handle the categories subsection.
        if (typeof requestBody.categories !== 'undefined') {
            const subsection = requestBody.categories;
            const { toCreate, toDelete } = subsection;

            result.categories = { created: [], deleted: [] };

            if (toCreate) {
                for (const pod of toCreate) {
                    try {
                        const created = await createOneCategory(userId, pod);
                        result.categories.created.push({
                            status: BatchStatus.SUCCESS,
                            ...created,
                        });
                    } catch (err) {
                        result.categories.created.push({
                            status: BatchStatus.FAILURE,
                            error: err.message,
                        });
                    }
                }
            }

            if (toDelete) {
                for (const [formerId, replaceById] of toDelete) {
                    try {
                        await destroyOneCategory(userId, formerId, replaceById || null);
                        result.categories.deleted.push({ status: BatchStatus.SUCCESS });
                    } catch (err) {
                        result.categories.deleted.push({
                            status: BatchStatus.FAILURE,
                            error: err.message,
                        });
                    }
                }
            }
        }

        // 207: Multi-Status.
        res.status(207).json(result);
    } catch (err) {
        asyncErr(res, err, 'when handling batch operations');
    }
}
