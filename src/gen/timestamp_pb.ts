// @generated by protoc-gen-es v2.0.0 with parameter "target=ts"
// @generated from file timestamp.proto (syntax proto3)
/* eslint-disable */

import type { GenFile, GenMessage } from "@bufbuild/protobuf/codegenv1";
import { fileDesc, messageDesc } from "@bufbuild/protobuf/codegenv1";
import type { Timestamp } from "@bufbuild/protobuf/wkt";
import { file_google_protobuf_timestamp } from "@bufbuild/protobuf/wkt";
import type { Message } from "@bufbuild/protobuf";

/**
 * Describes the file timestamp.proto.
 */
export const file_timestamp: GenFile = /*@__PURE__*/
  fileDesc("Cg90aW1lc3RhbXAucHJvdG8inwEKEFRpbWVzdGFtcE1lc3NhZ2USLgoKY3JlYXRlZF9hdBgBIAEoCzIaLmdvb2dsZS5wcm90b2J1Zi5UaW1lc3RhbXASLgoKZXhwaXJlc19hdBgCIAEoCzIaLmdvb2dsZS5wcm90b2J1Zi5UaW1lc3RhbXASKwoHYm9ybl9hdBgDIAEoCzIaLmdvb2dsZS5wcm90b2J1Zi5UaW1lc3RhbXBCEkIOVGltZXN0YW1wUHJvdG9QAWIGcHJvdG8z", [file_google_protobuf_timestamp]);

/**
 * @generated from message TimestampMessage
 */
export type TimestampMessage = Message<"TimestampMessage"> & {
  /**
   * @generated from field: google.protobuf.Timestamp created_at = 1;
   */
  createdAt?: Timestamp;

  /**
   * @generated from field: google.protobuf.Timestamp expires_at = 2;
   */
  expiresAt?: Timestamp;

  /**
   * @generated from field: google.protobuf.Timestamp born_at = 3;
   */
  bornAt?: Timestamp;
};

/**
 * Describes the message TimestampMessage.
 * Use `create(TimestampMessageSchema)` to create a new message.
 */
export const TimestampMessageSchema: GenMessage<TimestampMessage> = /*@__PURE__*/
  messageDesc(file_timestamp, 0);

