import { suite, test } from "node:test";
import { fake } from "./index.js";
import { toBinary, toJson } from "@bufbuild/protobuf";
import assert from "node:assert";
import { FieldMaskSchema } from "@bufbuild/protobuf/wkt";

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
