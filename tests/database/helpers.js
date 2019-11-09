// Removes all the instances of an existing Model if they're in the database.
export async function clear(Model) {
    let all = await Model.all(0);
    for (let i of all) {
        // We consider the presence of an id to be the proof of an actual Model
        // instance (e.g. ghost settings don't have those).
        if (typeof i.id !== 'undefined') {
            await Model.destroy(0, i.id);
        }
    }
}
