import { sequelize } from './src/libs/db.js';

async function testDatabase() {
    try {
        await sequelize.authenticate();
        console.log('✓ Database connected');
        
        // Test query
        const [results] = await sequelize.query('SELECT COUNT(*) as count FROM bills');
        console.log('✓ Bills count:', results[0].count);
        
        const [households] = await sequelize.query('SELECT COUNT(*) as count FROM households');
        console.log('✓ Households count:', households[0].count);
        
        const [users] = await sequelize.query('SELECT COUNT(*) as count FROM users WHERE role = "ADMIN"');
        console.log('✓ Admin users count:', users[0].count);
        
        // Test select
        const [bills] = await sequelize.query('SELECT * FROM bills LIMIT 5');
        console.log('✓ Sample bills:', bills);
        
    } catch (error) {
        console.error('✗ Database error:', error.message);
    } finally {
        await sequelize.close();
    }
}

testDatabase();