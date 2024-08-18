import {
  create,
  DescEnum,
  DescField,
  DescMessage,
  isMessage,
  MessageShape,
  Registry,
  ScalarType,
} from "@bufbuild/protobuf";
import {
  reflect,
  reflectList,
  ReflectList,
  ReflectMap,
  ReflectMessage,
  ScalarValue,
} from "@bufbuild/protobuf/reflect";
import { faker } from "@faker-js/faker";
import {
  FLOAT32_MAX,
  FLOAT32_MIN,
  INT32_MAX,
  INT32_MIN,
  UINT32_MAX,
} from "@bufbuild/protobuf/wire";
import {
  anyPack,
  AnySchema,
  DurationSchema,
  FieldMaskSchema,
  timestampFromDate,
  TimestampSchema,
  ValueSchema,
} from "@bufbuild/protobuf/wkt";

export function fake<Desc extends DescMessage>(
  schema: Desc,
  options?: Partial<Options>,
  message?: MessageShape<Desc>,
): MessageShape<Desc> {
  const opt: Options = {
    ...options,
    maxDepth: options?.maxDepth ?? 4,
    bytesMin: options?.bytesMin ?? 0,
    bytesMax: options?.bytesMax ?? 4096,
    listMin: options?.listMin ?? 0,
    listMax: options?.listMax ?? 100,
    mapMin: options?.mapMin ?? 0,
    mapMax: options?.mapMax ?? 100,
  };
  const r = reflect(schema, message);
  fakeMessage(r, opt, 0);
  return r.message as MessageShape<Desc>;
}

// TODO option to not always populate optional fields?
interface Options {
  maxDepth: number;
  registry?: Registry;
  listMin: number;
  listMax: number;
  mapMin: number;
  mapMax: number;
  bytesMin: number;
  bytesMax: number;
}

function fakeMessage(
  message: ReflectMessage,
  opt: Options,
  depth: number,
  field?: DescField,
) {
  if (message.desc.typeName == TimestampSchema.typeName) {
    fakeTimestamp(message, field);
    return;
  }
  if (message.desc.typeName == DurationSchema.typeName) {
    fakeDuration(message, field);
    return;
  }
  if (message.desc.typeName == AnySchema.typeName) {
    fakeAny(message, opt, depth + 1, field);
    return;
  }
  if (message.desc.typeName == FieldMaskSchema.typeName) {
    fakeFieldMask(message);
    return;
  }
  for (const member of message.members) {
    if (member.kind == "field" && message.isSet(member)) {
      continue;
    }
    if (member.kind == "oneof" && message.oneofCase(member) != undefined) {
      continue;
    }
    let field: DescField;
    if (member.kind == "field") {
      field = member;
    } else {
      if (
        message.desc.typeName == ValueSchema.typeName &&
        depth + 1 > opt.maxDepth
      ) {
        // The oneof google.protobuf.Value.kind must always be populated
        // We select one of the scalar fields to make sure we don't exceed max depth
        field = faker.helpers.arrayElement(
          member.fields.filter((f) => f.fieldKind != "message"),
        );
      } else {
        field = faker.helpers.arrayElement(member.fields);
      }
    }
    switch (field.fieldKind) {
      case "message":
        if (depth + 1 <= opt.maxDepth) {
          const m = message.get(field);
          fakeMessage(m, opt, depth + 1, field);
          message.set(field, m);
        }
        break;
      case "scalar":
        message.set(field, fakeScalar(field.scalar, opt, field));
        break;
      case "enum":
        message.set(field, fakeEnum(field));
        break;
      case "list":
        fakeList(message.get(field), opt, depth);
        break;
      case "map":
        fakeMap(message.get(field), opt, depth);
        break;
    }
  }
}

function fakeMap(map: ReflectMap, opt: Options, depth: number) {
  const field = map.field();
  if (field.mapKind == "message" && depth + 1 > opt.maxDepth) {
    return;
  }
  let count = faker.number.int({ min: opt.listMin, max: opt.listMax });
  if (field.mapKey == ScalarType.BOOL) {
    count = Math.max(2, count);
  }
  while (map.size < count) {
    const key = fakeScalar(field.mapKey, opt);
    switch (field.mapKind) {
      case "enum":
        map.set(key, fakeEnum(field));
        break;
      case "scalar":
        map.set(key, fakeScalar(field.scalar, opt, field));
        break;
      case "message":
        const m = reflect(field.message);
        fakeMessage(m, opt, depth + 1, field);
        map.set(key, m);
        break;
    }
  }
}

function fakeList(list: ReflectList, opt: Options, depth: number) {
  const field = list.field();
  if (field.listKind == "message" && depth + 1 > opt.maxDepth) {
    return;
  }
  const count = faker.number.int({ min: opt.listMin, max: opt.listMax });
  while (list.size < count) {
    switch (field.listKind) {
      case "enum":
        list.add(fakeEnum(field));
        break;
      case "scalar":
        list.add(fakeScalar(field.scalar, opt, field));
        break;
      case "message":
        const m = reflect(field.message);
        fakeMessage(m, opt, depth + 1, field);
        list.add(m);
        break;
    }
  }
}

