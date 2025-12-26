import "./src/models/index.js";  // Import associations
import Log from "./src/models/Log.js";
import User from "./src/models/User.js";
import { initDatabase } from "./src/libs/db.js";

async function testLogDate() {
    try {
        await initDatabase();
        
        const logs = await Log.findAll({
            limit: 1,
            order: [['createdAt', 'DESC']],
            include: [{
                model: User,
                as: 'user',
                attributes: ['userId', 'username', 'fullName', 'role']
            }]
        });

        if (logs.length > 0) {
            const log = logs[0];
            console.log('Log object:', log.toJSON());
            console.log('Log createdAt:', log.createdAt);
            console.log('Log dataValues:', log.dataValues);
        } else {
            console.log('No logs found');
        }
        
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

testLogDate();
