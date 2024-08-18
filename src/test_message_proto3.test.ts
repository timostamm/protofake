import { test } from "node:test";
import {
  ForeignMessageSchema,
  TestAllTypesProto3_NestedMessageSchema,
  TestAllTypesProto3Schema,
} from "./gen/proto/test_messages_proto3_pb";
import { fake } from "./index";
import { createRegistry, toBinary, toJson } from "@bufbuild/protobuf";

test("all types", (t) => {
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
