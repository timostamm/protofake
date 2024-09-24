import type { BoolRules } from "./gen/buf/validate/validate_pb.js";
import { faker } from "@faker-js/faker";

export function fakeBool(rules?: BoolRules): boolean {
  if (rules !== undefined) {
    // eslint-disable-next-line no-prototype-builtins
    if (rules.hasOwnProperty("const")) {
      return rules.const;
    }
  }
  return faker.datatype.boolean();
}
