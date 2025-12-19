import Bill from '../models/Bill.js';
import Household from '../models/Household.js';
import User from '../models/User.js';
import { Op } from 'sequelize';

// Set up associations
Bill.belongsTo(Household, { foreignKey: 'householdId', as: 'household' });
Bill.belongsTo(User, { foreignKey: 'collectorId', as: 'collector' });

export const getAllBills = async (req, res) => {
    try {
        console.log('GET /api/bills - Request received');
        
        // Get pagination parameters from query string
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        // Get search filters from query string
        const { householdName, paymentPeriod, status, collectorName } = req.query;
        
        console.log('Filters:', { householdName, paymentPeriod, status, collectorName });

        // Build where clause for bills table
        const billWhere = {};
        const householdWhere = {};
        const collectorWhere = {};
        
        // Filter by billing_period (format: YYYY-MM)
        if (paymentPeriod) {
            const [year, month] = paymentPeriod.split('-');
            if (year && month) {
                // Start date: first day of the month at 00:00:00
                const startDate = new Date(year, month - 1, 1, 0, 0, 0, 0);
                // End date: last day of the month at 23:59:59
                const endDate = new Date(year, month, 0, 23, 59, 59, 999);
                billWhere.billingPeriod = {
                    [Op.between]: [startDate, endDate]
                };
                console.log('Payment period filter:', { startDate, endDate });
            }
        }
        
        // Map frontend status to database ENUM values
        if (status) {
            const statusMap = {
                'Đã thanh toán': 'PAID',
                'Chưa thanh toán': 'UNPAID',
                'Thanh toán một phần': 'PARTIAL'
            };
            billWhere.paymentStatus = statusMap[status] || status;
        }
        
        // Filter by household name
        if (householdName) {
            householdWhere.ownerName = {
                [Op.like]: `%${householdName}%`
            };
        }
        
        // Filter by collector name
        if (collectorName) {
            collectorWhere.fullName = {
                [Op.like]: `%${collectorName}%`
            };
        }

        console.log('Fetching bills from database...');
        
        // Fetch bills with joins
        const { count, rows } = await Bill.findAndCountAll({
            where: billWhere,
            include: [
                {
                    model: Household,
                    as: 'household',
                    attributes: ['ownerName', 'householdCode', 'address'],
                    where: Object.keys(householdWhere).length > 0 ? householdWhere : undefined,
                    required: true
                },
                {
                    model: User,
                    as: 'collector',
                    attributes: ['fullName', 'username'],
                    where: Object.keys(collectorWhere).length > 0 ? collectorWhere : undefined,
                    required: false
                }
            ],
            limit,
            offset,
            order: [['createdAt', 'DESC']],
            distinct: true
        });

        console.log(`Found ${count} bills`);

        // Transform data for frontend
        const transformedBills = rows.map(bill => {
            const billData = bill.toJSON();
            
            // Determine status including overdue
            let displayStatus = 'Chưa thanh toán';
            if (billData.paymentStatus === 'PAID') {
                displayStatus = 'Đã thanh toán';
            } else if (billData.paymentStatus === 'PARTIAL') {
                displayStatus = 'Thanh toán một phần';
            } else if (billData.paymentStatus === 'UNPAID') {
                const billingDate = new Date(billData.billingPeriod);
                const currentDate = new Date();
                const billingMonth = billingDate.getMonth();
                const billingYear = billingDate.getFullYear();
                const currentMonth = currentDate.getMonth();
                const currentYear = currentDate.getFullYear();
                
                if (billingYear < currentYear || (billingYear === currentYear && billingMonth < currentMonth)) {
                    displayStatus = 'Quá hạn';
                }
            }
            
            if (status === 'Quá hạn' && displayStatus !== 'Quá hạn') {
                return null;
            }
            
            return {
                billId: billData.billId,
                householdName: billData.household?.ownerName || '',
                title: billData.title,
                totalAmount: billData.totalAmount,
                paidAmount: billData.paidAmount,
                paymentPeriod: new Date(billData.billingPeriod).toISOString().slice(0, 7),
                status: displayStatus,
                collectorName: billData.collector?.fullName || null,
                createdAt: billData.createdAt
            };
        }).filter(bill => bill !== null);

        const totalPages = Math.ceil(count / limit);

        console.log('Sending response...');
        
        res.status(200).json({
            bills: transformedBills,
            pagination: {
                currentPage: page,
                totalPages,
                totalItems: count,
                itemsPerPage: limit
            }
        });
    } catch (error) {
        console.error('Error fetching bills:', error);
        console.error('Stack trace:', error.stack);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

export const updateBill = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, totalAmount, paidAmount, paymentPeriod, collectorName } = req.body;

        console.log(`Updating bill ${id} with data:`, req.body);

        // Find the bill
        const bill = await Bill.findByPk(id, {
            include: [
                {
                    model: Household,
                    as: 'household',
                    attributes: ['ownerName']
                },
                {
                    model: User,
                    as: 'collector',
                    attributes: ['fullName']
                }
            ]
        });

        if (!bill) {
            return res.status(404).json({ message: 'Bill not found' });
        }

        // Update fields if provided
        if (title !== undefined) bill.title = title;
        if (totalAmount !== undefined) bill.totalAmount = totalAmount;
        if (paidAmount !== undefined) {
            // Validate paidAmount <= totalAmount
            const currentTotalAmount = totalAmount !== undefined ? totalAmount : bill.totalAmount;
            if (paidAmount > currentTotalAmount) {
                return res.status(400).json({ 
                    message: 'Số tiền đã trả không được lớn hơn tổng tiền' 
                });
            }
            bill.paidAmount = paidAmount;
        }

        // Không update billingPeriod vì nếu thanh toán bù thì kì vẫn là thời gian đó
        // Thời gian thu đã được cập nhật vào log


        // Automatically calculate payment status based on amounts
        const currentTotalAmount = totalAmount !== undefined ? totalAmount : bill.totalAmount;
        const currentPaidAmount = paidAmount !== undefined ? paidAmount : bill.paidAmount;
        
        if (currentPaidAmount >= currentTotalAmount && currentTotalAmount > 0) {
            bill.paymentStatus = 'PAID';
        } else if (currentPaidAmount > 0 && currentPaidAmount < currentTotalAmount) {
            bill.paymentStatus = 'PARTIAL';
        } else {
            bill.paymentStatus = 'UNPAID';
        }

        // Handle collector name
        if (collectorName !== undefined) {
            if (collectorName) {
                // Find user by full name
                const collector = await User.findOne({
                    where: { fullName: collectorName }
                });
                bill.collectorId = collector ? collector.userId : null;
            } else {
                bill.collectorId = null;
            }
        }

        await bill.save();

        // Fetch updated bill with associations
        const updatedBill = await Bill.findByPk(id, {
            include: [
                {
                    model: Household,
                    as: 'household',
                    attributes: ['ownerName']
                },
                {
                    model: User,
                    as: 'collector',
                    attributes: ['fullName']
                }
            ]
        });

        const billData = updatedBill.toJSON();
        
        // Transform status (check for overdue)
        let displayStatus = 'Chưa thanh toán';
        if (billData.paymentStatus === 'PAID') {
            displayStatus = 'Đã thanh toán';
        } else if (billData.paymentStatus === 'PARTIAL') {
            displayStatus = 'Thanh toán một phần';
        } else if (billData.paymentStatus === 'UNPAID') {
            const billingDate = new Date(billData.billingPeriod);
            const currentDate = new Date();
            const billingMonth = billingDate.getMonth();
            const billingYear = billingDate.getFullYear();
            const currentMonth = currentDate.getMonth();
            const currentYear = currentDate.getFullYear();
            
            if (billingYear < currentYear || (billingYear === currentYear && billingMonth < currentMonth)) {
                displayStatus = 'Quá hạn';
            }
        }

        res.status(200).json({
            billId: billData.billId,
            householdName: billData.household?.ownerName || '',
            title: billData.title,
            totalAmount: billData.totalAmount,
            paidAmount: billData.paidAmount,
            paymentPeriod: new Date(billData.billingPeriod).toISOString().slice(0, 7),
            status: displayStatus,
            collectorName: billData.collector?.fullName || null,
            createdAt: billData.createdAt
        });
    } catch (error) {
        console.error('Error updating bill:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

export const deleteBill = async (req, res) => {
    try {
        const { id } = req.params;

        console.log(`Deleting bill ${id}`);

        const bill = await Bill.findByPk(id);

        if (!bill) {
            return res.status(404).json({ message: 'Bill not found' });
        }

        await bill.destroy();

        res.status(200).json({ message: 'Bill deleted successfully' });
    } catch (error) {
        console.error('Error deleting bill:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};