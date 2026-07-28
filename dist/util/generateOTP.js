"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000);
};
exports.default = generateOTP;
//# sourceMappingURL=generateOTP.js.map