function fakeTimestamp(message: ReflectMessage, field?: DescField) {
  if (message.desc.typeName != TimestampSchema.typeName) {
    throw new Error(
      `Expected ${TimestampSchema.typeName}, got ${message.desc.typeName}`,
    );
  }
  const ts = timestampFromDate(faker.date.recent());
  message.set(TimestampSchema.field.seconds, ts.seconds);
  message.set(TimestampSchema.field.nanos, ts.nanos);
}

function fakeDuration(message: ReflectMessage, field?: DescField) {
  if (message.desc.typeName != DurationSchema.typeName) {
    throw new Error(
      `Expected ${DurationSchema.typeName}, got ${message.desc.typeName}`,
    );
  }
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
}

function fakeFieldMask(message: ReflectMessage) {
  if (!isMessage(message.message, FieldMaskSchema)) {
    throw new Error(
      `Expected ${AnySchema.typeName}, got ${message.desc.typeName}`,
    );
  }
  // Field masks paths must have a reversible JSON name.
  // Since we don't know which message the field mask applies to,
  // we simply ignore field masks for now.
}

function fakeAny(
  message: ReflectMessage,
  opt: Options,
  depth: number,
  field?: DescField,
) {
  if (!isMessage(message.message, AnySchema)) {
    throw new Error(
      `Expected ${AnySchema.typeName}, got ${message.desc.typeName}`,
    );
  }
  if (depth + 1 <= opt.maxDepth && opt.registry) {
    const types = Array.from(opt.registry).filter((t) => t.kind == "message");
    if (types.length > 0) {
      const type = faker.helpers.arrayElement(types);
      const msg = create(type);
      fakeMessage(reflect(type, msg), opt, depth + 1, field);
      anyPack(type, msg, message.message);
    }
  }
}

function fakeEnum(field: DescField & { enum: DescEnum }): number {
  const values =
    field.enum.open && field.enum.values.length > 1
      ? field.enum.values.slice(1)
      : field.enum.values;
  return faker.helpers.arrayElement(values).number;
}

function fakeString(field?: DescField): string {
  if (field?.name == "email") {
    return faker.internet.email();
  }
  if (field?.name == "first_name") {
    return faker.person.firstName();
  }
  if (field?.name == "last_name") {
    return faker.person.lastName();
  }
  if (field?.name == "description") {
    return faker.lorem.paragraphs({ min: 1, max: 10 });
  }
  return faker.string.sample();
}

function fakeScalar(
  scalar: ScalarType,
  opt: Options,
  field?: DescField,
): ScalarValue {
  switch (scalar) {
    case ScalarType.DOUBLE:
      return faker.number.float();
    case ScalarType.FLOAT:
      return faker.number.float({
        min: FLOAT32_MIN,
        max: FLOAT32_MAX,
      });
    case ScalarType.INT64:
      return faker.number.bigInt({
        min: BigInt("-9223372036854775808"),
        max: BigInt("9223372036854775807"),
      });
    case ScalarType.UINT64:
      return faker.number.bigInt({
        min: BigInt("0"),
        max: BigInt("18446744073709551615"),
      });
    case ScalarType.INT32:
      return faker.number.int({
        min: INT32_MIN,
        max: INT32_MAX,
      });
    case ScalarType.FIXED64:
      return faker.number.bigInt({
        min: BigInt("0"),
        max: BigInt("18446744073709551615"),
      });
    case ScalarType.FIXED32:
      return faker.number.int({
        min: 0,
        max: UINT32_MAX,
      });
    case ScalarType.BOOL:
      return (
        1 ===
        faker.number.int({
          min: 0,
          max: 1,
        })
      );
    case ScalarType.STRING:
      return fakeString(field);
    case ScalarType.BYTES:
      const count = faker.number.int({ min: opt.bytesMin, max: opt.bytesMax });
      const bytes = new Uint8Array(count);
      for (let i = 0; i < count; i++) {
        bytes[i] = faker.number.int({ min: 0, max: 255 });
      }
      return bytes;
    case ScalarType.UINT32:
      return faker.number.int({
        min: 0,
        max: UINT32_MAX,
      });
    case ScalarType.SFIXED32:
      return faker.number.int({
        min: INT32_MIN,
        max: INT32_MAX,
      });
    case ScalarType.SFIXED64:
      return faker.number.bigInt({
        min: BigInt("-9223372036854775808"),
        max: BigInt("9223372036854775807"),
      });
    case ScalarType.SINT32:
      return faker.number.int({
        min: INT32_MIN,
        max: INT32_MAX,
      });
    case ScalarType.SINT64:
      return faker.number.bigInt({
        min: BigInt("-9223372036854775808"),
        max: BigInt("9223372036854775807"),
      });
  }
}
