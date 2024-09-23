import { type DescField } from "@bufbuild/protobuf";
import { faker } from "@faker-js/faker";
import { type StringRules } from "./gen/buf/validate/validate_pb.js";

type FieldFaker = {
  field: string[] | ((field: DescField) => boolean);
  str: readonly string[] | (() => string);
};

type ParsedRules = {
  minCodePoints?: number;
  maxCodePoints?: number;
  minBytes?: number;
  maxBytes?: number;
  prefix?: string;
  suffix?: string;
  contains?: string;
};

const defaultMax = 50;

const fieldFakers: FieldFaker[] = [
  {
    field: ["email"],
    str: faker.internet.email,
  },
  {
    field: ["first_name"],
    str: faker.person.firstName,
  },
  {
    field: ["last_name"],
    str: faker.person.lastName,
  },
  {
    field: ["user_name"],
    str: faker.internet.userName,
  },
  {
    field: ["phone", "telephone", "mobile", "landline"],
    str: faker.phone.number,
  },
  {
    field: ["bio"],
    str: faker.person.bio,
  },
  {
    field: ["country"],
    str: faker.location.country,
  },
  {
    field: ["state"],
    str: faker.location.state,
  },
  {
    field: ["county"],
    str: faker.location.county,
  },
  {
    field: ["city"],
    str: faker.location.city,
  },
  {
    field: ["zip", "zip_code"],
    str: faker.location.zipCode,
  },
  {
    field: ["street"],
    str: faker.location.street,
  },
  {
    field: ["street_address"],
    str: faker.location.streetAddress,
  },
  {
    field: ["time_zone", "timezone"],
    str: faker.definitions.location.time_zone,
  },
  {
    field: (field) =>
      ["id", "uuid"].includes(field.name) ||
      field.name.endsWith("_id") ||
      field.name.endsWith("_uuid"),
    str: faker.string.uuid,
  },
  {
    field: ["color"],
    str: faker.definitions.color.human,
  },
  {
    field: ["vin"],
    str: faker.vehicle.vin,
  },
  {
    field: ["file_name", "filename"],
    str: faker.system.commonFileName,
  },
  {
    field: ["file_path", "filepath"],
    str: faker.system.filePath,
  },
  {
    field: ["dir_path", "directory_path", "directory", "dir"],
    str: faker.system.directoryPath,
  },
  {
    field: ["mime_type"],
    str: faker.system.mimeType,
  },
  {
    field: ["isbn"],
    str: faker.commerce.isbn,
  },
  {
    field: ["imei"],
    str: faker.phone.imei,
  },
  {
    field: ["git_branch", "branch_name", "branch"],
    str: faker.git.branch,
  },
  {
    field: ["git_commit_message", "commit_message"],
    str: faker.git.commitMessage,
  },
  {
    field: ["domain_name", "domain", "host"],
    str: faker.internet.domainName,
  },
  {
    field: ["http_method", "http_verb"],
    str: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  },
  {
    field: ["http_status", "http_status_code"],
    str: [
      ...faker.definitions.internet.http_status_code.clientError,
      ...faker.definitions.internet.http_status_code.redirection,
      ...faker.definitions.internet.http_status_code.success,
      ...faker.definitions.internet.http_status_code.informational,
      ...faker.definitions.internet.http_status_code.serverError,
    ].map((code) => code.toString()),
  },
  {
    field: (field) =>
      ["ip_v6", "ipv6"].includes(field.name) ||
      field.name.endsWith("_ip_v6") ||
      field.name.endsWith("_ipv6"),
    str: faker.internet.ipv6,
  },
  {
    field: (field) =>
      ["ip_v4", "ipv4"].includes(field.name) ||
      field.name.endsWith("_ip_v4") ||
      field.name.endsWith("_ipv4"),
    str: faker.internet.ipv4,
  },
  {
    field: (field) => field.name === "ip" || field.name.endsWith("_ip"),
    str: faker.internet.ip,
  },
  {
    field: (field) =>
      ["mac_address", "mac"].includes(field.name) ||
      field.name.endsWith("_mac"),
    str: faker.internet.mac,
  },
  {
    field: (field) =>
      ["port_number", "port_no"].includes(field.name) ||
      field.name.endsWith("_port_no") ||
      field.name.endsWith("_port"),
    str: () => faker.internet.port().toString(),
  },
  {
    field: ["protocol", "http_protocol", "http_scheme", "scheme"],
    str: ["http", "https"],
  },
  {
    field: (field) =>
      ["url"].includes(field.name) || field.name.endsWith("_url"),
    str: faker.internet.url,
  },
  {
    field: ["user_agent"],
    str: faker.internet.userAgent,
  },
  {
    field: (field) =>
      ["slug"].includes(field.name) || field.name.endsWith("_slug"),
    str: faker.lorem.slug,
  },
  {
    field: (field) =>
      ["text"].includes(field.name) || field.name.endsWith("_text"),
    str: faker.lorem.text,
  },
  {
    field: (field) =>
      ["paragraph", "description"].includes(field.name) ||
      field.name.endsWith("_description"),
    str: faker.lorem.paragraph,
  },
  {
    field: (field) =>
      field.name == "word" ||
      (field.name == "words" && field.fieldKind == "list"),
    str: faker.lorem.word,
  },
  {
    field: ["sentence"],
    str: faker.lorem.sentence,
  },
];

