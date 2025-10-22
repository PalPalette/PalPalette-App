/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { GetSubscriptionsResponseDto } from '../models/GetSubscriptionsResponseDto';
import type { RegisterPushTokenDto } from '../models/RegisterPushTokenDto';
import type { RegisterPushTokenResponseDto } from '../models/RegisterPushTokenResponseDto';
import type { UnregisterPushTokenDto } from '../models/UnregisterPushTokenDto';
import type { UnregisterPushTokenResponseDto } from '../models/UnregisterPushTokenResponseDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class PushNotificationsService {
    /**
     * Register a push notification token
     * Register a FCM token for the authenticated user to receive push notifications. If the token already exists, it will be updated with the new platform and device information. Users can register multiple tokens for different devices.
     * @param requestBody
     * @returns RegisterPushTokenResponseDto Token registered successfully
     * @throws ApiError
     */
    public static pushControllerRegisterToken(
        requestBody: RegisterPushTokenDto,
    ): CancelablePromise<RegisterPushTokenResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/push/register',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid token or platform - validation failed`,
                401: `Unauthorized - invalid or missing JWT token`,
            },
        });
    }
    /**
     * Unregister a push notification token
     * Remove a FCM token from receiving push notifications. This should be called when a user logs out or when the app is uninstalled. The token will be permanently removed from the database.
     * @param requestBody
     * @returns UnregisterPushTokenResponseDto Token unregistered successfully
     * @throws ApiError
     */
    public static pushControllerUnregisterToken(
        requestBody: UnregisterPushTokenDto,
    ): CancelablePromise<UnregisterPushTokenResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/push/unregister',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized - invalid or missing JWT token`,
            },
        });
    }
    /**
     * Get user's active push subscriptions
     * Retrieve all active push notification subscriptions for the authenticated user. This endpoint returns a list of all registered devices and their platforms. Useful for displaying registered devices in user settings or managing notifications.
     * @returns GetSubscriptionsResponseDto Subscriptions retrieved successfully
     * @throws ApiError
     */
    public static pushControllerGetSubscriptions(): CancelablePromise<GetSubscriptionsResponseDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/push/subscriptions',
            errors: {
                401: `Unauthorized - invalid or missing JWT token`,
            },
        });
    }
}
