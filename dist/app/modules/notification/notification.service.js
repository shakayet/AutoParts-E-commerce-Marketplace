"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const notification_model_1 = require("./notification.model");
const getNotificationsForUser = async (userId, opts = {}) => {
    const page = Math.max(1, opts.page || 1);
    const limit = Math.min(100, opts.limit || 20);
    const skip = (page - 1) * limit;
    const q = { user: userId };
    if (typeof opts.isRead === 'boolean')
        q.isRead = opts.isRead;
    const [items, total] = await Promise.all([
        notification_model_1.Notification.find(q).sort({ createdAt: -1 }).skip(skip).limit(limit),
        notification_model_1.Notification.countDocuments(q),
    ]);
    return { items, total, page, limit };
};
const markAsRead = async (id, userId) => {
    const n = await notification_model_1.Notification.findOne({ _id: id, user: userId });
    if (!n)
        return null;
    if (!n.isRead) {
        n.isRead = true;
        await n.save();
        try {
            const io = global.io;
            if (io)
                io.to(String(userId)).emit('NOTIFICATION_READ', { id: n._id });
        }
        catch (err) {
            console.error('Error emitting NOTIFICATION_READ event:', err);
        }
    }
    return n;
};
const markAllAsRead = async (userId) => {
    const res = await notification_model_1.Notification.updateMany({ user: userId, isRead: false }, { $set: { isRead: true } });
    try {
        const io = global.io;
        if (io)
            io.to(String(userId)).emit('NOTIFICATIONS_READ_ALL', {});
    }
    catch (err) {
        console.error('Error emitting NOTIFICATIONS_READ_ALL event:', err);
    }
    return res;
};
const deleteNotification = async (id, userId) => {
    const res = await notification_model_1.Notification.findOneAndDelete({ _id: id, user: userId });
    return res;
};
exports.NotificationService = {
    getNotificationsForUser,
    markAsRead,
    markAllAsRead,
    deleteNotification,
};
//# sourceMappingURL=notification.service.js.map