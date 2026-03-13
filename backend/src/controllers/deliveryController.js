const DeliveryAgent = require('../models/DeliveryAgent');
const Order = require('../models/Order');
const User = require('../models/User');
const IssueReport = require('../models/IssueReport');

// Get agent profile (or application status)
exports.getProfile = async (req, res) => {
    try {
        const agent = await DeliveryAgent.findOne({ user: req.user._id });

        if (!agent) {
            return res.status(404).json({ success: false, message: 'Agent registration not found' });
        }

        const agentObj = agent.toObject();

        // Calculate exact real data
        const completedOrders = await Order.find({ deliveryAgent: agent._id, status: 'delivered' });
        agentObj.totalDeliveries = completedOrders.length;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        agentObj.todayDeliveries = completedOrders.filter(o => o.actualDeliveryTime && new Date(o.actualDeliveryTime) >= today).length;

        // 2. Average Delivery Time
        let totalTimeMinutes = 0;
        let validOrdersCount = 0;
        completedOrders.forEach(o => {
            if (o.actualDeliveryTime && o.createdAt) {
                const diff = (new Date(o.actualDeliveryTime) - new Date(o.createdAt)) / 60000;
                totalTimeMinutes += diff;
                validOrdersCount++;
            }
        });
        agentObj.avgDeliveryTime = validOrdersCount > 0 ? Math.round(totalTimeMinutes / validOrdersCount) + ' mins' : 'N/A';

        // 3. Store Pending Orders (orders waiting to be picked up)
        const pendingStoreOrders = await Order.countDocuments({ status: { $in: ['pending', 'processing', 'packed'] } });
        agentObj.pendingOrders = pendingStoreOrders;

        // 4. Online Hours & Driving Metrics
        // 4. Online Hours & Driving Metrics
        let currentOnlineHours = agent.onlineHours?.today || 0;
        if (agent.isOnline && agent.lastOnlineAt) {
            currentOnlineHours += (new Date() - new Date(agent.lastOnlineAt)) / (1000 * 60 * 60);
        }
        agentObj.onlineHours = currentOnlineHours.toFixed(1);
        agentObj.kmDriven = agent.kmDriven?.today || 0;

        // Populate fallback for ID if not generated
        if (!agentObj.employeeId) {
            agentObj.employeeId = 'KM-' + agent._id.toString().slice(-6).toUpperCase();
        }

        // 7. Recent Announcements
        const Announcement = require('../models/Announcement');
        const announcements = await Announcement.find({
            isActive: true,
            targetAudience: { $in: ['all', 'delivery'] }
        }).sort({ createdAt: -1 }).limit(5);
        agentObj.announcements = announcements;

        res.json({ success: true, data: { agent: agentObj } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get all delivery agents (Admin)
exports.getAgents = async (req, res) => {
    try {
        const { isAvailable, isActive, isOnline, status } = req.query;
        const filter = {};
        if (isAvailable !== undefined) filter.isAvailable = isAvailable === 'true';
        if (isActive !== undefined) filter.isActive = isActive === 'true';
        if (isOnline !== undefined) filter.isOnline = isOnline === 'true';
        if (status) filter.status = status;

        const agents = await DeliveryAgent.find(filter).populate('user', 'name email phone').lean();
        res.json({ success: true, data: { agents } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Apply to be a delivery partner (Customer)
exports.applyForPartner = async (req, res) => {
    try {
        const { vehicleType, vehicleNumber, licenseNumber, aadhaarNumber, panNumber, bankDetails } = req.body;

        let agent = await DeliveryAgent.findOne({ user: req.user._id });
        if (agent) {
            return res.status(400).json({ success: false, message: 'Application already submitted' });
        }

        agent = await DeliveryAgent.create({
            user: req.user._id,
            name: req.user.name || 'Partner applicant',
            phone: req.user.phone || '0000000000',
            email: req.user.email || '',
            vehicleType,
            vehicleNumber,
            licenseNumber,
            aadhaarNumber,
            panNumber,
            bankDetails,
            status: 'pending',
            isOnline: false,
            isAvailable: false,
            isActive: false
        });

        res.status(201).json({ success: true, message: 'Application submitted successfully', data: { agent } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Admin updates application status
exports.updateApplicationStatus = async (req, res) => {
    try {
        const { status } = req.body; // 'approved' or 'rejected'
        const agent = await DeliveryAgent.findById(req.params.id);
        if (!agent) return res.status(404).json({ success: false, message: 'Application not found' });

        agent.status = status;
        if (status === 'approved') {
            agent.isActive = true;
            // Upgrade user role to delivery if they are just a customer
            const user = await User.findById(agent.user);
            if (user && user.role === 'customer') {
                user.role = 'delivery';
                await user.save();
            }
        } else {
            agent.isActive = false;
        }
        await agent.save();

        res.json({ success: true, message: `Application ${status}`, data: { agent } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Create delivery agent
exports.createAgent = async (req, res) => {
    try {
        const { name, phone, email, vehicleType, vehicleNumber, licenseNumber, password } = req.body;

        // Create user account for agent
        let user = await User.findOne({ phone });
        if (!user) {
            user = await User.create({
                name,
                phone,
                email,
                password: password || 'delivery123',
                role: 'delivery',
                isVerified: true
            });
        } else {
            user.role = 'delivery';
            await user.save();
        }

        const agent = await DeliveryAgent.create({
            user: user._id,
            name,
            phone,
            email,
            vehicleType,
            vehicleNumber,
            licenseNumber,
            status: 'approved',
            isActive: true
        });

        res.status(201).json({ success: true, message: 'Delivery agent created', data: { agent } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update agent
exports.updateAgent = async (req, res) => {
    try {
        const agent = await DeliveryAgent.findByIdAndUpdate(req.params.id, req.body, {
            new: true, runValidators: true
        });
        if (!agent) {
            return res.status(404).json({ success: false, message: 'Agent not found' });
        }
        res.json({ success: true, message: 'Agent updated', data: { agent } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete agent
exports.deleteAgent = async (req, res) => {
    try {
        const agent = await DeliveryAgent.findByIdAndDelete(req.params.id);
        if (!agent) {
            return res.status(404).json({ success: false, message: 'Agent not found' });
        }
        res.json({ success: true, message: 'Delivery agent deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update agent location
exports.updateLocation = async (req, res) => {
    try {
        const { latitude, longitude } = req.body;
        const agent = await DeliveryAgent.findOneAndUpdate(
            { user: req.user._id },
            {
                currentLocation: {
                    type: 'Point',
                    coordinates: [longitude, latitude]
                }
            },
            { new: true }
        );
        res.json({ success: true, data: { agent } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Toggle break
exports.toggleBreak = async (req, res) => {
    try {
        let agent = await DeliveryAgent.findOne({ user: req.user._id });
        if (!agent) return res.status(404).json({ success: false, message: 'Agent not found' });

        if (!agent.isOnline) {
            return res.status(400).json({ success: false, message: 'You must be online to take a break' });
        }

        const todayStr = new Date().toISOString().split('T')[0];
        let attIndex = agent.attendance.findIndex(a => a.date === todayStr);
        if (attIndex === -1) {
            agent.attendance.push({ date: todayStr, status: 'present', logs: [] });
            attIndex = agent.attendance.length - 1;
        }

        agent.isOnBreak = !agent.isOnBreak;

        if (agent.isOnBreak) {
            agent.isAvailable = false;
            agent.lastBreakAt = new Date();
            agent.attendance[attIndex].logs.push({ event: 'break-start', time: new Date() });
        } else {
            agent.isAvailable = agent.currentOrder ? false : true;
            if (agent.lastBreakAt) {
                const breakMins = (new Date() - new Date(agent.lastBreakAt)) / (1000 * 60);
                agent.attendance[attIndex].breakMinutes = (agent.attendance[attIndex].breakMinutes || 0) + breakMins;
            }
            agent.attendance[attIndex].logs.push({ event: 'break-end', time: new Date() });
        }

        await agent.save();
        res.json({ success: true, data: { agent } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Toggle availability (Online/Offline) - Merged with Check-In logic
exports.toggleAvailability = async (req, res) => {
    try {
        let agent = await DeliveryAgent.findOne({ user: req.user._id });
        if (!agent) return res.status(404).json({ success: false, message: 'Agent not found' });

        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];
        let attIndex = agent.attendance.findIndex(a => a.date === todayStr);

        // Ensure attendance record exists for today
        if (attIndex === -1) {
            agent.attendance.push({
                date: todayStr,
                status: 'present',
                hours: 0,
                onlineHours: 0,
                breakMinutes: 0,
                logs: []
            });
            attIndex = agent.attendance.length - 1;
        }

        agent.isOnline = !agent.isOnline;

        if (!agent.isOnline) {
            // Going Offline
            agent.isAvailable = false;
            agent.isOnBreak = false;

            if (agent.lastOnlineAt) {
                const hoursPassed = (new Date() - new Date(agent.lastOnlineAt)) / (1000 * 60 * 60);
                agent.onlineHours.today = (agent.onlineHours.today || 0) + hoursPassed;
                agent.onlineHours.total = (agent.onlineHours.total || 0) + hoursPassed;
                agent.attendance[attIndex].onlineHours = (agent.attendance[attIndex].onlineHours || 0) + hoursPassed;
            }
            agent.lastOfflineAt = now;
            agent.attendance[attIndex].logs.push({ event: 'go-offline', time: now });

            // If they are going offline, we also update total shift hours up to this point
            if (agent.checkInTime) {
                const totalShiftHours = (now - new Date(agent.checkInTime)) / (1000 * 60 * 60);
                agent.attendance[attIndex].hours = totalShiftHours;
            }
        } else {
            // Going Online

            // AUTO CHECK-IN: If not checked in today, do it now
            if (!agent.checkInTime) {
                agent.checkInTime = now;
                agent.checkOutTime = null;
                agent.attendance[attIndex].logs.push({ event: 'check-in', time: now });
            }

            agent.isAvailable = true;
            agent.lastOnlineAt = now;
            agent.attendance[attIndex].logs.push({ event: 'go-online', time: now });
        }

        await agent.save();
        res.json({ success: true, data: { agent } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get agent's current delivery
exports.getCurrentDelivery = async (req, res) => {
    try {
        const agent = await DeliveryAgent.findOne({ user: req.user._id });
        if (!agent || !agent.currentOrder) {
            return res.json({ success: true, data: { order: null } });
        }
        const order = await Order.findById(agent.currentOrder)
            .populate('user', 'name phone');
        res.json({ success: true, data: { order } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update order status (Agent specific)
exports.updateStatus = async (req, res) => {
    try {
        const { orderId, status, note, otp } = req.body;
        const agent = await DeliveryAgent.findOne({ user: req.user._id });
        if (!agent) {
            return res.status(404).json({ success: false, message: 'Agent registration not found' });
        }

        const order = await Order.findOne({ _id: orderId, deliveryAgent: agent._id }).select('+deliveryOTP');
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found or not assigned to you' });
        }

        // Validate state transitions
        const allowedStatuses = ['picked_up', 'arrived', 'delivered', 'cancelled'];
        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status update' });
        }

        // OTP verification for delivery
        if (status === 'delivered') {
            if (!otp || otp !== order.deliveryOTP) {
                return res.status(400).json({ success: false, message: 'Invalid or missing OTP' });
            }
        }

        order.status = status;
        order.statusHistory.push({
            status,
            note: note || `Status updated to ${status} by delivery agent`,
            timestamp: new Date()
        });

        if (status === 'delivered') {
            order.actualDeliveryTime = new Date();
            order.paymentStatus = 'paid';
            agent.currentOrder = null;
            agent.isAvailable = true;
            agent.totalDeliveries += 1;
            await agent.save();
        } else if (status === 'picked_up') {
            // Keep currentOrder as is
        } else if (status === 'cancelled') {
            agent.currentOrder = null;
            agent.isAvailable = true;
            await agent.save();
        }

        await order.save();
        res.json({ success: true, message: `Order status updated to ${status}`, data: { order } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get agent's order history
exports.getAgentHistory = async (req, res) => {
    try {
        const agent = await DeliveryAgent.findOne({ user: req.user._id });
        if (!agent) return res.status(404).json({ success: false, message: 'Agent not found' });

        const orders = await Order.find({ deliveryAgent: agent._id })
            .sort({ createdAt: -1 })
            .limit(20);

        res.json({ success: true, data: { orders } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Complete delivery (simplified alias or specific logic)
exports.completeDelivery = async (req, res) => {
    req.body.status = 'delivered';
    return exports.updateStatus(req, res);
};

// Check In (Start of Day)
exports.checkIn = async (req, res) => {
    try {
        const agent = await DeliveryAgent.findOne({ user: req.user._id });
        if (!agent) return res.status(404).json({ success: false, message: 'Agent not found' });

        const now = new Date();
        agent.checkInTime = now;
        agent.checkOutTime = null;

        const todayStr = now.toISOString().split('T')[0];
        let attIndex = agent.attendance.findIndex(a => a.date === todayStr);
        if (attIndex === -1) {
            agent.attendance.push({
                date: todayStr,
                status: 'present',
                hours: 0,
                onlineHours: 0,
                breakMinutes: 0,
                logs: [{ event: 'check-in', time: now }]
            });
        } else {
            agent.attendance[attIndex].logs.push({ event: 'check-in', time: now });
        }

        await agent.save();
        res.json({ success: true, message: 'Shift started!', data: { agent } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Check Out (End of Day)
exports.checkOut = async (req, res) => {
    try {
        const agent = await DeliveryAgent.findOne({ user: req.user._id });
        if (!agent) return res.status(404).json({ success: false, message: 'Agent not found' });

        if (agent.isOnline) {
            return res.status(400).json({ success: false, message: 'Please go Offline before Checking Out' });
        }

        const now = new Date();
        agent.checkOutTime = now;
        agent.isOnline = false;
        agent.isAvailable = false;
        agent.isOnBreak = false;

        const todayStr = now.toISOString().split('T')[0];
        const attIndex = agent.attendance.findIndex(a => a.date === todayStr);

        if (attIndex >= 0) {
            // Calculate total shift hours (Check-in to Check-out)
            if (agent.checkInTime) {
                const totalShiftHours = (now - new Date(agent.checkInTime)) / (1000 * 60 * 60);
                agent.attendance[attIndex].hours = totalShiftHours;

                // 🏁 Productivity-based Status Calculation
                if (totalShiftHours >= 6) {
                    agent.attendance[attIndex].status = 'present';
                } else if (totalShiftHours >= 3) {
                    agent.attendance[attIndex].status = 'half-day';
                } else {
                    agent.attendance[attIndex].status = 'absent';
                }
            }
            agent.attendance[attIndex].logs.push({ event: 'check-out', time: now });
        }

        // Reset daily times for next shift
        agent.checkInTime = null;

        await agent.save();
        res.json({ success: true, message: 'Shift ended. Great work today!', data: { agent } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get Announcements
exports.getAnnouncements = async (req, res) => {
    try {
        const Announcement = require('../models/Announcement');
        const announcements = await Announcement.find({
            isActive: true,
            targetAudience: { $in: ['all', 'delivery'] }
        }).sort({ createdAt: -1 });

        res.json({ success: true, data: { announcements } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get nearby available agents
exports.getNearbyAgents = async (req, res) => {
    try {
        const { longitude, latitude, maxDistance = 4000 } = req.query;
        const agents = await DeliveryAgent.find({
            isAvailable: true,
            isActive: true,
            isOnline: true,
            currentLocation: {
                $near: {
                    $geometry: { type: 'Point', coordinates: [parseFloat(longitude), parseFloat(latitude)] },
                    $maxDistance: parseInt(maxDistance)
                }
            }
        });
        res.json({ success: true, data: { agents } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Report an issue (Agent)
exports.reportIssue = async (req, res) => {
    try {
        const agent = await DeliveryAgent.findOne({ user: req.user._id });
        if (!agent) {
            return res.status(404).json({ success: false, message: 'Agent not found' });
        }

        const { type, severity, description, orderId, location } = req.body;

        const report = await IssueReport.create({
            agent: agent._id,
            order: orderId,
            type,
            severity,
            description,
            location
        });

        res.status(201).json({ success: true, data: { report } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get all issue reports (Admin)
exports.getIssueReports = async (req, res) => {
    try {
        const reports = await IssueReport.find()
            .populate('agent', 'name phone employeeId')
            .populate('order', 'orderNumber status')
            .sort({ createdAt: -1 });
        res.json({ success: true, data: { reports } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update issue status (Admin)
exports.updateIssueStatus = async (req, res) => {
    try {
        const { status, adminNotes } = req.body;
        const report = await IssueReport.findByIdAndUpdate(
            req.params.id,
            {
                status,
                adminNotes,
                resolvedAt: status === 'resolved' ? new Date() : undefined
            },
            { new: true }
        );
        res.json({ success: true, data: { report } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};



// Agent uploads a document
exports.uploadDocument = async (req, res) => {
    try {
        const { type, number } = req.body; // type: 'aadhaar', 'pan', 'license', 'bank'
        const agent = await DeliveryAgent.findOne({ user: req.user._id });

        if (!agent) {
            return res.status(404).json({ success: false, message: 'Agent not found' });
        }

        const docData = {
            status: 'pending',
            verifiedAt: null,
            rejectionReason: null
        };

        if (req.file) {
            docData.file = `/uploads/${req.file.filename}`;
        }

        if (type === 'bank') {
            const { accountNumber, ifscCode, bankName } = req.body;
            agent.documents.bank = {
                ...agent.documents.bank,
                accountNumber,
                ifscCode,
                bankName,
                status: 'pending'
            };
            // Also update legacy bankDetails
            agent.bankDetails = { accountNumber, ifscCode, bankName };
        } else {
            if (!agent.documents[type]) {
                return res.status(400).json({ success: false, message: 'Invalid document type' });
            }
            agent.documents[type] = {
                ...agent.documents[type],
                ...docData,
                number: number || agent.documents[type].number
            };
            // Update legacy fields
            if (type === 'aadhaar') agent.aadhaarNumber = number || agent.aadhaarNumber;
            if (type === 'pan') agent.panNumber = number || agent.panNumber;
            if (type === 'license') agent.licenseNumber = number || agent.licenseNumber;
        }

        await agent.save();
        res.json({ success: true, message: 'Document uploaded for verification', data: { agent } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Admin verifies a document
exports.verifyDocument = async (req, res) => {
    try {
        const { agentId } = req.params;
        const { docType, status, rejectionReason } = req.body; // docType: 'aadhaar', 'pan', 'license', 'bank'

        const agent = await DeliveryAgent.findById(agentId);
        if (!agent) return res.status(404).json({ success: false, message: 'Agent not found' });

        if (!agent.documents[docType]) {
            return res.status(400).json({ success: false, message: 'Invalid document type' });
        }

        agent.documents[docType].status = status;
        if (status === 'verified') {
            agent.documents[docType].verifiedAt = new Date();
            agent.documents[docType].rejectionReason = null;
        } else if (status === 'rejected') {
            agent.documents[docType].rejectionReason = rejectionReason;
        }

        await agent.save();
        res.json({ success: true, message: `Document ${status} successfully`, data: { agent } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Admin gets detailed performance for a specific agent with date filters
exports.getAgentDetailedPerformance = async (req, res) => {
    try {
        const { agentId } = req.params;
        const { startDate, endDate } = req.query;

        const agent = await DeliveryAgent.findById(agentId);
        if (!agent) return res.status(404).json({ success: false, message: 'Agent not found' });

        const start = startDate ? new Date(startDate) : new Date(new Date().setDate(new Date().getDate() - 30));
        const end = endDate ? new Date(endDate) : new Date();
        end.setHours(23, 59, 59, 999);

        // Fetch orders in range
        const orders = await Order.find({
            deliveryAgent: agentId,
            createdAt: { $gte: start, $lte: end }
        });

        // Generate daily summary
        const performanceMap = {};
        
        // Initialize map with attendance dates in range
        agent.attendance.forEach(att => {
            const attDate = new Date(att.date);
            if (attDate >= start && attDate <= end) {
                performanceMap[att.date] = {
                    date: att.date,
                    orders: 0,
                    earnings: 0,
                    attendance: att.status,
                    hours: att.hours || 0,
                    onTime: 0
                };
            }
        });

        // Aggregate orders into the map
        orders.forEach(order => {
            const dateStr = new Date(order.createdAt).toISOString().split('T')[0];
            if (!performanceMap[dateStr]) {
                performanceMap[dateStr] = {
                    date: dateStr,
                    orders: 0,
                    earnings: 0,
                    attendance: 'absent',
                    hours: 0,
                    onTime: 0
                };
            }
            
            performanceMap[dateStr].orders += 1;
            performanceMap[dateStr].earnings += (order.deliveryCharge || 20); 
            if (order.status === 'delivered') {
                if (order.actualDeliveryTime && order.createdAt) {
                    const duration = (new Date(order.actualDeliveryTime) - new Date(order.createdAt)) / 60000;
                    if (duration <= 45) performanceMap[dateStr].onTime += 1;
                }
            }
        });

        const performanceLogs = Object.values(performanceMap).sort((a, b) => new Date(b.date) - new Date(a.date));

        res.json({
            success: true,
            data: {
                agent: {
                    name: agent.name,
                    employeeId: agent.employeeId,
                    performance: agent.performance
                },
                logs: performanceLogs
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
