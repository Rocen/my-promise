

const PENDING = 'pending';
const FULFILLED = 'fulfilled';
const REJECTED = 'rejected';

class MyPromise {
    constructor(executor) {
        try {
            executor(this._resolve, this._reject)
        } catch (error) {
            this._reject(error);
        }
    }

    status = PENDING;
    value = null;
    reason = null;

    onFulFilledCallbackQueue = [];
    onRejectedCallbackQueue = [];

    _resolve = (value) => {
        if (this.status === PENDING) {
            this.status = FULFILLED;
            this.value = value;
            while(this.onFulFilledCallbackQueue.length > 0) {
                this.onFulFilledCallbackQueue.shift()(value);
            }
        }
    }

    _reject = (reason) => {
        if (this.status === PENDING) {
            this.status = REJECTED;
            this.reason = reason;
            while(this.onRejectedCallbackQueue.length > 0) {
                this.onRejectedCallbackQueue.shift()(reason);
            }
        }
    }

    then(onFulfilled, onRejected) {
        onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : value => value;
        onRejected = typeof onRejected === 'function' ? onRejected : reason => { throw reason };

        const promise2 = new MyPromise((resolve, reject) => {
            if (this.status === FULFILLED) {
                queueMicrotask(() => {
                    try {
                        const x = onFulfilled(this.value);
                        resolvePromise(promise2, x, resolve, reject);
                    } catch (error) {
                        reject(error);
                    }
                })
            }else 
            if (this.status === REJECTED) {
                queueMicrotask(() => {
                    try {
                        const x = onRejected(this.reason);
                        resolvePromise(promise2, x, resolve, reject);
                    } catch (error) {
                        reject(error);
                    }
                })
            }else {
                this.onFulFilledCallbackQueue.push(() => {
                    queueMicrotask(() => {
                        try {
                            const x = onFulfilled(this.value);
                            resolvePromise(promise2, x, resolve, reject);
                        } catch (error) {
                            reject(error);
                        }
                    })
                })
                this.onRejectedCallbackQueue.push(() => {
                    queueMicrotask(() => {
                        try {
                            const x = onRejected(this.reason);
                            resolvePromise(promise2, x, resolve, reject);
                        } catch (error) {
                            reject(error);
                        }
                    })
                })
            }
        })

        return promise2;
    }

    catch(onRejected) {
        return this.then(undefined, onRejected);
    }

    static resolve(value) {
        if (value instanceof MyPromise) return value;

        return new MyPromise((resolve) => resolve(value));
    }

    static reject(reason) {
        return new MyPromise((resolve, reject) => {
            reject(reason);
        })
    }

    static all(list) {
        return new MyPromise((resolve, reject) => {
            let values = [];
            let count = 0;
            for (let [index, promise] of list.entries()) {
                this.resolve(promise)
                    .then((res) => {
                        values[index] = res;
                        count++;
                        if (count === list.length) resolve(values);
                    })
                    .catch((err) => {
                        reject(err);
                    })
            }
        })
    }

    static race(list) {
        return new MyPromise((resolve, reject) => {
            for (let promise of list) {
                this.resolve(promise)
                    .then(res => {
                        resolve(res)
                    })
                    .catch(err => {
                        reject(err)
                    })
            }
        })
    }

    static allSettled(list) {
        return new MyPromise((resolve, reject) => {
            const result = [];
            let count = 0;
            for (let [index, promise] of list) {
                this.resolve(promise)
                    .then((value) => {
                        result[index] = { status: 'fulfilled', value };
                    })
                    .catch((reason) => {
                        result[index] = { status: 'rejected', reason };
                    })
                    .finally(() => {
                        count++;
                        if (count === list.length) resolve(result);
                    })
            }
        })
    }

    finally(callback) {
        return this.then(
            value => MyPromise.resolve(callback()).then(() => value),
            reason => MyPromise.resolve(callback()).then(() => { throw reason })
        )
    }
}

function resolvePromise(promise, x, resolve, reject) {
    if (promise === x) {
        return reject(new TypeError('The promise and the return value are the same'))
    }

    if (typeof x === 'object' || typeof x === 'function') {
        if (x === null) {
            return resolve(x);
        }

        let then;
        try {
            then = x.then;
        } catch (error) {
            return reject(error);
        }

        if (typeof then === 'function') {
            let called = false;
            try {
                then.call(
                    x,
                    y => {
                        try {
                            if (called) return;
                            called = true;
                            resolvePromise(promise, y, resolve, reject)
                        } catch (error) {
                            reject(error);
                        }
                    },
                    r => {
                        if (called) return;
                        called = true;
                        reject(r)
                    }
                )
            } catch (error) {
                if (called) return;
                called = true;
                reject(error);
            }
        }else {
            resolve(x);
        }
    }else {
        resolve(x);
    }
}

MyPromise.deferred = function () {
    var result = {};
    result.promise = new MyPromise(function (resolve, reject) {
      result.resolve = resolve;
      result.reject = reject;
    });
  
    return result;
}

module.exports = MyPromise;