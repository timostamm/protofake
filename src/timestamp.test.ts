import { suite, test } from "node:test";
import { fake } from "./index.js";
import { TimestampSchema } from "@bufbuild/protobuf/wkt";
import { faker } from "@faker-js/faker";
import assert from "node:assert";
import { toBinary, toJson } from "@bufbuild/protobuf";
import { TimestampMessageSchema } from "./gen/timestamp_pb";

suite("google.protobuf.Timestamp", () => {
  test("fakes based on field name", () => {
    faker.seed(1234);
    faker.setDefaultRefDate("2024-01-01T10:30:05.000Z");
    const msg = fake(TimestampMessageSchema);
    const json = toJson(TimestampMessageSchema, msg);
    assert.deepStrictEqual(json, {
      createdAt: "2024-01-01T05:54:16.911Z",
      expiresAt: "2024-01-02T01:25:55.575Z",
      bornAt: "1979-01-05T16:19:33.355Z",
    });
  });
  test("fakes serializable", () => {
    const ts = fake(TimestampSchema);
    toBinary(TimestampSchema, ts);
    toJson(TimestampSchema, ts);
  });
});
