import { sequelize } from './src/libs/db.js';
import Log from './src/models/Log.js';
import User from './src/models/User.js';

// Define the association (in case it's not properly loaded)
Log.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user'
});

async function testLogQuery() {
    try {
        console.log('Testing log query with user association...\n');

        const { count, rows } = await Log.findAndCountAll({
            limit: 5,
            offset: 0,
            order: [['created_at', 'DESC']],
            include: [{
                model: User,
                as: 'user',
                attributes: ['userId', 'username', 'fullName', 'role']
            }]
        });

        console.log('✅ Query successful!');
        console.log('Total logs:', count);
        console.log('Logs returned:', rows.length);
        
        if (rows.length > 0) {
            console.log('\nSample log:');
            const log = rows[0].toJSON();
            console.log(JSON.stringify({
                logId: log.logId,
                action: log.action,
                entityType: log.entityType,
                userId: log.userId,
                user: log.user,
                createdAt: log.createdAt
            }, null, 2));
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('Error details:', error);
        process.exit(1);
    }
}

testLogQuery();
