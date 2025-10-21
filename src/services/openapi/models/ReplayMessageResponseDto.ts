/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type ReplayMessageResponseDto = {
    /**
     * Whether the message replay was successful
     */
    success: boolean;
    /**
     * Human-readable message describing the result
     */
    message: string;
    /**
     * Array of device IDs that received the replayed message
     */
    deliveredToDevices?: Array<string>;
};

