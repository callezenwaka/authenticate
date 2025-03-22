/**
 * Redis Key Manager - Centralizes key creation to prevent collisions
 * This module ensures consistent key naming patterns across services
 */

/**
 * Creates a namespaced Redis key for a specific service and entity
 * @param service - The service name (e.g., 'backend', 'provider')
 * @param entity - The entity type (e.g., 'blog', 'user')
 * @param id - Optional identifier for specific entity instance
 * @param subtype - Optional subtype or category
 * @returns Properly formatted Redis key
 */
export const createRedisKey = (
    service: string,
    entity: string,
    id?: string | number,
    subtype?: string
): string => {
    let key = `${service}:${entity}`;

    if (subtype) {
        key += `:${subtype}`;
    }

    if (id !== undefined) {
        key += `:${id}`;
    }

    return key;
};

/**
 * Pre-defined key generators for common entities
 */
export const blogKeys = {
    /**
     * Get key for a collection of blogs
     * @param service - The service name
     * @param filter - Optional filter name (e.g., 'recent', 'popular')
     */
    collection: (service: string, filter?: string): string =>
        createRedisKey(service, 'blog', undefined, filter || 'all'),

    /**
     * Get key for a specific blog
     * @param service - The service name
     * @param id - The blog ID
     */
    single: (service: string, id: string): string =>
        createRedisKey(service, 'blog', id),
};

/**
 * Pre-defined key generators for users
 */
export const userKeys = {
    collection: (service: string, filter?: string): string =>
        createRedisKey(service, 'user', undefined, filter || 'all'),

    single: (service: string, id: string): string =>
        createRedisKey(service, 'user', id),

    /**
     * Get key for user authentication data
     * @param service - The service name
     * @param userId - The user ID
     */
    auth: (service: string, userId: string): string =>
        createRedisKey(service, 'user', userId, 'auth'),
};

// Export default object with all key generators
export default {
    create: createRedisKey,
    blog: blogKeys,
    user: userKeys,
    // Add more entity key generators as needed
};