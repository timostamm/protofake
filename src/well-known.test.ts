import { suite, test } from "node:test";
import { fake } from "./index.js";
import {
  createRegistry,
  fromBinary,
  toBinary,
  toJson,
} from "@bufbuild/protobuf";
import assert from "node:assert";
import {
  AnySchema,
  DurationSchema,
  FieldMaskSchema,
  TimestampSchema,
} from "@bufbuild/protobuf/wkt";
import { faker } from "@faker-js/faker";
import { TimestampMessageSchema } from "./gen/timestamp_pb.js";

suite("google.protobuf.Any", () => {
  test("is empty without registry", () => {
    const any = fake(AnySchema);
    assert.strictEqual(any.typeUrl, "");
    assert.strictEqual(any.value.byteLength, 0);
  });
  test("is populated from registry", () => {
    const registry = createRegistry(DurationSchema);
    const any = fake(AnySchema, {
      registry,
    });
    assert.strictEqual(
      any.typeUrl,
      "type.googleapis.com/google.protobuf.Duration",
    );
    fromBinary(DurationSchema, any.value);
  });
  test("fakes serializable", () => {
    const registry = createRegistry(DurationSchema, TimestampSchema, AnySchema);
    const any = fake(AnySchema, {
      registry,
    });
    toBinary(AnySchema, any);
    toJson(AnySchema, any, { registry });
  });
});

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

suite("google.protobuf.FieldMask", () => {
  test("is never populated", () => {
    const fieldMask = fake(FieldMaskSchema);
    assert.strictEqual(fieldMask.paths.length, 0);
  });
  test("fakes serializable", () => {
    const fieldMask = fake(FieldMaskSchema);
    toBinary(FieldMaskSchema, fieldMask);
    toJson(FieldMaskSchema, fieldMask);
  });
});

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
