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
  if (field) {
    if (field.name == "email") {
      return faker.internet.email();
    }
    if (field.name == "first_name") {
      return faker.person.firstName();
    }
    if (field.name == "last_name") {
      return faker.person.lastName();
    }
    if (field.name == "user_name") {
      return faker.internet.userName();
    }
    if (
      field.name == "id" ||
      field.name == "uuid" ||
      field.name.endsWith("_id") ||
      field.name.endsWith("_uuid")
    ) {
      return faker.string.uuid();
    }
    if (field.name == "color") {
      return faker.color.human();
    }
    if (field.name == "vin") {
      return faker.vehicle.vin();
    }
    if (field.name == "file_name") {
      return faker.system.commonFileName();
    }
    if (field.name == "file_path") {
      return faker.system.filePath();
    }
    if (
      ["dir_path", "directory_path", "directory", "dir"].includes(field.name)
    ) {
      return faker.system.directoryPath();
    }
    if (field.name == "mime_type") {
      return faker.system.mimeType();
    }
    if (field.name == "isbn") {
      return faker.commerce.isbn();
    }
    if (["git_branch", "branch_name", "branch"].includes(field.name)) {
      return faker.git.branch();
    }
    if (["git_commit_message", "commit_message"].includes(field.name)) {
      return faker.git.commitMessage();
    }
    if (["domain_name", "domain", "host"].includes(field.name)) {
      return faker.internet.domainName();
    }
    if (["http_method", "http_verb"].includes(field.name)) {
      return faker.internet.httpMethod();
    }
    if (["http_status", "http_status_code"].includes(field.name)) {
      return faker.internet.httpStatusCode().toString();
    }
    if (
      field.name == "ip_v6" ||
      field.name.endsWith("_ip_v6") ||
      field.name.endsWith("_ipv6")
    ) {
      return faker.internet.ipv6();
    }
    if (
      field.name == "ip_v4" ||
      field.name.endsWith("_ip_v4") ||
      field.name.endsWith("_ipv4")
    ) {
      return faker.internet.ipv4();
    }
    if (
      field.name == "ip" ||
      field.name.endsWith("_ip") ||
      field.name.endsWith("_ip")
    ) {
      return faker.internet.ipv4();
    }
    if (
      ["mac_address", "mac"].includes(field.name) ||
      field.name.endsWith("_mac")
    ) {
      return faker.internet.mac();
    }
    if (
      field.name == "port_number" ||
      field.name == "port_no" ||
      field.name.endsWith("_port") ||
      field.name.endsWith("_port_no")
    ) {
      return faker.internet.port().toString();
    }
    if (
      field.name == "protocol" ||
      field.name == "http_protocol" ||
      field.name == "http_scheme" ||
      field.name == "scheme"
    ) {
      return faker.internet.protocol();
    }
    if (field.name == "url" || field.name.endsWith("_url")) {
      return faker.internet.url();
    }
    if (field.name == "user_agent") {
      return faker.internet.userAgent();
    }
    if (field.name == "slug" || field.name.endsWith("_slug")) {
      return faker.lorem.slug();
    }

    if (field.name == "text" || field.name.endsWith("_text")) {
      return faker.lorem.text();
    }
    if (
      field.name == "paragraph" ||
      field.name == "description" ||
      field.name.endsWith("_description")
    ) {
      return faker.lorem.paragraph();
    }
    if (field.name == "word") {
      return faker.lorem.word();
    }
    if (field.name == "words" && field.fieldKind == "list") {
      return faker.lorem.word();
    }
    if (field.name == "sentence") {
      return faker.lorem.sentence();
    }
  }
  return faker.lorem.word();
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
