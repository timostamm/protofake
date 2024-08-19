import { suite, test } from "node:test";
import { fake } from "./index.js";
import { create, toBinary, toJson } from "@bufbuild/protobuf";
import assert from "node:assert";
import { UserSchema } from "./gen/example_pb";
import { faker } from "@faker-js/faker";

suite("example", () => {
  test("is populated", () => {
    faker.seed(1234);
    const user = fake(UserSchema);
    const want = create(UserSchema, {
      firstName: "Claude",
      lastName: "Mueller",
      active: true,
    });
    assert.deepStrictEqual(user, want);
  });
  test("fakes serializable", () => {
    const user = fake(UserSchema);
    toBinary(UserSchema, user);
    toJson(UserSchema, user);
  });
});
