import Log from "../models/Log.js";

// Cache to prevent duplicate logs within a short time window
const recentLogs = new Map();
const DUPLICATE_WINDOW_MS = 1000; // 1 second

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
        // Create a unique key for this log entry
        const logKey = `${userId}-${action}-${entityType}-${entityId || 'null'}-${Date.now()}`;
        const simpleKey = `${userId}-${action}-${entityType}-${entityId || 'null'}`;
        
        // Check if we recently created a similar log
        const lastLogTime = recentLogs.get(simpleKey);
        const now = Date.now();
        
        if (lastLogTime && (now - lastLogTime) < DUPLICATE_WINDOW_MS) {
            // Skip duplicate log within the time window
            console.log(`⚠️ Skipping duplicate log: ${simpleKey}`);
            return;
        }
        
        // Update the timestamp for this log type
        recentLogs.set(simpleKey, now);
        
        // Clean up old entries from cache (older than 5 seconds)
        for (const [key, timestamp] of recentLogs.entries()) {
            if (now - timestamp > 5000) {
                recentLogs.delete(key);
            }
        }
        
        // Extract IP address, checking for proxy headers
        // Note: In production behind a proxy/load balancer, make sure to:
        // 1. Set app.set('trust proxy', true) in server.js (already done)
        // 2. Configure proxy to set X-Forwarded-For or X-Real-IP headers
        let ipAddress = null;
        if (req) {
            // Priority 1: Check for IP in proxy headers (for production with reverse proxy)
            const forwardedFor = req.headers['x-forwarded-for'];
            const realIp = req.headers['x-real-ip'];
            
            if (forwardedFor) {
                // X-Forwarded-For can contain multiple IPs: "client, proxy1, proxy2"
                // Take the first one (the original client IP)
                ipAddress = forwardedFor.split(',')[0].trim();
            } else if (realIp) {
                ipAddress = realIp;
            } else {
                // Fallback to connection IP
                ipAddress = req.ip ||
                           req.connection?.remoteAddress ||
                           req.socket?.remoteAddress ||
                           null;
            }
            
            // Clean up IP format
            if (ipAddress) {
                // Convert IPv6 localhost to IPv4
                if (ipAddress === '::1') {
                    ipAddress = '127.0.0.1 (localhost)';
                }
                // Remove IPv6 prefix if present (::ffff:192.168.1.1 -> 192.168.1.1)
                else if (ipAddress.startsWith('::ffff:')) {
                    ipAddress = ipAddress.substring(7);
                }
                // Mark localhost
                else if (ipAddress === '127.0.0.1') {
                    ipAddress = '127.0.0.1 (localhost)';
                }
            }
        }

        // Extract user agent
        const userAgent = req?.headers?.['user-agent'] || req?.get?.('user-agent') || null;

        // Add IP and browser info to details for better visibility
        const enrichedDetails = {
            ...details,
            _metadata: {
                ip_address: ipAddress,
                user_agent: userAgent,
                timestamp: new Date().toISOString()
            }
        };

        await Log.create({
            userId,
            action,
            entityType,
            entityId,
            details: JSON.stringify(enrichedDetails),
            ipAddress,
            userAgent
        });
        
        console.log(`✅ Log created: ${action} by user ${userId} from IP ${ipAddress}`);
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
    // Statistics
    VIEW_STATISTICS: 'VIEW_STATISTICS',
    
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
    
    // Notification actions
    CREATE_NOTIFICATION: 'CREATE_NOTIFICATION',
    MARK_NOTIFICATION_READ: 'MARK_NOTIFICATION_READ',
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
    NOTIFICATION: 'NOTIFICATION',
    SESSION: 'SESSION',
    STATISTICS: 'STATISTICS',
};
