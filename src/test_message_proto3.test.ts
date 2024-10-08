import { test } from "node:test";
import {
  ForeignMessageSchema,
  TestAllTypesProto3_NestedMessageSchema,
  TestAllTypesProto3Schema,
} from "./gen/test_messages_proto3_pb.js";
import { fake } from "./index.js";
import { createRegistry, toBinary, toJson } from "@bufbuild/protobuf";

test("all types", () => {
  const registry = createRegistry(
    ForeignMessageSchema,
    TestAllTypesProto3_NestedMessageSchema,
  );
  const m = fake(TestAllTypesProto3Schema, {
    registry,
    bytesMax: 128,
    listMax: 1,
    mapMax: 1,
  });
  toBinary(TestAllTypesProto3Schema, m);
  toJson(TestAllTypesProto3Schema, m, { registry });
  // This test passes because it does not throw an exception.
});
