import {suite, test} from "node:test";
import {fake} from "./index.js";
import assert from "node:assert";
import {faker} from "@faker-js/faker";
import {GoogleTypeDateMessageSchema} from "./gen/google-type_pb.js";

suite("google.type.Date", () => {
  test("is populated with recent date", () => {
    faker.seed(1234);
    faker.setDefaultRefDate("2024-01-01T10:30:05.000Z");
    const msg = fake(GoogleTypeDateMessageSchema);
    assert.strictEqual(msg.date?.year, 2023);
    assert.strictEqual(msg.date?.month, 12);
    assert.strictEqual(msg.date?.day, 15);
  });
  test("is populated with birthdate", () => {
    faker.seed(1234);
    faker.setDefaultRefDate("2024-01-01T10:30:05.000Z");
    const msg = fake(GoogleTypeDateMessageSchema);
    assert.strictEqual(msg.birthday?.year, 1987);
    assert.strictEqual(msg.birthday?.month, 11);
    assert.strictEqual(msg.birthday?.day, 12);
  });
});
