import { suite, test } from "node:test";
import { fake } from "./index.js";
import assert from "node:assert";
import {
  ListDisabledConstraintsMessageSchema,
  ListIgnoreConstraintsMessageSchema,
  ListItemConstraintsMessageSchema,
  ListMinItemsMessageSchema,
  ListMinMaxItemsMessageSchema,
  ListRequiredMessageSchema,
} from "./gen/list_pb.js";
import { faker } from "@faker-js/faker";

suite("list", () => {
  test("RepeatedRules.min_items gt default listMax bumps listMax", () => {
    const msg = fake(ListMinItemsMessageSchema);
    assert.strictEqual(msg.list.length, 9);
  });
  test("RepeatedRules.min_items and RepeatedRules.max_items sets listMin and listMax", () => {
    const msg = fake(ListMinMaxItemsMessageSchema);
    assert.strictEqual(msg.list.length, 20);
  });
  test("FieldConstraints.required bumps listMin", () => {
    const msg = fake(ListRequiredMessageSchema, {
      listMin: 0,
      listMax: 0,
    });
    assert.strictEqual(msg.list.length, 1);
  });
  test("FieldConstraints RepeatedRules.items are honored", () => {
    const msg = fake(ListItemConstraintsMessageSchema, {
      listMin: 5,
      listMax: 5,
    });
    assert.strictEqual(msg.list.length, 5);
    for (const item of msg.list) {
      assert.strictEqual(item, "abc");
    }
  });
  test("FieldConstraints.ignore=ALWAYS ignores all constraints", () => {
    faker.seed(123);
    const msg = fake(ListIgnoreConstraintsMessageSchema);
    assert.deepStrictEqual(msg.list, [
      "summisse",
      "circumvenio",
      "curto",
      "calamitas",
      "studio",
      "ipsa",
    ]);
  });
  test("MessageConstraints.disabled=true ignores constraints, including transitive", () => {
    const msg = fake(ListDisabledConstraintsMessageSchema);
    assert.ok(
      msg.list.length <= 8,
      `list.length is ${msg.list.length}, expected <= 8`,
    );
    assert.ok(msg.transitive !== undefined);
    assert.ok(
      msg.transitive.list.length <= 8,
      `transitive.list.length is ${msg.transitive.list.length}, expected <= 8`,
    );
  });
});
