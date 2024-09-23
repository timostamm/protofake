import {
  type DescField,
  type DescMessage,
  type DescOneof,
  getOption,
  hasOption,
} from "@bufbuild/protobuf";
import {
  field as field_ext,
  type FieldConstraints,
  Ignore,
  type MapRules,
  message as message_ext,
  type MessageConstraints,
  oneof as oneof_ext,
  type OneofConstraints,
  type RepeatedRules,
} from "./gen/buf/validate/validate_pb.js";

type FieldConstraintType = Exclude<FieldConstraints["type"]["case"], undefined>;
type Rule<T extends FieldConstraintType> = (FieldConstraints["type"] & {
  case: T;
})["value"];

export function findValidationRules<T extends FieldConstraintType>(
  context: FieldValidation | undefined,
  type: T,
): Rule<T> | undefined {
  if (context === undefined) {
    return undefined;
  }
  if (context.disabled) {
    return undefined;
  }
  if (context.constraints === undefined) {
    return undefined;
  }
  if (context.constraints.ignore === Ignore.ALWAYS) {
    return undefined;
  }
  if (context.constraints.type.case !== type) {
    return undefined;
  }
  return context.constraints.type.value as Rule<T> | undefined;
}

type MessageValidation =
  | {
      constraints?: MessageConstraints;
      disabled: false;
    }
  | {
      constraints?: undefined;
      disabled: true;
    };

export function getMessageValidation(
  message: DescMessage,
  fieldContext: FieldValidation | undefined,
): MessageValidation {
  if (fieldContext?.disabled) {
    return {
      disabled: true,
    };
  }
  if (fieldContext?.constraints?.ignore === Ignore.ALWAYS) {
    return {
      disabled: true,
    };
  }
  if (!hasOption(message, message_ext)) {
    return {
      disabled: false,
    };
  }
  const constraints = getOption(message, message_ext);
  if (constraints.disabled === true) {
    return {
      disabled: true,
    };
  }
  return {
    disabled: false,
    constraints: constraints,
  };
}

export type OneofValidation =
  | {
      constraints?: OneofConstraints;
      disabled: false;
    }
  | {
      constraints?: undefined;
      disabled: true;
    };

export function getOneofValidation(
  oneof: DescOneof,
  messageContext: MessageValidation,
): OneofValidation {
  if (messageContext.disabled) {
    return {
      disabled: true,
    };
  }
  if (!hasOption(oneof, oneof_ext)) {
    return {
      disabled: false,
    };
  }
  return {
    disabled: false,
    constraints: getOption(oneof, oneof_ext),
  };
}

export type FieldValidation =
  | {
      constraints?: FieldConstraints;
      disabled: false;
    }
  | {
      constraints?: undefined;
      disabled: true;
    };

export function getFieldValidation(
  field: DescField,
  messageContext: MessageValidation,
): FieldValidation {
  if (messageContext.disabled) {
    return {
      disabled: true,
    };
  }
  if (!hasOption(field, field_ext)) {
    return {
      disabled: false,
    };
  }
  const constraints = getOption(field, field_ext);
  if (constraints.ignore == Ignore.ALWAYS) {
    return {
      disabled: true,
    };
  }
  return {
    constraints,
    disabled: false,
  };
}

export function getListItemValidation(
  fieldContext: FieldValidation,
  rules: RepeatedRules | undefined,
): FieldValidation {
  return getChild(fieldContext, rules?.items);
}

export function getMapKeyValidation(
  fieldContext: FieldValidation,
  rules: MapRules | undefined,
): FieldValidation {
  return getChild(fieldContext, rules?.keys);
}

export function getMapValueValidation(
  fieldContext: FieldValidation,
  rules: MapRules | undefined,
): FieldValidation {
  return getChild(fieldContext, rules?.values);
}

function getChild(
  fieldContext: FieldValidation,
  childConstraints: FieldConstraints | undefined,
): FieldValidation {
  if (fieldContext.disabled) {
    return {
      disabled: true,
    };
  }
  if (childConstraints === undefined) {
    return {
      disabled: false,
    };
  }
  if (childConstraints.ignore === Ignore.ALWAYS) {
    return {
      disabled: true,
    };
  }
  return {
    disabled: false,
    constraints: childConstraints,
  };
}
