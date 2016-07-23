import Rule from '../models/rule';

import { makeLogger, asyncErr } from '../helpers';

let log = makeLogger('controllers/rules');

class RulePromiss {
    constructor(field, predicate, value) {
        this.field = field;
        this.predicate = predicate;
        this.value = value;
        console.log("Done");
    }
}

export async function create(req, res) {
    console.log(RulePromiss)
    let rule = new RulePromiss("test", "test2", "test3");
    let rules = await Rule.create({priority: 0, promisses: [rule], enabled: true})
    console.log(rules.id);
    res.status(200).send("OK");
}
