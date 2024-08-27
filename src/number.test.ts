import { suite, test } from "node:test";
import { fake } from "./index.js";
import { faker } from "@faker-js/faker";
import assert from "node:assert";
import { NumberMessageSchema } from "./gen/number_pb.js";

suite("number", () => {
  test("fake base", () => {
    faker.seed(1234);
    const msg = fake(NumberMessageSchema);
    assert.strictEqual(msg.latitude, 17.2368);
    assert.strictEqual(msg.longitude, 89.5795);
    assert.strictEqual(msg.httpStatus, 425);
    assert.strictEqual(msg.portNumber, 28686);
  });
});
