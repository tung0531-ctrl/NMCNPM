import Bill from './Bill.js';
import Household from './Household.js';
import User from './User.js';
import Resident from './Resident.js';

// Define associations
Bill.belongsTo(Household, {
    foreignKey: 'householdId',
    as: 'household_bill'
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

Resident.belongsTo(Household, {
    foreignKey: 'householdId',
    as: 'household_resident'
});

Household.hasMany(Resident, {
    foreignKey: 'householdId',
    as: 'residents'
});

export { Bill, Household, User, Resident };