import { type DescField, ScalarType } from "@bufbuild/protobuf";
import type { Options } from "./options.js";
import type { ScalarValue } from "@bufbuild/protobuf/reflect";
import {
  FLOAT32_MAX,
  FLOAT32_MIN,
  INT32_MAX,
  INT32_MIN,
  UINT32_MAX,
} from "@bufbuild/protobuf/wire";
import { fakeString } from "./string.js";
import { fakeInt32 } from "./int32.js";
import { fakeFloat } from "./float.js";
import { fakeInt64 } from "./int64.js";
import { fakeBool } from "./bool.js";
import { fakeBytes } from "./bytes.js";
import { type FieldValidation, findValidationRules } from "./validate.js";

// TODO constraints
// TODO test disabled rules
// TODO test ignored rules

export function fakeScalar(
  scalar: ScalarType,
  opt: Options,
  field: DescField,
  validation: FieldValidation,
): ScalarValue {
  switch (scalar) {
    case ScalarType.DOUBLE:
      return fakeFloat(
        field,
        Number.MIN_VALUE,
        Number.MAX_VALUE,
        findValidationRules(validation, "double"),
      );
    case ScalarType.FLOAT:
      return fakeFloat(
        field,
        FLOAT32_MIN,
        FLOAT32_MAX,
        findValidationRules(validation, "float"),
      );
    case ScalarType.INT64:
      return fakeInt64(
        field,
        BigInt("-9223372036854775808"),
        BigInt("9223372036854775807"),
        findValidationRules(validation, "int64"),
      );
    case ScalarType.UINT64:
      return fakeInt64(
        field,
        BigInt(0),
        BigInt("18446744073709551615"),
        findValidationRules(validation, "uint64"),
      );
    case ScalarType.INT32:
      return fakeInt32(
        field,
        INT32_MIN,
        INT32_MAX,
        findValidationRules(validation, "int32"),
      );
    case ScalarType.SFIXED32:
      return fakeInt32(
        field,
        INT32_MIN,
        INT32_MAX,
        findValidationRules(validation, "sfixed32"),
      );
    case ScalarType.SINT32:
      return fakeInt32(
        field,
        INT32_MIN,
        INT32_MAX,
        findValidationRules(validation, "sint32"),
      );
    case ScalarType.FIXED64:
      return fakeInt64(
        field,
        BigInt(0),
        BigInt("18446744073709551615"),
        findValidationRules(validation, "fixed64"),
      );
    case ScalarType.FIXED32:
      return fakeInt32(
        field,
        0,
        UINT32_MAX,
        findValidationRules(validation, "fixed32"),
      );
    case ScalarType.UINT32:
      return fakeInt32(
        field,
        0,
        UINT32_MAX,
        findValidationRules(validation, "uint32"),
      );
    case ScalarType.BOOL:
      return fakeBool(findValidationRules(validation, "bool"));
    case ScalarType.STRING:
      return fakeString(field, findValidationRules(validation, "string"));
    case ScalarType.BYTES: {
      return fakeBytes(field, opt, findValidationRules(validation, "bytes"));
    }
    case ScalarType.SFIXED64:
      return fakeInt64(
        field,
        BigInt("-9223372036854775808"),
        BigInt("9223372036854775807"),
        findValidationRules(validation, "sfixed64"),
      );
    case ScalarType.SINT64:
      return fakeInt64(
        field,
        BigInt("-9223372036854775808"),
        BigInt("9223372036854775807"),
        findValidationRules(validation, "sint64"),
      );
  }
}
