"use strict";

const expect = require("chai").expect;
const Vow = require("../lib/vow");

describe("The `Vow` class", function () {
  it("is a function", function () {
    expect(typeof Vow).to.equal("function");
  });

  it('can be called with a function argument (the "executor"), returning a new promise instance', function () {
    var executor = function () {};
    var promise = new Vow(executor);
    expect(promise instanceof Vow).to.equal(true);
  });
});
