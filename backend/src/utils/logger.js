import Log from "../models/Log.js";

/**
 * Create activity log entry
 * @param {number} userId - ID of user performing action
 * @param {string} action - Action type (e.g., 'CREATE_USER', 'LOGIN', 'UPDATE_BILL')
 * @param {string} entityType - Type of entity (e.g., 'USER', 'BILL', 'HOUSEHOLD')
 * @param {number|null} entityId - ID of the entity being acted upon
 * @param {object} details - Additional details about the action
 * @param {object} req - Express request object for IP and user agent
 */
export const createLog = async (userId, action, entityType, entityId, details, req) => {
    try {
        await Log.create({
            userId,
            action,
            entityType,
            entityId,
            details: details ? JSON.stringify(details) : null,
            ipAddress: req?.ip || req?.connection?.remoteAddress || null,
            userAgent: req?.get ? req.get('user-agent') : null
        });
    } catch (error) {
        // Don't throw - logging should not break the main operation
        console.error("Lỗi tạo log:", error);
    }
};

/**
 * Log action types constants for consistency
 */
export const LogActions = {
    // Auth actions
    LOGIN: 'LOGIN',
    LOGOUT: 'LOGOUT',
    SIGNUP: 'SIGNUP',
    
    // User actions
    CREATE_USER: 'CREATE_USER',
    UPDATE_USER: 'UPDATE_USER',
    DELETE_USER: 'DELETE_USER',
    VIEW_USER: 'VIEW_USER',
    VIEW_ALL_USERS: 'VIEW_ALL_USERS',
    LOCK_USER: 'LOCK_USER',
    UNLOCK_USER: 'UNLOCK_USER',
    
    // Bill actions
    CREATE_BILL: 'CREATE_BILL',
    UPDATE_BILL: 'UPDATE_BILL',
    DELETE_BILL: 'DELETE_BILL',
    VIEW_BILL: 'VIEW_BILL',
    VIEW_ALL_BILLS: 'VIEW_ALL_BILLS',
    
    // Fee Type actions
    CREATE_FEE_TYPE: 'CREATE_FEE_TYPE',
    UPDATE_FEE_TYPE: 'UPDATE_FEE_TYPE',
    DELETE_FEE_TYPE: 'DELETE_FEE_TYPE',
    VIEW_FEE_TYPE: 'VIEW_FEE_TYPE',
    VIEW_ALL_FEE_TYPES: 'VIEW_ALL_FEE_TYPES',
    
    // Household actions
    CREATE_HOUSEHOLD: 'CREATE_HOUSEHOLD',
    UPDATE_HOUSEHOLD: 'UPDATE_HOUSEHOLD',
    DELETE_HOUSEHOLD: 'DELETE_HOUSEHOLD',
    VIEW_HOUSEHOLD: 'VIEW_HOUSEHOLD',
    VIEW_ALL_HOUSEHOLDS: 'VIEW_ALL_HOUSEHOLDS',
    
    // Resident actions
    CREATE_RESIDENT: 'CREATE_RESIDENT',
    UPDATE_RESIDENT: 'UPDATE_RESIDENT',
    DELETE_RESIDENT: 'DELETE_RESIDENT',
    VIEW_RESIDENT: 'VIEW_RESIDENT',
    VIEW_ALL_RESIDENTS: 'VIEW_ALL_RESIDENTS',
};

/**
 * Entity types constants
 */
export const EntityTypes = {
    USER: 'USER',
    BILL: 'BILL',
    FEE_TYPE: 'FEE_TYPE',
    HOUSEHOLD: 'HOUSEHOLD',
    RESIDENT: 'RESIDENT',
    SESSION: 'SESSION',
};
