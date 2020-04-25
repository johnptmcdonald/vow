const Vow = require("../vow");

Vow.all = (promiseArr) => {
  if (!Array.isArray(promiseArr)) {
    throw TypeError("Promise.all must take an array");
  }
  const resolvedVals = [];
  let stillPending = promiseArr.length;
  return new Vow(function (resolve, reject) {
    promiseArr.forEach((maybePromise, idx) => {
      Vow.resolve(maybePromise).then(
        (val) => {
          resolvedVals[idx] = val;
          stillPending--;
          if (stillPending === 0) {
            resolve(resolvedVals);
          }
        },
        (reason) => {
          reject(reason);
        }
      );
    });
  });
};
