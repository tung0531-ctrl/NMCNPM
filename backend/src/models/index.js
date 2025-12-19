import Bill from './Bill.js';
import Household from './Household.js';
import User from './User.js';

// Define associations
Bill.belongsTo(Household, {
    foreignKey: 'householdId',
    as: 'household'
});

Bill.belongsTo(User, {
    foreignKey: 'collectorId',
    as: 'collector'
});

Household.hasMany(Bill, {
    foreignKey: 'householdId',
    as: 'bills'
});

User.hasMany(Bill, {
    foreignKey: 'collectorId',
    as: 'collectedBills'
});

export { Bill, Household, User };