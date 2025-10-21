/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type MessageResponseDto = {
    /**
     * Unique identifier for the message
     */
    id: string;
    /**
     * Message sender information
     */
    sender: {
        id?: string;
        email?: string;
        displayName?: string;
    };
    /**
     * Message recipient information
     */
    recipient: {
        id?: string;
        email?: string;
        displayName?: string;
    };
    /**
     * Device information (if associated)
     */
    device?: {
        id?: string;
        name?: string;
        type?: string;
    } | null;
    /**
     * Array of color codes in the message
     */
    colors: Array<string>;
    /**
     * Optional image URL associated with the message
     */
    imageUrl?: string | null;
    /**
     * Timestamp when the message was sent
     */
    sentAt: string;
    /**
     * Timestamp when the message was delivered to the device
     */
    deliveredAt?: string | null;
};

