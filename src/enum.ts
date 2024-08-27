import { type DescEnum, type DescField } from "@bufbuild/protobuf";
import { faker } from "@faker-js/faker";
import { type FieldValidation, findValidationRules } from "./validate.js";

export function fakeEnum(
  field: DescField & { enum: DescEnum },
  validation: FieldValidation,
): number {
  let values = field.enum.open && field.enum.values.length > 1
      ? field.enum.values.slice(1)
      : field.enum.values;
  const rules = findValidationRules(validation, "enum");
  if (rules != undefined) {
    if (rules.const != undefined) {
      return rules.const;
    }
    if (rules.in.length > 0) {
      return faker.helpers.arrayElement(rules.in);
    }
    values = values.filter(value => !rules.notIn.includes(value.number));
    if (values.length == 0) {
      throw new Error(
        `Cannot fake a value for ${field.toString()}: The "not_in" rule is too restrictive.`,
      );
    }
  }
  return faker.helpers.arrayElement(values).number;
}
