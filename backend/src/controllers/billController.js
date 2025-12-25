import { Bill, Household, User } from '../models/index.js';
import { Op, Sequelize } from 'sequelize';
import { createLog, LogActions, EntityTypes } from '../utils/logger.js';

// Helper function to calculate payment status based on amounts and billing period
const calculatePaymentStatus = (totalAmount, paidAmount, billingPeriod) => {
    const total = Number(totalAmount);
    const paid = Number(paidAmount);
    
    // Check if fully paid
    if (paid >= total && total > 0) {
        return 'Đã thanh toán';
    }
    
    // Check if partially paid
    if (paid > 0 && paid < total) {
        return 'Thanh toán một phần';
    }
    
    // Unpaid - check if overdue
    if (paid === 0) {
        const billingDate = new Date(billingPeriod);
        const currentDate = new Date();
        const billingMonth = billingDate.getMonth();
        const billingYear = billingDate.getFullYear();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();
        
        if (billingYear < currentYear || (billingYear === currentYear && billingMonth < currentMonth)) {
            return 'Quá hạn';
        }
        
        return 'Chưa thanh toán';
    }
    
    return 'Chưa thanh toán';
};

export const getAllBills = async (req, res) => {
    try {
        console.log('GET /api/bills - Request received');
        
        // Get pagination parameters from query string
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        // Get search filters from query string
        const { bill_id,householdName, paymentPeriod, status, collectorName } = req.query;
        
        console.log('Filters:', { bill_id,householdName, paymentPeriod, status, collectorName });

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
        
        // Note: Status filtering will be done after fetching data
        // because status is calculated dynamically from totalAmount, paidAmount, and billingPeriod
        // No database-level filtering for status
        
        // Filter by bill ID - exact match by number
        if (bill_id) {
            billWhere.billId = parseInt(bill_id);
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
        
        // All status filters need post-filtering because status is calculated dynamically
        const needsPostFiltering = !!status;
        
        const queryOptions = {
            where: billWhere,
            include: [
                {
                    model: Household,
                    as: 'household_bill',
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
            order: [['createdAt', 'DESC']],
            distinct: true
        };
        
        // Only add limit/offset if we don't need post-filtering
        if (!needsPostFiltering) {
            queryOptions.limit = limit;
            queryOptions.offset = offset;
        }
        
        const { count, rows } = await Bill.findAndCountAll(queryOptions);

        console.log(`Found ${count} bills from database`);

        // Transform data for frontend
        let transformedBills = rows.map(bill => {
            const billData = bill.toJSON();
            
            // Calculate status dynamically based on amounts and billing period
            const displayStatus = calculatePaymentStatus(
                billData.totalAmount,
                billData.paidAmount,
                billData.billingPeriod
            );
            
            // Filter by status if specified
            if (status && status !== displayStatus) {
                return null;
            }
            
            return {
                billId: billData.billId,
                householdName: billData.household_bill?.ownerName || '',
                title: billData.title,
                totalAmount: billData.totalAmount,
                paidAmount: billData.paidAmount,
                paymentPeriod: new Date(billData.billingPeriod).toISOString().slice(0, 7),
                status: displayStatus,
                collectorName: billData.collector?.fullName || null,
                createdAt: billData.createdAt
            };
        }).filter(bill => bill !== null);

        // Apply pagination after filtering if needed
        let finalBills = transformedBills;
        let totalCount = transformedBills.length;
        
        if (needsPostFiltering) {
            totalCount = transformedBills.length;
            finalBills = transformedBills.slice(offset, offset + limit);
        } else {
            totalCount = count;
        }

        const totalPages = Math.ceil(totalCount / limit);

        console.log('Sending response...');
        
        // Log view all bills activity
        await createLog(req.user.userId, LogActions.VIEW_ALL_BILLS, EntityTypes.BILL, null, 
            { count: finalBills.length, filters: { bill_id, householdName, paymentPeriod, status } }, req);
        
        res.status(200).json({
            bills: finalBills,
            pagination: {
                currentPage: page,
                totalPages,
                totalItems: totalCount,
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
        const { householdId, title, totalAmount, paidAmount, paymentPeriod, collectorName, feeTypeId } = req.body;

        console.log(`Updating bill ${id} with data:`, req.body);

        // Find the bill
        const bill = await Bill.findByPk(id, {
            include: [
                {
                    model: Household,
                    as: 'household_bill',
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

        // Update household if provided
        if (householdId !== undefined) {
            const household = await Household.findByPk(householdId);
            if (!household) {
                return res.status(404).json({ message: 'Household not found' });
            }
            bill.householdId = householdId;
        }

        // Update fields if provided
        if (title !== undefined) bill.title = title;
        if (totalAmount !== undefined) bill.totalAmount = totalAmount;
        if (feeTypeId !== undefined) bill.feeTypeId = feeTypeId;
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

        // Update billing period if provided (format: YYYY-MM)
        if (paymentPeriod !== undefined) {
            const [year, month] = paymentPeriod.split('-');
            if (year < 1 || month < 1 || month > 12) {
                return res.status(400).json({ message: 'Sai định dạng ngày tháng. Sử dụng YYYY-MM' });
            }
            bill.billingPeriod = new Date(year, month, 1);
        }


        // Handle collector name
        if (collectorName !== undefined) {
            if (collectorName) {
                // Chỉ cho phép người thu có tên trong bảng users với role ADMIN
                const collector = await User.findOne({
                    where: { fullName: collectorName, role: 'ADMIN' }
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
                    as: 'household_bill',
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
        
        // Calculate status dynamically based on amounts and billing period
        const displayStatus = calculatePaymentStatus(
            billData.totalAmount,
            billData.paidAmount,
            billData.billingPeriod
        );

        // Log update bill activity
        await createLog(req.user.userId, LogActions.UPDATE_BILL, EntityTypes.BILL, id, 
            { billId: id, householdName: billData.household_bill?.ownerName, title: billData.title }, req);

        res.status(200).json({
            billId: billData.billId,
            householdName: billData.household_bill?.ownerName || '',
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

export const createBill = async (req, res) => {
    try {
        const { householdId, title, totalAmount, paidAmount, paymentPeriod, collectorName, feeTypeId } = req.body;

        console.log('Creating bill with data:', req.body);

        // Validate required fields
        if (!householdId || !title || totalAmount === undefined || paidAmount === undefined || !paymentPeriod) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Validate paidAmount <= totalAmount
        if (paidAmount > totalAmount) {
            return res.status(400).json({ 
                message: 'Số tiền đã trả không được lớn hơn tổng tiền' 
            });
        }

        // Parse payment period (format: YYYY-MM)
        const [year, month] = paymentPeriod.split('-');
        if (!year || !month) {
            return res.status(400).json({ message: 'Invalid payment period format. Use YYYY-MM' });
        }
        const billingPeriod = new Date(year, month - 1, 1);

        // Find household
        const household = await Household.findByPk(householdId);
        if (!household) {
            return res.status(404).json({ message: 'Household not found' });
        }

        // Find collector if provided
        let collectorId = null;
        if (collectorName) {
            const collector = await User.findOne({
                where: { fullName: collectorName, role: 'ADMIN' }
            });
            collectorId = collector ? collector.userId : null;
        }

        // Create bill
        const bill = await Bill.create({
            householdId,
            title,
            totalAmount,
            paidAmount,
            billingPeriod,
            collectorId,
            feeTypeId: feeTypeId || null,
            createdBy: req.user.userId
        });

        // Fetch created bill with associations
        const createdBill = await Bill.findByPk(bill.billId, {
            include: [
                {
                    model: Household,
                    as: 'household_bill',
                    attributes: ['ownerName']
                },
                {
                    model: User,
                    as: 'collector',
                    attributes: ['fullName']
                }
            ]
        });

        const billData = createdBill.toJSON();
        
        // Calculate status dynamically
        const displayStatus = calculatePaymentStatus(
            billData.totalAmount,
            billData.paidAmount,
            billData.billingPeriod
        );

        // Log create bill activity
        await createLog(req.user.userId, LogActions.CREATE_BILL, EntityTypes.BILL, bill.billId, 
            { householdName: billData.household_bill?.ownerName, title: billData.title, totalAmount: billData.totalAmount }, req);

        res.status(201).json({
            billId: billData.billId,
            householdName: billData.household_bill?.ownerName || '',
            title: billData.title,
            totalAmount: billData.totalAmount,
            paidAmount: billData.paidAmount,
            paymentPeriod: new Date(billData.billingPeriod).toISOString().slice(0, 7),
            status: displayStatus,
            collectorName: billData.collector?.fullName || null,
            createdAt: billData.createdAt
        });
    } catch (error) {
        console.error('Error creating bill:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

export const deleteBill = async (req, res) => {
    try {
        const { id } = req.params;

        console.log(`Deleting bill ${id}`);

        const bill = await Bill.findByPk(id, {
            include: [{
                model: Household,
                as: 'household_bill',
                attributes: ['ownerName']
            }]
        });

        if (!bill) {
            return res.status(404).json({ message: 'Bill not found' });
        }

        const billData = {
            billId: bill.billId,
            householdName: bill.household_bill?.ownerName,
            title: bill.title
        };

        await bill.destroy();

        // Log delete bill activity
        await createLog(req.user.userId, LogActions.DELETE_BILL, EntityTypes.BILL, id, billData, req);

        res.status(200).json({ message: 'Bill deleted successfully' });
    } catch (error) {
        console.error('Error deleting bill:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};