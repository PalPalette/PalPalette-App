/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type DevicePairingInfoDto = {
    /**
     * Device identifier
     */
    deviceId: string;
    /**
     * Six-character pairing code
     */
    pairingCode: string;
    /**
     * Device name
     */
    deviceName: string;
    /**
     * Firmware version
     */
    firmwareVersion?: string;
    /**
     * When the pairing code expires
     */
    pairingExpires?: string;
};

