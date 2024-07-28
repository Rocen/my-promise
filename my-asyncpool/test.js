const asyncPool = require('.');

const fn = i => new Promise((resolve) => setTimeout(() => {
    console.log(i);
    resolve(i);
}, i));

asyncPool(2, [5000, 1000, 2000, 4000, 3000], fn);