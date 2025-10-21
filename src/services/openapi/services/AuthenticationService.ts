/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AuthResponseDto } from '../models/AuthResponseDto';
import type { LoginRequestDto } from '../models/LoginRequestDto';
import type { RefreshTokenDto } from '../models/RefreshTokenDto';
import type { RegisterUserDto } from '../models/RegisterUserDto';
import type { ValidateTokenDto } from '../models/ValidateTokenDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AuthenticationService {
    /**
     * Register a new user
     * @param userAgent
     * @param requestBody
     * @returns AuthResponseDto User successfully registered and logged in
     * @throws ApiError
     */
    public static authControllerRegister(
        userAgent: string,
        requestBody: RegisterUserDto,
    ): CancelablePromise<AuthResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/auth/register',
            headers: {
                'user-agent': userAgent,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad request - validation error`,
                409: `User already exists`,
                429: `Too many requests`,
            },
        });
    }
    /**
     * Login user and get access tokens
     * @param userAgent
     * @param requestBody
     * @returns AuthResponseDto Login successful
     * @throws ApiError
     */
    public static authControllerLogin(
        userAgent: string,
        requestBody: LoginRequestDto,
    ): CancelablePromise<AuthResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/auth/login',
            headers: {
                'user-agent': userAgent,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Invalid credentials`,
                429: `Too many requests`,
            },
        });
    }
    /**
     * Refresh access tokens using refresh token
     * @param userAgent
     * @param requestBody
     * @returns AuthResponseDto Tokens refreshed successfully
     * @throws ApiError
     */
    public static authControllerRefresh(
        userAgent: string,
        requestBody: RefreshTokenDto,
    ): CancelablePromise<AuthResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/auth/refresh',
            headers: {
                'user-agent': userAgent,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Invalid refresh token`,
                429: `Too many requests`,
            },
        });
    }
    /**
     * Logout user and invalidate tokens
     * @returns any Logout successful
     * @throws ApiError
     */
    public static authControllerLogout(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/auth/logout',
            errors: {
                401: `Unauthorized`,
            },
        });
    }
    /**
     * Validate an access token
     * @param requestBody
     * @returns any Token validation result
     * @throws ApiError
     */
    public static authControllerValidate(
        requestBody: ValidateTokenDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/auth/validate',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                429: `Too many requests`,
            },
        });
    }
    /**
     * Revoke access for a specific device
     * @returns any Device access revoked
     * @throws ApiError
     */
    public static authControllerRevokeDevice(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/auth/revoke-device',
            errors: {
                401: `Unauthorized`,
            },
        });
    }
    /**
     * Get active sessions for the current user
     * @returns any Active sessions retrieved
     * @throws ApiError
     */
    public static authControllerGetActiveSessions(): CancelablePromise<{
        sessions?: Array<{
            id?: string;
            deviceName?: string;
            ipAddress?: string;
            userAgent?: string;
            createdAt?: string;
            lastUsedAt?: string;
        }>;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/auth/sessions',
            errors: {
                401: `Unauthorized`,
            },
        });
    }
}
