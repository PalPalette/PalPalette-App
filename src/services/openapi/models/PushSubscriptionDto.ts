/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type PushSubscriptionDto = {
    /**
     * Subscription ID
     */
    id: string;
    /**
     * Platform type
     */
    platform: PushSubscriptionDto.platform;
    /**
     * Optional device identifier
     */
    deviceId?: string;
    /**
     * When the subscription was created
     */
    createdAt: string;
    /**
     * Last time the subscription was active
     */
    lastSeenAt?: string;
};
export namespace PushSubscriptionDto {
    /**
     * Platform type
     */
    export enum platform {
        IOS = 'ios',
        ANDROID = 'android',
        WEB = 'web',
    }
}

