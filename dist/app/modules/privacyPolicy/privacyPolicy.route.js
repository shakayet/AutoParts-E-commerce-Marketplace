"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrivacyPolicyRoutes = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const privacyPolicy_controller_1 = require("./privacyPolicy.controller");
const privacyPolicy_validation_1 = require("./privacyPolicy.validation");
const user_1 = require("../../../enums/user");
const router = express_1.default.Router();
router
    .route('/')
    .get(privacyPolicy_controller_1.PrivacyPolicyController.getPrivacyPolicies)
    .post((0, auth_1.default)(user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.SUPER_ADMIN), (0, validateRequest_1.default)(privacyPolicy_validation_1.PrivacyPolicyValidation.createPrivacyPolicyZodSchema), privacyPolicy_controller_1.PrivacyPolicyController.createPrivacyPolicy);
router
    .route('/:id')
    .patch((0, auth_1.default)(user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.SUPER_ADMIN), (0, validateRequest_1.default)(privacyPolicy_validation_1.PrivacyPolicyValidation.updatePrivacyPolicyZodSchema), privacyPolicy_controller_1.PrivacyPolicyController.updatePrivacyPolicy)
    .delete((0, auth_1.default)(user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.SUPER_ADMIN), privacyPolicy_controller_1.PrivacyPolicyController.deletePrivacyPolicy);
exports.PrivacyPolicyRoutes = router;