export function fakeString(field: DescField, rules?: StringRules): string {
  if (rules !== undefined) {
    // The following rules allow us to exit early. We do not check whether the
    // rules are satisfiable. For example, there could be a `min_len` rule that
    // contradicts the `const` rule.
    // We do validate rules in `parseRules`, but only because we don't want
    // to enter an unexpected code path.
    if (rules.const != undefined) {
      return rules.const;
    }
    if (rules.in.length > 0) {
      return faker.helpers.arrayElement(rules.in);
    }
  }
  const parsedRules = rules === undefined ? {} : parseRules(field, rules);
  if (rules !== undefined) {
    // TODO
    if (rules.pattern !== undefined) {
      // TODO bail when others are set? min / max len?  and contains and not_contains?
      faker.helpers.fromRegExp(rules.pattern);
    }

    // TODO
    switch (rules.wellKnown.case) {
      case "email":
        faker.internet.email();
        break;
      case "hostname":
        faker.string.alpha({
          casing: "lower",
        });
        faker.internet.domainSuffix();
        faker.internet.domainName();
        break;
      case "ip":
        break;
      case "ipv4":
        break;
      case "ipv6":
        break;
      case "uri":
        break;
      case "uriRef":
        break;
      case "address":
        break;
      case "uuid":
        break;
      case "tuuid":
        break;
      case "ipWithPrefixlen":
        break;
      case "ipv4WithPrefixlen":
        break;
      case "ipv6WithPrefixlen":
        break;
      case "ipPrefix":
        break;
      case "ipv4Prefix":
        break;
      case "ipv6Prefix":
        break;
      case "hostAndPort":
        break;
      case "wellKnownRegex":
        // TODO
        // rules.strict;
        break;
    }
  }

  return (
    safeFieldFake(field, parsedRules, fieldFakers) ??
    safeWord(parsedRules) ??
    safeFallback(field, parsedRules)
  );
}

function parseRules(field: DescField, rules: StringRules): ParsedRules {
  let minCodePoints: number | undefined;
  let maxCodePoints: number | undefined;
  let minBytes: number | undefined;
  let maxBytes: number | undefined;
  if (rules.const != undefined) {
    throw new Error("unexpected const");
  }
  if (rules.in.length > 0) {
    throw new Error("unexpected in");
  }
  if (rules.notIn.length > 0) {
    throw new Error(
      `Cannot fake a value for ${field.toString()}: Field has a "not_in" rule.`,
    );
  }
  if (rules.notContains !== undefined && rules.notContains !== "") {
    throw new Error(
      `Cannot fake a value for ${field.toString()}: Field has a "not_contains" rule.`,
    );
  }
  if (rules.len !== undefined) {
    minCodePoints = maxCodePoints = Number(rules.len);
  }
  if (rules.lenBytes !== undefined) {
    minBytes = maxBytes = Number(rules.lenBytes);
  }
  if (rules.minLen !== undefined) {
    minCodePoints = Number(rules.minLen);
  }
  if (rules.maxLen !== undefined) {
    maxCodePoints = Number(rules.maxLen);
  }
  if (rules.minBytes !== undefined) {
    minBytes = Number(rules.minBytes);
  }
  if (rules.maxBytes !== undefined) {
    maxBytes = Number(rules.maxBytes);
  }
  if (
    minCodePoints !== undefined &&
    maxCodePoints !== undefined &&
    minCodePoints > maxCodePoints
  ) {
    throw new Error(
      `Cannot fake a string for ${field.toString()}: Field has conflicting rules for "min_len" and "max_len".`,
    );
  }
  if (minBytes !== undefined && maxBytes !== undefined && minBytes > maxBytes) {
    throw new Error(
      `Cannot fake a string for ${field.toString()}: Field has conflicting rules for "min_bytes" and "max_bytes".`,
    );
  }
  if (
    minCodePoints !== undefined &&
    maxBytes !== undefined &&
    minCodePoints > maxBytes
  ) {
    throw new Error(
      `Cannot fake a string for ${field.toString()}: Field has conflicting rules for "min_len" and "max_bytes".`,
    );
  }
  if (
    minBytes !== undefined &&
    maxCodePoints !== undefined &&
    minBytes > maxCodePoints
  ) {
    throw new Error(
      `Cannot fake a string for ${field.toString()}: Field has conflicting rules for "min_bytes" and "max_len".`,
    );
  }
  if (
    minCodePoints !== undefined &&
    maxBytes !== undefined &&
    minCodePoints > maxBytes
  ) {
    throw new Error(
      `Cannot fake a string for ${field.toString()}: Field has conflicting rules for "min_len" and "max_bytes".`,
    );
  }
  return {
    minCodePoints,
    maxCodePoints,
    minBytes,
    maxBytes,
    prefix: rules.prefix,
    suffix: rules.suffix,
    contains: rules.contains,
  };
}

