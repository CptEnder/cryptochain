const cryptoHash = require("./crypto-hash");

describe("cryptoHash()", () => {
  it("generates a SHA-256 hashed output", () => {
    expect(cryptoHash("help")).toEqual(
      "305304f853bd8401dcb9548c3fa92066395f0bc68371f80da24919fb9d5deac7"
    );
  });

  it("produces the same hash with the same input arguments in any orders", () => {
    expect(cryptoHash("one", "two", "three")).toEqual(
      cryptoHash("three", "one", "two")
    );
  });

  it("produces a unique hash when the properties have changed on an input", () => {
    const foo = {};
    const originalHash = cryptoHash(foo);
    foo["a"] = "a";

    expect(cryptoHash(foo)).not.toEqual(originalHash);
  });
});
