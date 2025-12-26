import Bill from './Bill.js';
import Household from './Household.js';
import User from './User.js';
import Resident from './Resident.js';
import Log from './Log.js';
import FeeType from './FeeType.js';

// Define associations
Bill.belongsTo(Household, {
    foreignKey: 'householdId',
    as: 'household_bill'
});

Bill.belongsTo(User, {
    foreignKey: 'collectorId',
    as: 'Collector'
});

Bill.belongsTo(FeeType, {
    foreignKey: 'feeTypeId',
});

Household.hasMany(Bill, {
    foreignKey: 'householdId',
    as: 'bills'
}); 

User.hasMany(Bill, {
    foreignKey: 'collectorId',
    as: 'collectedBills'
});

FeeType.hasMany(Bill, {
    foreignKey: 'feeTypeId',
});

Resident.belongsTo(Household, {
    foreignKey: 'householdId',
    as: 'household_resident'
});

Household.hasMany(Resident, {
    foreignKey: 'householdId',
    as: 'residents'
});

// Log associations
Log.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user'
});

User.hasMany(Log, {
    foreignKey: 'userId',
    as: 'logs'
});

// User - Household associations
User.belongsTo(Household, {
    foreignKey: 'householdId',
    as: 'household'
});

Household.hasOne(User, {
    foreignKey: 'householdId',
    as: 'user'
});

export { Bill, Household, User, Resident, Log, FeeType };