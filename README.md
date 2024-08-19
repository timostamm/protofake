# protofake

Library to generate fake data for Protobuf messages. Uses [faker-js](https://fakerjs.dev/) to generate values based on
Protobuf field types and field names.

### Usage

```typescript
import { fake } from "protofake";
import { UserSchema } from "./gen/example_pb";

const user = fake(UserSchema);
user.firstName; // "Claude"
user.lastName; // "Mueller"
user.active; // true
```

The function `fake` takes a message descriptor as an input, and returns a new instance with all fields populated with
fake data.

### Status

Work in progress. Things to do:

- Publish on npmjs.com
- Honor protovalidate options
- Provide option to only partially populate optional fields
- Special case google/type/localized_text.proto
- Special case google/type/money.proto
