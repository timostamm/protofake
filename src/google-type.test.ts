import { suite, test } from "node:test";
import { fake } from "./index.js";
import assert from "node:assert";
import { faker } from "@faker-js/faker";
import {
  GoogleTypeColorMessageSchema,
  GoogleTypeDateMessageSchema,
} from "./gen/google-type_pb.js";

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

suite("google.type.Color", () => {
  test("is populated with random color", () => {
    faker.seed(1234);
    const msg = fake(GoogleTypeColorMessageSchema);
    assert.strictEqual(msg.color?.red, 49);
    assert.strictEqual(msg.color?.green, 127);
    assert.strictEqual(msg.color?.blue, 159);
    assert.strictEqual(msg.color?.alpha, 0.82);
  });
});
