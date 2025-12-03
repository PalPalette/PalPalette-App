/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ClaimByCodeDto } from '../models/ClaimByCodeDto';
import type { Device } from '../models/Device';
import type { DevicePairingInfoDto } from '../models/DevicePairingInfoDto';
import type { DiscoverUnpairedDevicesResponseDto } from '../models/DiscoverUnpairedDevicesResponseDto';
import type { LightingSystemConfigDto } from '../models/LightingSystemConfigDto';
import type { NotificationResponseDto } from '../models/NotificationResponseDto';
import type { PairingCodeResponseDto } from '../models/PairingCodeResponseDto';
import type { RegisterDeviceDto } from '../models/RegisterDeviceDto';
import type { RegisterDeviceResponseDto } from '../models/RegisterDeviceResponseDto';
import type { ResetDeviceResponseDto } from '../models/ResetDeviceResponseDto';
import type { SupportedLightingSystemsResponseDto } from '../models/SupportedLightingSystemsResponseDto';
import type { UpdateDeviceDto } from '../models/UpdateDeviceDto';
import type { UpdateLightingSystemDto } from '../models/UpdateLightingSystemDto';
import type { UpdateStatusDto } from '../models/UpdateStatusDto';
import type { UserNotificationDto } from '../models/UserNotificationDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class DevicesService {
    /**
     * Register or reconnect a device
     * Devices call this on boot to register or get their current state. Returns claim status, owner info (if claimed), and lighting configuration.
     * @param requestBody
     * @returns RegisterDeviceResponseDto Device registered/reconnected successfully. Returns different data based on claim status.
     * @throws ApiError
     */
    public static devicesControllerRegisterDevice(
        requestBody: RegisterDeviceDto,
    ): CancelablePromise<RegisterDeviceResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/devices/register',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad request - validation error`,
            },
        });
    }
    /**
     * Get pairing code for device
     * @param deviceId Device ID
     * @returns PairingCodeResponseDto Pairing code retrieved successfully
     * @throws ApiError
     */
    public static devicesControllerGetPairingCode(
        deviceId: string,
    ): CancelablePromise<PairingCodeResponseDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/devices/pairing-code/{deviceId}',
            path: {
                'deviceId': deviceId,
            },
            errors: {
                404: `Device not found`,
            },
        });
    }
    /**
     * Claim a device using pairing code
     * @param requestBody
     * @returns any Device claimed successfully
     * @throws ApiError
     */
    public static devicesControllerClaimByCode(
        requestBody: ClaimByCodeDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/devices/claim-by-code',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad request - invalid pairing code`,
                401: `Unauthorized`,
                404: `Device or pairing code not found`,
            },
        });
    }
    /**
     * Reset device to unclaimed state
     * @param id Device ID
     * @returns ResetDeviceResponseDto Device reset successfully
     * @throws ApiError
     */
    public static devicesControllerResetDevice(
        id: string,
    ): CancelablePromise<ResetDeviceResponseDto> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/devices/{id}/reset',
            path: {
                'id': id,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden - not device owner`,
                404: `Device not found`,
            },
        });
    }
    /**
     * Update lighting system configuration (device self-reporting)
     * Devices call this endpoint after successfully connecting to their lighting system (e.g., Nanoleaf, WLED) to store/update the configuration in the backend. This ensures the configuration persists even if the device loses power.
     * @param id Device ID (UUID)
     * @param requestBody
     * @returns any Lighting configuration updated successfully. Returns updated device.
     * @throws ApiError
     */
    public static devicesControllerUpdateDeviceLighting(
        id: string,
        requestBody: UpdateLightingSystemDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/devices/{id}/lighting',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad request - validation error`,
                404: `Device not found`,
            },
        });
    }
    /**
     * Update lighting system configuration
     * @param id Device ID
     * @param requestBody
     * @returns any Lighting system updated successfully
     * @throws ApiError
     */
    public static devicesControllerUpdateLightingSystem(
        id: string,
        requestBody: UpdateLightingSystemDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/devices/{id}/lighting',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad request - validation error`,
                404: `Device not found`,
            },
        });
    }
    /**
     * Reset/clear lighting system configuration
     * @param id Device ID
     * @returns any Lighting system configuration cleared successfully
     * @throws ApiError
     */
    public static devicesControllerResetLightingSystem(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/devices/{id}/lighting',
            path: {
                'id': id,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden - not device owner`,
                404: `Device not found`,
            },
        });
    }
    /**
     * Update device status (for device self-reporting)
     * @param id Device ID
     * @param requestBody
     * @returns any Device status updated successfully
     * @throws ApiError
     */
    public static devicesControllerUpdateStatus(
        id: string,
        requestBody: UpdateStatusDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/devices/{id}/status',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad request - validation error`,
                404: `Device not found`,
            },
        });
    }
    /**
     * Find device by MAC address
     * @param macAddress MAC address of the device
     * @returns any Device found
     * @throws ApiError
     */
    public static devicesControllerFindDeviceByMacAddress(
        macAddress: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/devices/by-mac/{macAddress}',
            path: {
                'macAddress': macAddress,
            },
            errors: {
                404: `Device not found`,
            },
        });
    }
    /**
     * Discover unpaired devices available for pairing
     * @returns DiscoverUnpairedDevicesResponseDto List of discoverable unpaired devices
     * @throws ApiError
     */
    public static devicesControllerDiscoverUnpairedDevices(): CancelablePromise<DiscoverUnpairedDevicesResponseDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/devices/discover/unpaired',
        });
    }
    /**
     * @returns any
     * @throws ApiError
     */
    public static devicesControllerDebugAllDevices(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/devices/debug/all-devices',
        });
    }
    /**
     * Get pairing information for a specific device
     * @param deviceId Device ID
     * @returns DevicePairingInfoDto Device pairing information retrieved successfully
     * @throws ApiError
     */
    public static devicesControllerGetDevicePairingInfo(
        deviceId: string,
    ): CancelablePromise<DevicePairingInfoDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/devices/{deviceId}/pairing-info',
            path: {
                'deviceId': deviceId,
            },
            errors: {
                400: `Device is already claimed`,
                404: `Device not found`,
            },
        });
    }
    /**
     * Configure lighting system for device
     * @param id Device ID
     * @param requestBody
     * @returns any Lighting system configured successfully
     * @returns Device
     * @throws ApiError
     */
    public static devicesControllerConfigureLightingSystem(
        id: string,
        requestBody: LightingSystemConfigDto,
    ): CancelablePromise<any | Device> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/devices/{id}/lighting/configure',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad request - validation error`,
                401: `Unauthorized`,
                403: `Forbidden - not device owner`,
                404: `Device not found`,
            },
        });
    }
    /**
     * Test lighting system connection
     * @param id Device ID
     * @returns any Test completed successfully
     * @throws ApiError
     */
    public static devicesControllerTestLightingSystem(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/devices/{id}/lighting/test',
            path: {
                'id': id,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden - not device owner`,
                404: `Device not found`,
                500: `Lighting system connection failed`,
            },
        });
    }
    /**
     * Get lighting system status for a device
     * @param id Device ID
     * @returns any Lighting system status retrieved successfully
     * @throws ApiError
     */
    public static devicesControllerGetLightingSystemStatus(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/devices/{id}/lighting/status',
            path: {
                'id': id,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden - not device owner`,
                404: `Device not found`,
            },
        });
    }
    /**
     * @param requestBody
     * @returns NotificationResponseDto
     * @throws ApiError
     */
    public static devicesControllerSendUserNotification(
        requestBody: UserNotificationDto,
    ): CancelablePromise<NotificationResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/devices/notifications/user-action',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Get lighting system configurations for all user's devices
     * @returns any Lighting system configurations retrieved successfully for all user devices
     * @throws ApiError
     */
    public static devicesControllerGetMyDevicesLightingSystems(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/devices/my-devices/lighting-systems',
            errors: {
                401: `Unauthorized`,
            },
        });
    }
    /**
     * Get list of supported lighting systems and their capabilities
     * @returns SupportedLightingSystemsResponseDto Supported lighting systems and capabilities retrieved
     * @throws ApiError
     */
    public static devicesControllerGetSupportedLightingSystems(): CancelablePromise<SupportedLightingSystemsResponseDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/devices/lighting/supported-systems',
        });
    }
    /**
     * Get default configuration for a specific lighting system type
     * @param systemType Type of lighting system
     * @returns any Default configuration retrieved successfully
     * @throws ApiError
     */
    public static devicesControllerGetDefaultLightingConfig(
        systemType: 'nanoleaf' | 'wled' | 'ws2812' | 'philips_hue',
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/devices/lighting/{systemType}/default-config',
            path: {
                'systemType': systemType,
            },
        });
    }
    /**
     * Get devices owned by current user
     * @returns any User devices retrieved successfully
     * @throws ApiError
     */
    public static devicesControllerGetMyDevices(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/devices/my-devices',
            errors: {
                401: `Unauthorized`,
            },
        });
    }
    /**
     * Get all devices (admin)
     * @returns any All devices retrieved successfully
     * @throws ApiError
     */
    public static devicesControllerFindAll(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/devices',
        });
    }
    /**
     * Get device by ID
     * @param id Device ID
     * @returns any Device retrieved successfully
     * @throws ApiError
     */
    public static devicesControllerFindOne(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/devices/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `Device not found`,
            },
        });
    }
    /**
     * @param id
     * @param requestBody
     * @returns Device
     * @throws ApiError
     */
    public static devicesControllerUpdate(
        id: string,
        requestBody: UpdateDeviceDto,
    ): CancelablePromise<Device> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/devices/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id
     * @returns any
     * @throws ApiError
     */
    public static devicesControllerRemove(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/devices/{id}',
            path: {
                'id': id,
            },
        });
    }
}
