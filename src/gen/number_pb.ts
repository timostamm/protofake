// @generated by protoc-gen-es v2.0.0 with parameter "target=ts,import_extension=js"
// @generated from file number.proto (syntax proto3)
/* eslint-disable */

import type { GenFile, GenMessage } from "@bufbuild/protobuf/codegenv1";
import { fileDesc, messageDesc } from "@bufbuild/protobuf/codegenv1";
import { file_google_protobuf_timestamp } from "@bufbuild/protobuf/wkt";
import type { Message } from "@bufbuild/protobuf";

/**
 * Describes the file number.proto.
 */
export const file_number: GenFile = /*@__PURE__*/
  fileDesc("CgxudW1iZXIucHJvdG8iXgoNTnVtYmVyTWVzc2FnZRIQCghsYXRpdHVkZRgBIAEoARIRCglsb25naXR1ZGUYAiABKAESEwoLaHR0cF9zdGF0dXMYAyABKAUSEwoLcG9ydF9udW1iZXIYBCABKAVCD0ILTnVtYmVyUHJvdG9QAWIGcHJvdG8z", [file_google_protobuf_timestamp]);

/**
 * @generated from message NumberMessage
 */
export type NumberMessage = Message<"NumberMessage"> & {
  /**
   * @generated from field: double latitude = 1;
   */
  latitude: number;

  /**
   * @generated from field: double longitude = 2;
   */
  longitude: number;

  /**
   * @generated from field: int32 http_status = 3;
   */
  httpStatus: number;

  /**
   * @generated from field: int32 port_number = 4;
   */
  portNumber: number;
};

/**
 * Describes the message NumberMessage.
 * Use `create(NumberMessageSchema)` to create a new message.
 */
export const NumberMessageSchema: GenMessage<NumberMessage> = /*@__PURE__*/
  messageDesc(file_number, 0);

