/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type RegisteredDeviceDto = {
    /**
     * Device unique identifier (UUID)
     */
    id: string;
    /**
     * Device MAC address
     */
    macAddress: string;
    /**
     * Six-character pairing code (null for claimed devices)
     */
    pairingCode: string | null;
    /**
     * Device claim status
     */
    status: RegisteredDeviceDto.status;
    /**
     * Whether device has been provisioned
     */
    isProvisioned: boolean;
    /**
     * Owner email (only for claimed devices)
     */
    ownerEmail?: string;
    /**
     * Owner display name (only for claimed devices)
     */
    ownerName?: string;
    /**
     * Device type
     */
    deviceType: string;
    /**
     * Firmware version
     */
    firmwareVersion?: string;
    /**
     * Device IP address
     */
    ipAddress?: string;
    /**
     * Device name
     */
    name?: string;
    /**
     * Configured lighting system type
     */
    lightingSystem?: RegisteredDeviceDto.lightingSystem | null;
    /**
     * Lighting system host address (IP or hostname)
     */
    lightingHost?: string | null;
    /**
     * Lighting system port
     */
    lightingPort?: number | null;
    /**
     * Lighting system authentication token
     */
    lightingAuthToken?: string | null;
};
export namespace RegisteredDeviceDto {
    /**
     * Device claim status
     */
    export enum status {
        CLAIMED = 'claimed',
        UNCLAIMED = 'unclaimed',
    }
    /**
     * Configured lighting system type
     */
    export enum lightingSystem {
        NANOLEAF = 'nanoleaf',
        WLED = 'wled',
        WS2812 = 'ws2812',
        PHILIPS_HUE = 'philips_hue',
    }
}

