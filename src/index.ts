import {
  type DescEnum,
  type DescField,
  type DescMessage,
  type MessageShape,
  ScalarType,
} from "@bufbuild/protobuf";
import {
  reflect,
  type ReflectList,
  type ReflectMap,
  type ReflectMessage,
  type ScalarValue,
} from "@bufbuild/protobuf/reflect";
import {
  FLOAT32_MAX,
  FLOAT32_MIN,
  INT32_MAX,
  INT32_MIN,
  UINT32_MAX,
} from "@bufbuild/protobuf/wire";
import { ValueSchema } from "@bufbuild/protobuf/wkt";
import { faker } from "@faker-js/faker";
import { fakeDate, fakeTimeOfDay } from "./google-type.js";
import { makeOptions, type Options } from "./options.js";
import {
  fakeAny,
  fakeDuration,
  fakeFieldMask,
  fakeTimestamp,
} from "./well-known.js";

export function fake<Desc extends DescMessage>(
  schema: Desc,
  options?: Partial<Options>,
  message?: MessageShape<Desc>,
): MessageShape<Desc> {
  const r = reflect(schema, message);
  fakeMessage(r, makeOptions(options), 0);
  return r.message as MessageShape<Desc>;
}

function fakeMessage(
  message: ReflectMessage,
  opt: Options,
  depth: number,
  field?: DescField,
) {
  if (fakeTimeOfDay(message)) {
    return;
  }
  if (fakeDate(message, field)) {
    return;
  }
  if (fakeDate(message)) {
    return;
  }
  if (fakeFieldMask(message)) {
    return;
  }
  if (fakeDuration(message)) {
    return;
  }
  if (fakeTimestamp(message, field)) {
    return;
  }
  if (fakeAny(message, opt, depth + 1, fakeMessage, field)) {
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
    if (["phone", "telephone", "mobile", "landline"].includes(field.name)) {
      return faker.phone.number();
    }
    if (field.name == "bio") {
      return faker.person.bio();
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
    if (field.name == "imei") {
      return faker.phone.imei();
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
    if (isFieldHttpStatus(field)) {
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
    if (isFieldPortNumber(field)) {
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
      return fakeInt64(field);
    case ScalarType.UINT64:
      return fakeUInt64(field);
    case ScalarType.INT32:
      return fakeInt32(field);
    case ScalarType.FIXED64:
      return fakeUInt64(field);
    case ScalarType.FIXED32:
      return fakeUInt32(field);
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
      return fakeUInt32(field);
    case ScalarType.SFIXED32:
      return fakeInt32(field);
    case ScalarType.SFIXED64:
      return fakeInt64(field);
    case ScalarType.SINT32:
      return fakeInt32(field);
    case ScalarType.SINT64:
      return fakeInt64(field);
  }
}

function fakeInt32(field?: DescField): number {
  if (field != undefined) {
    if (isFieldPortNumber(field)) {
      return faker.internet.port();
    }
    if (isFieldHttpStatus(field)) {
      return faker.internet.httpStatusCode();
    }
  }
  return faker.number.int({
    min: INT32_MIN,
    max: INT32_MAX,
  });
}

function fakeUInt32(field?: DescField): number {
  if (field != undefined) {
    if (isFieldPortNumber(field)) {
      return faker.internet.port();
    }
    if (isFieldHttpStatus(field)) {
      return faker.internet.httpStatusCode();
    }
  }
  return faker.number.int({
    min: 0,
    max: UINT32_MAX,
  });
}

function fakeInt64(field?: DescField): bigint {
  return faker.number.bigInt({
    min: BigInt("-9223372036854775808"),
    max: BigInt("9223372036854775807"),
  });
}

function fakeUInt64(field?: DescField): bigint {
  return faker.number.bigInt({
    min: BigInt(0),
    max: BigInt("18446744073709551615"),
  });
}

function isFieldPortNumber(field: DescField): boolean {
  return (
    field.name == "port_number" ||
    field.name == "port_no" ||
    field.name.endsWith("_port") ||
    field.name.endsWith("_port_no")
  );
}

function isFieldHttpStatus(field: DescField): boolean {
  return ["http_status", "http_status_code"].includes(field.name);
}
