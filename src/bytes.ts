import type { BytesRules } from "./gen/buf/validate/validate_pb.js";
import { faker } from "@faker-js/faker";
import type { DescField } from "@bufbuild/protobuf";
import type { Options } from "./options.js";

export function fakeBytes(
  field: DescField,
  opt: Options,
  rules?: BytesRules,
): Uint8Array {
  if (rules !== undefined) {
    // eslint-disable-next-line no-prototype-builtins
    if (rules.hasOwnProperty("const")) {
      return rules.const;
    }
    if (rules.in.length > 0) {
      return faker.helpers.arrayElement(rules.in);
    }

    // TODO
    // rules.contains;
    // rules.notIn;
    // rules.len;
    // rules.maxLen;
    // rules.maxLen;
    // rules.pattern;
    // rules.prefix;
    // rules.suffix;
    // rules.wellKnown;
  }
  const count = faker.number.int({ min: opt.bytesMin, max: opt.bytesMax });
  const bytes = new Uint8Array(count);
  for (let i = 0; i < count; i++) {
    bytes[i] = faker.number.int({ min: 0, max: 255 });
  }
  return bytes;
}
