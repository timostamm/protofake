import type { DescField } from "@bufbuild/protobuf";
import type {
  Fixed64Rules,
  Int64Rules,
  SFixed64Rules,
  SInt64Rules,
  UInt64Rules,
} from "./gen/buf/validate/validate_pb.js";
import { faker } from "@faker-js/faker";

// TODO validate that min / max is sound in parseRules, see string.ts

export function fakeInt64(
  field: DescField,
  typeMin: bigint,
  typeMax: bigint,
  rules?: Int64Rules | UInt64Rules | Fixed64Rules | SFixed64Rules | SInt64Rules,
): bigint {
  if (rules != undefined) {
    // The following rules allow us to exit early. We do not check whether the
    // rules are satisfiable.
    // eslint-disable-next-line no-prototype-builtins
    if (rules.hasOwnProperty("const")) {
      return rules.const;
    }
    if (rules.in.length > 0) {
      return faker.helpers.arrayElement(rules.in);
    }
  }
  const parsedRules = parseRules(field, typeMin, typeMax, rules);
  return safeFieldFake(field, parsedRules) ?? safeFallback(parsedRules);
}

type ParsedRules = {
  min: bigint;
  max: bigint;
};

function parseRules(
  field: DescField,
  typeMin: bigint,
  typeMax: bigint,
  rules:
    | Int64Rules
    | UInt64Rules
    | Fixed64Rules
    | SFixed64Rules
    | SInt64Rules
    | undefined,
): ParsedRules {
  let min = typeMin;
  let max = typeMax;
  if (rules != undefined) {
    if (rules.notIn.length > 0) {
      throw new Error(
        `Cannot fake a value for ${field.toString()}: Field has a "not_in" rule.`,
      );
    }
    switch (rules.greaterThan.case) {
      case "gte":
        min = mathMax(min, rules.greaterThan.value);
        break;
      case "gt":
        min = mathMax(min, rules.greaterThan.value + BigInt(1));
        break;
    }
    switch (rules.lessThan.case) {
      case "lte":
        max = mathMin(max, rules.lessThan.value);
        break;
      case "lt":
        max = mathMin(max, rules.lessThan.value - BigInt(1));
        break;
    }
  }
  return {
    min,
    max,
  };
}

function safeFallback(parsedRules: ParsedRules): bigint {
  return faker.number.bigInt({
    min: parsedRules.min,
    max: parsedRules.max,
  });
}

function safeFieldFake(
  field: DescField,
  parsedRules: ParsedRules,
): bigint | undefined {
  if (
    (["port_number", "port_no"].includes(field.name) ||
      field.name.endsWith("_port_no") ||
      field.name.endsWith("_port")) &&
    parsedRules.min <= 0 &&
    parsedRules.max >= 65535
  ) {
    return BigInt(faker.internet.port());
  }
  if (
    ["http_status", "http_status_code"].includes(field.name) &&
    parsedRules.min <= 3 &&
    parsedRules.max >= 3
  ) {
    return BigInt(faker.internet.httpStatusCode());
  }
  return undefined;
}

function mathMin(a: bigint, b: bigint): bigint {
  if (a < b) {
    return a;
  }
  return b;
}

function mathMax(a: bigint, b: bigint): bigint {
  if (a > b) {
    return a;
  }
  return b;
}
