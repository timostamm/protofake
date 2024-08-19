import { suite, test } from "node:test";
import { fake } from "./index.js";
import { faker } from "@faker-js/faker";
import assert from "node:assert";
import {
  StringFilesMessageSchema,
  StringGitMessageSchema,
  StringIdMessageSchema,
  StringMessageSchema,
  StringNetMessageSchema,
  StringOtherMessageSchema,
  StringUserMessageSchema,
} from "./gen/string_pb";

suite("string", () => {
  test("text", () => {
    faker.seed(1234);
    const msg = fake(StringMessageSchema);
    assert.strictEqual(msg.str, "aureus");
    assert.strictEqual(
      msg.text,
      "Toties debitis perspiciatis territo tepidus termes undique. Arcus charisma avarus thorax tot. Articulus utor angelus contabesco abundans desino depono statua comptus summa.",
    );
    assert.strictEqual(
      msg.paragraph,
      "Corpus altus laudantium adsidue desolo decipio abutor acerbitas terebro. Vaco caritas copia taceo possimus. Aestivus votum corporis angulus victoria cruentus soleo defessus crux fugiat.",
    );
    assert.strictEqual(msg.word, "tertius");
    assert.deepStrictEqual(msg.words, [
      "comes",
      "deleniti",
      "minus",
      "dapifer",
      "ustulo",
      "modi",
      "debeo",
      "volubilis",
      "thorax",
      "adhaero",
      "arbitro",
      "infit",
      "succurro",
      "delectatio",
      "succurro",
      "cotidie",
      "blanditiis",
      "complectus",
      "vesper",
      "torqueo",
      "decimus",
      "sint",
      "verbera",
      "adiuvo",
      "adulatio",
      "vulgus",
      "audacia",
      "strenuus",
      "adiuvo",
      "vetus",
      "spero",
      "versus",
      "pariatur",
      "voluptates",
      "expedita",
      "crux",
      "adimpleo",
      "celebrer",
      "laudantium",
      "curtus",
      "comprehendo",
      "tendo",
      "desolo",
      "pauci",
      "amoveo",
      "aggero",
      "pectus",
      "succurro",
      "maxime",
      "ascit",
      "absconditus",
      "adduco",
      "provident",
      "complectus",
      "verecundia",
      "demitto",
      "texo",
      "aegrotatio",
      "vulgivagus",
      "crebro",
      "vitae",
      "angustus",
      "textor",
      "vel",
      "cinis",
      "tendo",
      "quibusdam",
      "coruscus",
      "demulceo",
      "acies",
      "autus",
      "ventus",
      "creber",
      "terror",
      "adnuo",
      "quaerat",
      "defero",
      "beneficium",
      "vomito",
    ]);
    assert.strictEqual(msg.sentence, "Anser solvo animadverto valde taceo.");
    assert.strictEqual(
      msg.description,
      "Ocer comprehendo demens beatus amita absum calco aequitas. Sustineo cur volva facilis strues absconditus vulariter coerceo strues debilito. Perspiciatis nulla versus exercitationem quidem asporto suffoco articulus architecto vigilo.",
    );
  });
  test("user", () => {
    faker.seed(1234);
    const msg = fake(StringUserMessageSchema);
    assert.strictEqual(msg.email, "Jesse_Schumm@gmail.com");
    assert.strictEqual(msg.firstName, "Pablo");
    assert.strictEqual(msg.lastName, "Satterfield");
    assert.strictEqual(msg.userName, "Sabrina.Corwin80");
  });
  test("uuid", () => {
    faker.seed(1234);
    const msg = fake(StringIdMessageSchema);
    assert.strictEqual(msg.id, "379d79cc-cd42-443c-adf2-e15087a5bc51");
    assert.strictEqual(msg.personId, "08700c4e-35b9-4e1f-a51e-6a768cc5796d");
  });
  test("files", () => {
    faker.seed(1234);
    const msg = fake(StringFilesMessageSchema);
    assert.strictEqual(msg.fileName, "sniveling.m2v");
    assert.strictEqual(msg.filePath, "/lost+found/under.distz");
    assert.strictEqual(msg.directoryPath, "/opt");
    assert.strictEqual(msg.mimeType, "application/epub+zip");
  });
  test("git", () => {
    faker.seed(1234);
    const msg = fake(StringGitMessageSchema);
    assert.strictEqual(msg.gitBranch, "microchip-connect");
    assert.strictEqual(msg.gitCommitMessage, "calculate neural system");
  });
  test("net", () => {
    faker.seed(1234);
    const msg = fake(StringNetMessageSchema);
    assert.strictEqual(msg.domainName, "detailed-language.name");
    assert.strictEqual(msg.httpMethod, "PATCH");
    assert.strictEqual(msg.httpStatus, "305");
    assert.strictEqual(msg.ipV4, "201.197.199.220");
    assert.strictEqual(msg.ipV6, "5364:bbf3:d270:baf7:fb82:c1b9:00b6:d58a");
    assert.strictEqual(msg.ip, "157.227.19.252");
    assert.strictEqual(msg.macAddress, "51:e6:a7:68:cc:57");
    assert.strictEqual(msg.portNumber, "37230");
    assert.strictEqual(msg.protocol, "http");
    assert.strictEqual(msg.url, "https://nocturnal-hostess.org");
    assert.strictEqual(
      msg.userAgent,
      "Mozilla/5.0 (compatible; MSIE 7.0; Windows NT 5.2; Trident/6.0)",
    );
    assert.strictEqual(msg.slug, "cotidie-blanditiis-complectus");
  });
  test("other", () => {
    faker.seed(1234);
    const msg = fake(StringOtherMessageSchema);
    assert.strictEqual(msg.color, "mint green");
    assert.strictEqual(msg.vin, "GLTELSSSV8D927866");
    assert.strictEqual(msg.isbn, "978-1-891813-05-4");
  });
});