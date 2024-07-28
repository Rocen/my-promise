# Promise A+ 测试

1. 安装promises-aplus-tests

```js
npm install promises-aplus-tests -D 
```

2. 手写代码中加入 deferred
```js
// my-promise.js

MyPromise {
  ......
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
```

3. 配置启动命令
```js
// package.json

"scripts": {
  "test": "promises-aplus-tests my-promise"
}
```

4. 启动
```js
npm run test
```
