import { type DescField } from "@bufbuild/protobuf";
import {
  reflect,
  type ReflectList,
  type ReflectMessage,
} from "@bufbuild/protobuf/reflect";
import type { Options } from "./options.js";
import { faker } from "@faker-js/faker";
import { fakeEnum } from "./enum.js";
import { fakeScalar } from "./scalar.js";
import {
  type FieldValidation,
  findValidationRules,
  getListItemValidation,
} from "./validate.js";

export function fakeList(
  list: ReflectList,
  opt: Options,
  depth: number,
  validation: FieldValidation,
  fakeMessage: (
    message: ReflectMessage,
    opt: Options,
    depth: number,
    field: DescField | undefined,
    fieldValidation: FieldValidation | undefined,
  ) => void,
): void {
  const field = list.field();
  let { listMin, listMax } = opt;

  const rules = findValidationRules(validation, "repeated");
  const items = getListItemValidation(validation, rules);

  if (rules?.minItems) {
    listMin = Number(rules.minItems);
  }
  if (rules?.maxItems) {
    listMax = Number(rules.maxItems);
  }

  // TODO constraints.cel
  // TODO rules.unique

  if (validation?.constraints?.required && listMin < 1) {
    listMin = 1;
  }
  if (listMin > listMax) {
    listMax = listMin;
  }
  if (listMin < 1 && field.listKind == "message" && depth + 1 > opt.maxDepth) {
    return;
  }
  const count = faker.number.int({ min: listMin, max: listMax });

  while (list.size < count) {
    switch (field.listKind) {
      case "enum":
        list.add(fakeEnum(field, items));
        break;
      case "scalar":
        list.add(fakeScalar(field.scalar, opt, field, items));
        break;
      case "message": {
        const m = reflect(field.message);
        fakeMessage(m, opt, depth + 1, field, items);
        list.add(m);
        break;
      }
    }
  }
}
