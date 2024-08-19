import { faker } from "@faker-js/faker";
import type { ReflectMessage } from "@bufbuild/protobuf/reflect";
import type { DescField } from "@bufbuild/protobuf";
import { DateSchema } from "./gen/google/type/date_pb.js";
import { TimeOfDaySchema } from "./gen/google/type/timeofday_pb.js";

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
