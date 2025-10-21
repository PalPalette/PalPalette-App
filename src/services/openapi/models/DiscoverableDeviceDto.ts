/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type DiscoverableDeviceDto = {
    /**
     * Device identifier
     */
    id: string;
    /**
     * Device name
     */
    name: string;
    /**
     * Type of device
     */
    deviceType: string;
    /**
     * Firmware version
     */
    firmwareVersion?: string;
    /**
     * IP address of the device
     */
    ipAddress?: string;
    /**
     * Last 4 characters of MAC address
     */
    macAddress: string;
    /**
     * Last seen timestamp
     */
    lastSeen: string;
    /**
     * When the pairing code expires
     */
    pairingCodeExpires?: string | null;
    /**
     * Whether the device is currently active
     */
    isActive: boolean;
};

