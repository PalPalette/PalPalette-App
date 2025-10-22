/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type RegisterPushTokenDto = {
    /**
     * FCM token for push notifications
     */
    token: string;
    /**
     * Platform type
     */
    platform: RegisterPushTokenDto.platform;
    /**
     * Optional device identifier
     */
    deviceId?: string;
};
export namespace RegisterPushTokenDto {
    /**
     * Platform type
     */
    export enum platform {
        IOS = 'ios',
        ANDROID = 'android',
        WEB = 'web',
    }
}

