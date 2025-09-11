/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type AuthResponseDto = {
    /**
     * JWT access token
     */
    access_token: string;
    /**
     * Refresh token for obtaining new access tokens
     */
    refresh_token: string;
    /**
     * Token type
     */
    token_type: string;
    /**
     * Access token expiration time in seconds
     */
    expires_in: number;
    /**
     * User information
     */
    user: {
        id?: string;
        email?: string;
        displayName?: string;
    };
};

