import { faker } from "@faker-js/faker";
import { reflect, type ReflectMessage } from "@bufbuild/protobuf/reflect";
import { create, type DescField } from "@bufbuild/protobuf";
import { DateSchema } from "./gen/google/type/date_pb.js";
import { TimeOfDaySchema } from "./gen/google/type/timeofday_pb.js";
import { ColorSchema } from "./gen/google/type/color_pb.js";
import { FloatValueSchema } from "@bufbuild/protobuf/wkt";

export function fakeColor(message: ReflectMessage): boolean {
  if (message.desc.typeName != ColorSchema.typeName) {
    return false;
  }
  const rgb = faker.color.rgb({
    format: "decimal",
    includeAlpha: true,
  });
  message.set(ColorSchema.field.red, rgb[0]);
  message.set(ColorSchema.field.green, rgb[1]);
  message.set(ColorSchema.field.blue, rgb[2]);
  const alpha = create(FloatValueSchema, { value: rgb[3] });
  message.set(ColorSchema.field.alpha, reflect(FloatValueSchema, alpha));
  return true;
}

export function fakeTimeOfDay(message: ReflectMessage): boolean {
  if (message.desc.typeName != TimeOfDaySchema.typeName) {
    return false;
  }
  const date = faker.date.anytime();
  message.set(TimeOfDaySchema.field.hours, date.getUTCHours());
  message.set(TimeOfDaySchema.field.minutes, date.getUTCMinutes());
  message.set(TimeOfDaySchema.field.seconds, date.getUTCSeconds());
  message.set(TimeOfDaySchema.field.nanos, 0);
  return true;
}

export function fakeDate(message: ReflectMessage, field?: DescField): boolean {
  if (message.desc.typeName != DateSchema.typeName) {
    return false;
  }
  let date = faker.date.recent({
    days: 90,
  });
  if (field) {
    if (
      field.name == "birthdate" ||
      field.name == "birthday" ||
      field.name == "birth_date" ||
      field.name.startsWith("born_at")
    ) {
      date = faker.date.birthdate({ min: 18, max: 65, mode: "age" });
    }
  }
  message.set(DateSchema.field.year, date.getFullYear());
  message.set(DateSchema.field.month, date.getMonth() + 1);
  message.set(DateSchema.field.day, date.getDate());
  return true;
}
