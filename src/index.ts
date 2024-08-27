import {
  type DescField,
  type DescMessage,
  type MessageShape,
} from "@bufbuild/protobuf";
import { reflect, type ReflectMessage } from "@bufbuild/protobuf/reflect";
import { FeatureSet_FieldPresence, ValueSchema } from "@bufbuild/protobuf/wkt";
import { faker } from "@faker-js/faker";
import { fakeColor, fakeDate, fakeTimeOfDay } from "./google-type.js";
import { makeOptions, type Options } from "./options.js";
import {
  fakeAny,
  fakeDuration,
  fakeFieldMask,
  fakeTimestamp,
} from "./well-known.js";
import { fakeList } from "./list.js";
import { fakeMap } from "./map.js";
import { fakeScalar } from "./scalar.js";
import { fakeEnum } from "./enum.js";
import {
  type FieldValidation,
  getOneofValidation,
  getFieldValidation,
  getMessageValidation,
} from "./validate.js";

export function fake<Desc extends DescMessage>(
  schema: Desc,
  options?: Partial<Options>,
  message?: MessageShape<Desc>,
): MessageShape<Desc> {
  const r = reflect(schema, message);
  fakeMessage(r, makeOptions(options), 0, undefined, undefined);
  return r.message as MessageShape<Desc>;
}

function fakeMessage(
  message: ReflectMessage,
  opt: Options,
  depth: number,
  field: DescField | undefined,
  fieldValidation: FieldValidation | undefined,
) {
  if (fakeColor(message)) {
    return;
  }
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
  if (fakeDuration(message, field, fieldValidation)) {
    return;
  }
  if (fakeTimestamp(message, field, fieldValidation)) {
    return;
  }
  if (fakeAny(message, opt, depth + 1, field, fieldValidation, fakeMessage)) {
    return;
  }

  // TODO
  fieldValidation?.constraints?.cel;

  const messageValidation = getMessageValidation(message.desc, fieldValidation);

  // TODO
  messageValidation.constraints?.cel;

  for (const member of message.members) {
    if (member.kind == "field" && message.isSet(member)) {
      continue;
    }
    if (member.kind == "oneof" && message.oneofCase(member) != undefined) {
      continue;
    }
    let field: DescField;
    let oneofRequired = false;
    if (member.kind == "oneof") {
      const oneofValidation = getOneofValidation(member, messageValidation);
      oneofRequired =
        !oneofValidation.disabled &&
        oneofValidation.constraints?.required === true;
      if (
        message.desc.typeName == ValueSchema.typeName &&
        depth + 1 > opt.maxDepth
      ) {
        // TODO bail if oneof is required but cannot satisfy
        // The oneof google.protobuf.Value.kind must always be populated
        // We select one of the scalar fields to make sure we don't exceed max depth
        field = faker.helpers.arrayElement(
          member.fields.filter((f) => f.fieldKind != "message"),
        );
        // TODO field could be undefined here
      } else {
        field = faker.helpers.arrayElement(member.fields);
      }
    } else {
      field = member;
      oneofRequired = false;
    }

    const fieldValidation = getFieldValidation(field, messageValidation);
    const optional =
      field.presence !== FeatureSet_FieldPresence.LEGACY_REQUIRED &&
      fieldValidation.constraints?.required !== true &&
      !oneofRequired;
    // TODO
    //const populate = shouldPopulate(optional, opt);

    switch (field.fieldKind) {
      case "message":
        if (depth + 1 <= opt.maxDepth) {
          const m = message.get(field);
          fakeMessage(m, opt, depth + 1, field, fieldValidation);
          message.set(field, m);
        }
        break;
      case "scalar":
        message.set(
          field,
          fakeScalar(field.scalar, opt, field, fieldValidation),
        );
        break;
      case "enum":
        message.set(field, fakeEnum(field, fieldValidation));
        break;
      case "list":
        fakeList(message.get(field), opt, depth, fieldValidation, fakeMessage);
        break;
      case "map":
        fakeMap(message.get(field), opt, depth, fieldValidation, fakeMessage);
        break;
    }
  }
}

function shouldPopulate(optional: boolean, opt: Options): boolean {
  if (!optional) {
    return true;
  }
  let probability: number;
  switch (opt.populateOptional) {
    case true:
      probability = 1;
      break;
    case false:
      probability = 0;
      break;
    default:
      probability = opt.populateOptional;
  }
  return faker.datatype.boolean({ probability });
}
