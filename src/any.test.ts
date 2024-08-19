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
  TimestampSchema,
} from "@bufbuild/protobuf/wkt";

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
