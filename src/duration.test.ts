import { suite, test } from "node:test";
import { fake } from "./index.js";
import { DurationSchema } from "@bufbuild/protobuf/wkt";
import { faker } from "@faker-js/faker";
import assert from "node:assert";
import { toBinary, toJson } from "@bufbuild/protobuf";

suite("google.protobuf.Duration", () => {
  test("fakes negative", () => {
    faker.seed(1234);
    const duration = fake(DurationSchema);
    assert.strictEqual(duration.seconds, BigInt(-168729222179));
    assert.strictEqual(duration.nanos, -723535740);
  });
  test("fakes positive", () => {
    faker.seed(1);
    const duration = fake(DurationSchema);
    assert.strictEqual(duration.seconds, BigInt(182325391203));
    assert.strictEqual(duration.nanos, 186260211);
  });
  test("fakes serializable", () => {
    const duration = fake(DurationSchema);
    toBinary(DurationSchema, duration);
    toJson(DurationSchema, duration);
  });
});
