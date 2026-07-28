"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FAQRoutes = void 0;
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
const faq_controller_1 = require("./faq.controller");
const faq_validation_1 = require("./faq.validation");
const user_1 = require("../../../enums/user");
const fileUploadHandler_1 = __importDefault(require("../../middlewares/fileUploadHandler"));
const router = express_1.default.Router();
router
    .route('/')
    .get(faq_controller_1.FAQController.getFAQs)
    .post((0, auth_1.default)(user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.SUPER_ADMIN), (0, fileUploadHandler_1.default)(), (req, res, next) => {
    req.body = faq_validation_1.FAQValidation.createFAQZodSchema.parse(JSON.parse(req?.body?.data));
    return faq_controller_1.FAQController.createFAQ(req, res, next);
});
// validateRequest(FAQValidation.createFAQZodSchema), FAQController.createFAQ);
router
    .route('/:id')
    .patch((0, auth_1.default)(user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.SUPER_ADMIN), (0, fileUploadHandler_1.default)(), (req, res, next) => {
    if (req.body.data) {
        req.body = faq_validation_1.FAQValidation.updateFAQZodSchema.parse(JSON.parse(req?.body?.data));
    }
    return faq_controller_1.FAQController.updateFAQ(req, res, next);
})
    .delete((0, auth_1.default)(user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.SUPER_ADMIN), faq_controller_1.FAQController.deleteFAQ);
exports.FAQRoutes = router;
//# sourceMappingURL=faq.route.js.map