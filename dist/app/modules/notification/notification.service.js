"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const notification_model_1 = require("./notification.model");
const getNotificationsForUser = (userId_1, ...args_1) => __awaiter(void 0, [userId_1, ...args_1], void 0, function* (userId, opts = {}) {
    const page = Math.max(1, opts.page || 1);
    const limit = Math.min(100, opts.limit || 20);
    const skip = (page - 1) * limit;
    const q = { user: userId };
    if (typeof opts.isRead === 'boolean')
        q.isRead = opts.isRead;
    const [items, total] = yield Promise.all([
        notification_model_1.Notification.find(q).sort({ createdAt: -1 }).skip(skip).limit(limit),
        notification_model_1.Notification.countDocuments(q),
    ]);
    return { items, total, page, limit };
});
const markAsRead = (id, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const n = yield notification_model_1.Notification.findOne({ _id: id, user: userId });
    if (!n)
        return null;
    if (!n.isRead) {
        n.isRead = true;
        yield n.save();
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
});
const markAllAsRead = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const res = yield notification_model_1.Notification.updateMany({ user: userId, isRead: false }, { $set: { isRead: true } });
    try {
        const io = global.io;
        if (io)
            io.to(String(userId)).emit('NOTIFICATIONS_READ_ALL', {});
    }
    catch (err) {
        console.error('Error emitting NOTIFICATIONS_READ_ALL event:', err);
    }
    return res;
});
const deleteNotification = (id, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const res = yield notification_model_1.Notification.findOneAndDelete({ _id: id, user: userId });
    return res;
});
exports.NotificationService = {
    getNotificationsForUser,
    markAsRead,
    markAllAsRead,
    deleteNotification,
};
