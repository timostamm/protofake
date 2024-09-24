import { type DescField } from "@bufbuild/protobuf";
import {
  type DoubleRules,
  type FloatRules,
} from "./gen/buf/validate/validate_pb.js";
import { faker } from "@faker-js/faker";
import { ValueSchema } from "@bufbuild/protobuf/wkt";

// TODO validate that min / max is sound in parseRules, see string.ts

export function fakeFloat(
  field: DescField,
  typeMin: number,
  typeMax: number,
  rules?: FloatRules | DoubleRules,
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
  nan: boolean;
  posInf: boolean;
  negInf: boolean;
};

function parseRules(
  field: DescField,
  typeMin: number,
  typeMax: number,
  rules: FloatRules | DoubleRules | undefined,
): ParsedRules {
  let min = typeMin;
  let max = typeMax;
  let nan = true;
  let posInf = true;
  let negInf = true;
  if (rules != undefined) {
    if (rules.notIn.length > 0) {
      throw new Error(
        `Cannot fake a value for ${field.toString()}: Field has a "not_in" rule.`,
      );
    }
    switch (rules.greaterThan.case) {
      case "gte":
        min = Math.max(min, rules.greaterThan.value);
        negInf = false;
        break;
      case "gt":
        min = Math.max(min, rules.greaterThan.value + 1);
        negInf = false;
        break;
    }
    switch (rules.lessThan.case) {
      case "lte":
        max = Math.min(max, rules.lessThan.value);
        posInf = false;
        break;
      case "lt":
        max = Math.min(max, rules.lessThan.value - 1);
        posInf = false;
        break;
    }
    if (rules.finite) {
      posInf = negInf = nan = false;
    }
  }
  if (
    field.parent.typeName == ValueSchema.typeName &&
    field.name == ValueSchema.field.numberValue.name
  ) {
    // google.protobuf.Value cannot be NaN or Infinity
    nan = posInf = negInf = false;
  }
  return {
    min,
    max,
    nan,
    posInf,
    negInf,
  };
}

function safeFallback(parsedRules: ParsedRules): number {
  if (parsedRules.nan && faker.datatype.boolean({ probability: 0.01 })) {
    return Number.NaN;
  }
  if (parsedRules.posInf && faker.datatype.boolean({ probability: 0.01 })) {
    return Number.POSITIVE_INFINITY;
  }
  if (parsedRules.negInf && faker.datatype.boolean({ probability: 0.01 })) {
    return Number.NEGATIVE_INFINITY;
  }
  return faker.number.float({
    min: parsedRules.min,
    max: parsedRules.max,
  });
}

function safeFieldFake(
  field: DescField,
  parsedRules: ParsedRules,
): number | undefined {
  if (
    ["lat", "latitude"].includes(field.name) &&
    parsedRules.max >= -90 &&
    parsedRules.min <= 90
  ) {
    return faker.location.latitude({
      min: Math.max(-90, parsedRules.min),
      max: Math.min(90, parsedRules.max),
    });
  }
  if (
    ["lng", "longitude"].includes(field.name) &&
    parsedRules.max >= -180 &&
    parsedRules.min <= 180
  ) {
    return faker.location.longitude({
      min: Math.max(-180, parsedRules.min),
      max: Math.min(180, parsedRules.max),
    });
  }
  return undefined;
}
