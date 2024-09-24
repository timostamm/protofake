import { type DescField } from "@bufbuild/protobuf";
import type {
  Fixed32Rules,
  Int32Rules,
  SFixed32Rules,
  SInt32Rules,
  UInt32Rules,
} from "./gen/buf/validate/validate_pb.js";
import { faker } from "@faker-js/faker";

// TODO validate that min / max is sound in parseRules, see string.ts

export function fakeInt32(
  field: DescField,
  typeMin: number,
  typeMax: number,
  rules?: Int32Rules | SInt32Rules | SFixed32Rules | UInt32Rules | Fixed32Rules,
): number {
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
  min: number;
  max: number;
};

function parseRules(
  field: DescField,
  typeMin: number,
  typeMax: number,
  rules:
    | Int32Rules
    | SInt32Rules
    | SFixed32Rules
    | UInt32Rules
    | Fixed32Rules
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
        min = Math.max(min, rules.greaterThan.value);
        break;
      case "gt":
        min = Math.max(min, rules.greaterThan.value + 1);
        break;
    }
    switch (rules.lessThan.case) {
      case "lte":
        max = Math.min(max, rules.lessThan.value);
        break;
      case "lt":
        max = Math.min(max, rules.lessThan.value - 1);
        break;
    }
  }
  return {
    min,
    max,
  };
}

function safeFallback(parsedRules: ParsedRules): number {
  return faker.number.int({ min: parsedRules.min, max: parsedRules.max });
}

function safeFieldFake(
  field: DescField,
  parsedRules: ParsedRules,
): number | undefined {
  if (
    (["port_number", "port_no"].includes(field.name) ||
      field.name.endsWith("_port_no") ||
      field.name.endsWith("_port")) &&
    parsedRules.min <= 0 &&
    parsedRules.max >= 65535
  ) {
    return faker.internet.port();
  }
  if (
    ["http_status", "http_status_code"].includes(field.name) &&
    parsedRules.min <= 3 &&
    parsedRules.max >= 3
  ) {
    return faker.internet.httpStatusCode();
  }
  return undefined;
}
