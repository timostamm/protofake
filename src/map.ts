import { type DescField } from "@bufbuild/protobuf";
import {
  reflect,
  type ReflectMap,
  type ReflectMessage,
} from "@bufbuild/protobuf/reflect";
import type { Options } from "./options.js";
import { faker } from "@faker-js/faker";
import { fakeEnum } from "./enum.js";
import { fakeScalar } from "./scalar.js";
import {
  type FieldValidation,
  findValidationRules,
  getMapKeyValidation,
  getMapValueValidation,
} from "./validate.js";

export function fakeMap(
  map: ReflectMap,
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
  const field = map.field();
  if (field.mapKind == "message" && depth + 1 > opt.maxDepth) {
    return;
  }
  let { mapMin, mapMax } = opt;
  const rules = findValidationRules(validation, "map");
  const keys = getMapKeyValidation(validation, rules);
  const values = getMapValueValidation(validation, rules);
  if (rules?.minPairs) {
    mapMin = Number(rules.minPairs);
  }
  if (rules?.maxPairs) {
    mapMax = Number(rules.maxPairs);
  }

  // TODO constraints.cel

  if (validation?.constraints?.required && mapMin < 1) {
    mapMin = 1;
  }
  if (mapMin > mapMax) {
    mapMax = mapMin;
  }
  const count = faker.number.int({ min: mapMin, max: mapMax });

  while (map.size < count) {
    const key = fakeScalar(field.mapKey, opt, field, keys);
    switch (field.mapKind) {
      case "enum":
        map.set(key, fakeEnum(field, values));
        break;
      case "scalar":
        map.set(key, fakeScalar(field.scalar, opt, field, values));
        break;
      case "message": {
        const m = reflect(field.message);
        fakeMessage(m, opt, depth + 1, field, values);
        map.set(key, m);
        break;
      }
    }
  }
}
