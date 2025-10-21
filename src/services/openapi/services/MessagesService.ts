/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateMessageDto } from '../models/CreateMessageDto';
import type { MessageResponseDto } from '../models/MessageResponseDto';
import type { ReplayMessageResponseDto } from '../models/ReplayMessageResponseDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class MessagesService {
    /**
     * Create a new message
     * @param requestBody
     * @returns MessageResponseDto Message created successfully
     * @throws ApiError
     */
    public static messagesControllerCreate(
        requestBody: CreateMessageDto,
    ): CancelablePromise<MessageResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/messages',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad request - validation error`,
            },
        });
    }
    /**
     * Get all messages (admin)
     * @returns MessageResponseDto All messages retrieved successfully
     * @throws ApiError
     */
    public static messagesControllerFindAll(): CancelablePromise<Array<MessageResponseDto>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/messages',
        });
    }
    /**
     * Get message by ID
     * @param id Message ID
     * @returns MessageResponseDto Message retrieved successfully
     * @throws ApiError
     */
    public static messagesControllerFindById(
        id: string,
    ): CancelablePromise<MessageResponseDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/messages/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `Message not found`,
            },
        });
    }
    /**
     * Get messages for a specific recipient
     * @param recipientId Recipient user ID
     * @returns MessageResponseDto Messages retrieved successfully
     * @throws ApiError
     */
    public static messagesControllerFindByRecipient(
        recipientId: string,
    ): CancelablePromise<Array<MessageResponseDto>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/messages/recipient/{recipientId}',
            path: {
                'recipientId': recipientId,
            },
            errors: {
                404: `Recipient not found`,
            },
        });
    }
    /**
     * Replay a message on the user's lighting system
     * Sends a previously received message to the user's lighting system for display. This is a deliberate action by the user to review a message, so it bypasses the user's configured messaging timeframe.
     * @param id Message ID to replay
     * @returns ReplayMessageResponseDto Message replayed successfully
     * @returns any
     * @throws ApiError
     */
    public static messagesControllerReplayMessage(
        id: string,
    ): CancelablePromise<ReplayMessageResponseDto | any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/messages/{id}/replay',
            path: {
                'id': id,
            },
            errors: {
                403: `Unauthorized - You can only replay messages sent to you`,
                404: `Message not found`,
            },
        });
    }
}
