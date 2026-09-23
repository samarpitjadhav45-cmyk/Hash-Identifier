const test = require("node:test");
const assert = require("node:assert/strict");
const { identifyHash, identifyBatch } = require("../src/hashIdentifier");

test("identifies ambiguous 32-character hexadecimal hashes", () => {
  const result = identifyHash("5d41402abc4b2a76b9719d911017c592");
  assert.equal(result.inputLength, 32);
  assert.deepEqual(result.matches.map((match) => match.name), ["MD4", "MD5", "NTLM"]);
  assert.equal(result.ambiguous, true);
});

test("identifies SHA-1 and SHA-256 by length", () => {
  assert.equal(identifyHash("a".repeat(40)).matches[0].name, "SHA-1");
  assert.equal(identifyHash("b".repeat(64)).matches[0].name, "SHA-256");
  assert.equal(identifyHash("c".repeat(56)).matches[0].mode, 1300);
});

test("identifies prefixed password hash formats", () => {
  assert.equal(identifyHash("$2b$12$" + "a".repeat(53)).matches[0].name, "bcrypt");
  assert.equal(identifyHash("$argon2id$v=19$m=65536,t=3,p=4$abc$def").matches[0].name, "Argon2");
});

test("reports invalid and empty input without throwing", () => {
  assert.equal(identifyHash("").message, "Enter a hash to begin.");
  assert.equal(identifyHash("not a hash").matches.length, 0);
});

test("normalizes pasted whitespace before counting and matching", () => {
  const result = identifyHash("\r\n  5d41402abc4b2a76b9719d911017c592  \r\n");
  assert.equal(result.inputLength, 32);
  assert.deepEqual(result.matches.map((match) => match.name), ["MD4", "MD5", "NTLM"]);
});

test("identifies a batch of newline-separated hashes", () => {
  const results = identifyBatch([
    "5d41402abc4b2a76b9719d911017c592",
    "aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d",
    "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824",
    "$2b$12$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy"
  ]);
  assert.equal(results.length, 4);
  assert.deepEqual(results.map((result) => result.matches[0].name), ["MD4", "SHA-1", "SHA-256", "bcrypt"]);
  assert.deepEqual(results.map((result) => result.inputLength), [32, 40, 64, 60]);
});