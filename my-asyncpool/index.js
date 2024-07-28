async function asyncPool(poolLimit, array, fn) {
    const settledPool = [];
    const pendingPool = [];

    for (let item of array) {
        const p = Promise.resolve().then(() => fn(item, array));
        settledPool.push(p);

        if (poolLimit <= array.length) {
            const event = p.then(() => pendingPool.splice(pendingPool.indexOf(event), 1));
            pendingPool.push(event);

            if (pendingPool.length >= poolLimit) {
                await Promise.race(pendingPool);
            }
        }
    }

    return Promise.all(settledPool);
}

module.exports = asyncPool;