function safeWord(parsedRuled: ParsedRules): string | undefined {
  const min = parsedRuled.minBytes ?? parsedRuled.minCodePoints ?? 0;
  const max =
    parsedRuled.maxBytes ?? parsedRuled.maxCodePoints ?? min + defaultMax;
  const word = faker.lorem.word({
    length: { min, max },
    strategy: "shortest",
  });
  return isSafeString(word, parsedRuled) ? word : undefined;
}

function safeFieldFake(
  field: DescField,
  parsedRuled: ParsedRules,
  fakers: FieldFaker[],
) {
  for (const f of fakers) {
    if (typeof f.field == "function") {
      if (!f.field(field)) {
        continue;
      }
    } else {
      if (!f.field.includes(field.name)) {
        continue;
      }
    }
    if (typeof f.str == "function") {
      const s = f.str();
      if (isSafeString(s, parsedRuled)) {
        return s;
      }
    } else {
      const safe = f.str.filter((s) => isSafeString(s, parsedRuled));
      if (safe.length > 0) {
        return faker.helpers.arrayElement(safe);
      }
    }
  }
}

function isSafeString(s: string, r: ParsedRules): boolean {
  if (r.minCodePoints !== undefined || r.maxCodePoints !== undefined) {
    const lenCodePoints = countCodePoints(s);
    if (r.minCodePoints !== undefined && lenCodePoints < r.minCodePoints) {
      return false;
    }
    if (r.maxCodePoints !== undefined && lenCodePoints > r.maxCodePoints) {
      return false;
    }
  }
  if (r.minBytes !== undefined || r.maxBytes !== undefined) {
    const lenBytes = countBytes(s);
    if (r.minBytes !== undefined && lenBytes < r.minBytes) {
      return false;
    }
    if (r.maxBytes !== undefined && lenBytes > r.maxBytes) {
      return false;
    }
  }
  if (r.prefix !== undefined && !s.startsWith(r.prefix)) {
    return false;
  }
  if (r.suffix !== undefined && !s.endsWith(r.suffix)) {
    return false;
  }
  if (r.contains !== undefined && !s.includes(r.contains)) {
    return false;
  }
  return true;
}

function safeFallback(field: DescField, r: ParsedRules) {
  console.log("safeFallback", r);
  const fixedCodePoints = countFixed(r, countCodePoints);
  console.log("fixedCodePoints:", fixedCodePoints);
  const fixedBytes = countFixed(r, countBytes);
  console.log("fixedBytes:", fixedBytes);
  let min = 0;
  let max = defaultMax;
  if (r.minBytes !== undefined) {
    min = Math.max(0, r.minBytes - fixedBytes);
  } else if (r.minCodePoints !== undefined) {
    min = Math.max(0, r.minCodePoints - fixedCodePoints);
  }
  if (r.maxBytes !== undefined) {
    if (fixedBytes > r.maxBytes) {
      throw new Error(
        `Cannot fake a string for ${field.toString()}: Field has rules for "prefix", "suffix" or "contains" that already exceed the rule for maximum length in bytes.`,
      );
    }
    max = r.maxBytes - fixedBytes;
  }
  if (r.maxCodePoints !== undefined) {
    if (fixedCodePoints > r.maxCodePoints) {
      throw new Error(
        `Cannot fake a string for ${field.toString()}: Field has rules for "prefix", "suffix" or "contains" that already exceed the rule for maximum length.`,
      );
    }
    max = r.maxCodePoints - fixedCodePoints;
  }

  let str = faker.string.alpha({
    length: { min, max },
    casing: "lower",
  });
  if (r.prefix !== undefined) {
    str = r.prefix + str;
  }
  if (r.contains !== undefined) {
    str = str + r.contains;
  }
  if (r.suffix !== undefined) {
    str = str + r.suffix;
  }
  return str;
}

function countFixed(
  r: Pick<ParsedRules, "prefix" | "suffix" | "contains">,
  count: (str: string) => number,
) {
  let i = 0;
  if (r.prefix !== undefined) {
    i += count(r.prefix);
  }
  if (r.suffix !== undefined) {
    i += count(r.suffix);
  }
  if (r.contains !== undefined) {
    i += count(r.contains);
  }
  return i;
}

function countCodePoints(s: string): number {
  let count = 0;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  for (const _ of s) {
    count++;
  }
  return count;
}

function countBytes(s: string): number {
  return new TextEncoder().encode(s).byteLength;
}
