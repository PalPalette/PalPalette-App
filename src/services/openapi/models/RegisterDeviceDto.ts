/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type RegisterDeviceDto = {
    /**
     * MAC address of the device in XX:XX:XX:XX:XX:XX format
     */
    macAddress: string;
    /**
     * IP address of the device
     */
    ipAddress?: string;
    /**
     * Type of the device
     */
    deviceType?: string;
    /**
     * Firmware version of the device
     */
    firmwareVersion?: string;
    /**
     * Type of lighting system (optional during registration, can be configured later)
     */
    lightingSystemType?: RegisterDeviceDto.lightingSystemType;
    /**
     * IP address or hostname of the lighting system (optional during registration)
     */
    lightingHostAddress?: string;
    /**
     * Port for lighting system connection (optional during registration)
     */
    lightingPort?: number;
    /**
     * Authentication token for lighting system (optional during registration)
     */
    lightingAuthToken?: string;
    /**
     * Custom configuration object for specific lighting systems (optional during registration)
     */
    lightingCustomConfig?: Record<string, any>;
};
export namespace RegisterDeviceDto {
    /**
     * Type of lighting system (optional during registration, can be configured later)
     */
    export enum lightingSystemType {
        NANOLEAF = 'nanoleaf',
        WLED = 'wled',
        WS2812 = 'ws2812',
        PHILIPS_HUE = 'philips_hue',
    }
}

