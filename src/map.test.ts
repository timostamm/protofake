import { suite, test } from "node:test";
import { fake } from "./index.js";
import assert from "node:assert";
import { ListIgnoreConstraintsMessageSchema } from "./gen/list_pb.js";
import { faker } from "@faker-js/faker";
import {
  MapDisabledConstraintsMessageSchema,
  MapKeyConstraintsMessageSchema,
  MapMinMaxPairsMessageSchema,
  MapMinPairsMessageSchema,
  MapRequiredMessageSchema,
  MapValueConstraintsMessageSchema,
} from "./gen/map_pb.js";

suite("map", () => {
  test("MapRules.min_pairs gt default mapMax bumps mapMax", () => {
    const msg = fake(MapMinPairsMessageSchema);
    assert.strictEqual(Object.keys(msg.map).length, 9);
  });
  test("MapRules.min_pairs and MapRules.max_pairs sets mapMin and mapMax", () => {
    const msg = fake(MapMinMaxPairsMessageSchema);
    assert.strictEqual(Object.keys(msg.map).length, 20);
  });
  test("MapRules.required bumps mapMin", () => {
    const msg = fake(MapRequiredMessageSchema, {
      mapMin: 0,
      mapMax: 0,
    });
    assert.strictEqual(Object.keys(msg.map).length, 1);
  });
  test("FieldConstraints MapRules.values are honored", () => {
    const msg = fake(MapValueConstraintsMessageSchema, {
      mapMin: 5,
      mapMax: 5,
    });
    assert.strictEqual(Object.keys(msg.map).length, 5);
    for (const value of Object.values(msg.map)) {
      assert.strictEqual(value, "abc");
    }
  });
  test("FieldConstraints MapRules.keys are honored", () => {
    const msg = fake(MapKeyConstraintsMessageSchema, {
      mapMin: 5,
      mapMax: 5,
    });
    assert.strictEqual(Object.keys(msg.map).length, 5);
    for (const key of Object.keys(msg.map)) {
      assert.ok(Number(key) >= 77);
      assert.ok(Number(key) >= 77, `map key ${key} <= 77`);
      assert.ok(Number(key) <= 99, `map key ${key} >= 99`);
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
    const msg = fake(MapDisabledConstraintsMessageSchema);
    const mapSize = Object.keys(msg.map).length;
    assert.ok(mapSize <= 8, `map size is ${mapSize}, expected <= 8`);
    assert.ok(msg.transitive !== undefined);
    const transitiveMapSize = Object.keys(msg.transitive.map).length;
    assert.ok(
      transitiveMapSize <= 8,
      `transitive map size length is ${transitiveMapSize}, expected <= 8`,
    );
  });
});
