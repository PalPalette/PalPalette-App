/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type UpdateLightingSystemDto = {
    /**
     * Type of lighting system (nanoleaf, wled, ws2812, or philips_hue)
     */
    lightingSystemType?: UpdateLightingSystemDto.lightingSystemType;
    /**
     * IP address or hostname of the lighting system (for networked systems like Nanoleaf/WLED)
     */
    lightingHostAddress?: string;
    /**
     * Port number for the lighting system (e.g., 16021 for Nanoleaf)
     */
    lightingPort?: number;
    /**
     * Authentication token obtained from the lighting system (e.g., Nanoleaf auth token after button press)
     */
    lightingAuthToken?: string;
    /**
     * Updated custom configuration
     */
    lightingCustomConfig?: Record<string, any>;
    /**
     * Whether the lighting system is configured
     */
    lightingSystemConfigured?: boolean;
    /**
     * Current status of the lighting system
     */
    lightingStatus?: UpdateLightingSystemDto.lightingStatus;
};
export namespace UpdateLightingSystemDto {
    /**
     * Type of lighting system (nanoleaf, wled, ws2812, or philips_hue)
     */
    export enum lightingSystemType {
        NANOLEAF = 'nanoleaf',
        WLED = 'wled',
        WS2812 = 'ws2812',
        PHILIPS_HUE = 'philips_hue',
    }
    /**
     * Current status of the lighting system
     */
    export enum lightingStatus {
        UNKNOWN = 'unknown',
        WORKING = 'working',
        ERROR = 'error',
        AUTHENTICATION_REQUIRED = 'authentication_required',
    }
}

