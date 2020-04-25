"use strict";

const isFunc = require("./utils").isFunc;

class Vow {
  #state = "pending";
  #handlerGroups = [];
  #value;

  constructor(executor) {
    if (!isFunc(executor)) throw TypeError("Executor must be a function");
    if (isFunc(executor))
      executor(
        this.#internalResolve.bind(this),
        this.#internalReject.bind(this)
      );
  }

  #settle(state, value) {
    if (this.#state !== "pending") return;
    this.#state = state;
    this.#value = value;
  }

  #internalResolve(data) {
    this.#settle("fulfilled", data);
    this.#callHandlers();
  }

  #internalReject(reason) {
    this.#settle("rejected", reason);
    this.#callHandlers();
  }

  then(onFulfilled, onRejected) {
    const downstreamPromise = new Vow(() => {});

    const successCb = isFunc(onFulfilled) ? onFulfilled : null;
    const errorCb = isFunc(onRejected) ? onRejected : null;
    this.#handlerGroups.push({
      successCb,
      errorCb,
      downstreamPromise,
    });
    this.#callHandlers();

    return downstreamPromise;
  }

  catch(onRejected) {
    return this.then(null, onRejected);
  }

  #callHandlers() {
    const state = this.#state === "fulfilled" ? "success" : "error";
    if (this.#state !== "pending") {
      while (this.#handlerGroups && this.#handlerGroups.length) {
        const currentHandlerGroup = this.#handlerGroups.shift();
        const downstream = currentHandlerGroup.downstreamPromise;
        if (isFunc(currentHandlerGroup[state + "Cb"])) {
          try {
            let retVal = currentHandlerGroup[state + "Cb"](this.#value);
            if (retVal instanceof Vow) {
              retVal.then(
                downstream.#internalResolve.bind(downstream),
                downstream.#internalReject.bind(downstream)
              );
            } else {
              downstream.#internalResolve(retVal);
            }
          } catch (err) {
            downstream.#internalReject(err);
          }
        } else if (state === "success") {
          currentHandlerGroup.downstreamPromise.#internalResolve(this.#value);
        } else if (state === "error") {
          currentHandlerGroup.downstreamPromise.#internalReject(this.#value);
        }
      }
    }
  }

  static resolve(value) {
    if (value instanceof Vow) {
      return value;
    }
    return new Vow(function (resolve) {
      resolve(value);
    });
  }
}

module.exports = Vow;
