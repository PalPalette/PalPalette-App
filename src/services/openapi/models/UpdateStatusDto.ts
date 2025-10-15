/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type UpdateStatusDto = {
    /**
     * Whether the device is currently online
     */
    isOnline?: boolean;
    /**
     * Whether the device has been fully provisioned
     */
    isProvisioned?: boolean;
    /**
     * Current IP address of the device
     */
    ipAddress?: string;
    /**
     * Timestamp when device was last seen
     */
    lastSeenAt?: string;
    /**
     * Current firmware version
     */
    firmwareVersion?: string;
    /**
     * MAC address of the device
     */
    macAddress?: string;
    /**
     * WiFi signal strength in dBm
     */
    wifiRSSI?: number;
    systemStats?: {
        freeHeap?: number;
        uptime?: number;
        lastUpdate?: string;
    };
    /**
     * Free heap memory in bytes (ESP32 direct property)
     */
    freeHeap?: number;
    /**
     * Device uptime in seconds (ESP32 direct property)
     */
    uptime?: number;
};

