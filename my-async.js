function asyncToGenerator(generatorFunc) {
    return function () {
        const gen = generatorFunc.apply(this, arguments);
        return new Promise((resolve, reject) => {
            function step(action, arg) {
                let generatorResult;
                try {
                    generatorResult = gen[action](arg);
                } catch (error) {
                    return reject(error)
                }
                const { value, done } = generatorResult;
                if (done) {
                    return resolve(value);
                }else {
                    return Promise
                        .resolve(value)
                        .then(
                            val => {
                                step('next', val);
                            }, 
                            err => {
                                step('throw', err);
                            }
                        )
                }
            }
            step('next');
        })
    }
}

module.exports = asyncToGenerator;