"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Notification = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const mongoose_1 = require("mongoose");
const notificationSchema = new mongoose_1.Schema({
    user: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, required: true },
    data: { type: mongoose_1.Schema.Types.Mixed },
    isRead: { type: Boolean, default: false },
}, { timestamps: true });
exports.Notification = (0, mongoose_1.model)('Notification', notificationSchema);
//# sourceMappingURL=notification.model.js.map