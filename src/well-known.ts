import { reflect, type ReflectMessage } from "@bufbuild/protobuf/reflect";
import type { Options } from "./options.js";
import { create, type DescField, isMessage } from "@bufbuild/protobuf";
import {
  anyPack,
  AnySchema,
  DurationSchema,
  FieldMaskSchema,
  timestampFromDate,
  TimestampSchema,
} from "@bufbuild/protobuf/wkt";
import { faker } from "@faker-js/faker";
import { type FieldValidation, findValidationRules } from "./validate.js";

export function fakeAny(
  message: ReflectMessage,
  opt: Options,
  depth: number,
  field: DescField | undefined,
  fieldContext: FieldValidation | undefined,
  fakeMessage: (
    message: ReflectMessage,
    opt: Options,
    depth: number,
    field: DescField | undefined,
    fieldContext: FieldValidation | undefined,
  ) => void,
): boolean {
  if (!isMessage(message.message, AnySchema)) {
    return false;
  }
  const rules = findValidationRules(fieldContext, "any");

  // TODO
  rules?.in;
  rules?.notIn;

  if (depth + 1 <= opt.maxDepth && opt.registry) {
    const types = Array.from(opt.registry).filter((t) => t.kind == "message");
    if (types.length > 0) {
      const type = faker.helpers.arrayElement(types);
      const msg = create(type);
      fakeMessage(reflect(type, msg), opt, depth + 1, field, fieldContext);
      anyPack(type, msg, message.message);
    }
  }
  return true;
}

export function fakeDuration(
  message: ReflectMessage,
  field: DescField | undefined,
  fieldContext: FieldValidation | undefined,
): boolean {
  if (message.desc.typeName != DurationSchema.typeName) {
    return false;
  }

  const rules = findValidationRules(fieldContext, "duration");

  // TODO
  rules?.const;
  rules?.greaterThan;
  rules?.lessThan;
  rules?.in;
  rules?.notIn;

  const seconds = faker.number.bigInt({
    min: -315_576_000_000,
    max: 315_576_000_000,
  });
  message.set(DurationSchema.field.seconds, seconds);
  let nanos: number;
  if (seconds > 0) {
    nanos = faker.number.int({
      min: 0,
      max: 999_999_999,
    });
  } else if (seconds < 0) {
    nanos = faker.number.int({
      min: -999_999_999,
      max: 0,
    });
  } else {
    nanos = faker.number.int({
      min: -999_999_999,
      max: 999_999_999,
    });
  }
  message.set(DurationSchema.field.nanos, nanos);
  return true;
}

export function fakeFieldMask(message: ReflectMessage): boolean {
  if (!isMessage(message.message, FieldMaskSchema)) {
    return false;
  }
  // Field masks paths must have a reversible JSON name.
  // Since we don't know which message the field mask applies to,
  // we simply ignore field masks for now.
  return true;
}

export function fakeTimestamp(
  message: ReflectMessage,
  field: DescField | undefined,
  fieldContext: FieldValidation | undefined,
): boolean {
  if (message.desc.typeName != TimestampSchema.typeName) {
    return false;
  }

  const rules = findValidationRules(fieldContext, "timestamp");

  // TODO
  rules?.const;
  rules?.greaterThan;
  rules?.lessThan;
  rules?.within;

  let date = faker.date.recent();
  if (field) {
    if (
      [
        "exp",
        "nbf",
        "expires_at",
        "expires",
        "expiration",
        "not_before",
      ].includes(field.name)
    ) {
      date = faker.date.soon();
    } else if (field.name == "birthdate" || field.name.startsWith("born_at")) {
      date = faker.date.birthdate({ min: 18, max: 65, mode: "age" });
    }
  }
  const ts = timestampFromDate(date);
  message.set(TimestampSchema.field.seconds, ts.seconds);
  message.set(TimestampSchema.field.nanos, ts.nanos);
  return true;
}
