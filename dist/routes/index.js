"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_route_1 = require("../app/modules/auth/auth.route");
const user_route_1 = require("../app/modules/user/user.route");
const product_route_1 = require("../app/modules/product/product.route");
const notification_route_1 = require("../app/modules/notification/notification.route");
const review_route_1 = require("../app/modules/review/review.route");
const report_route_1 = require("../app/modules/report/report.route");
const category_route_1 = require("../app/modules/category/category.route");
const faq_route_1 = require("../app/modules/faq/faq.route");
const terms_route_1 = require("../app/modules/terms/terms.route");
const privacyPolicy_route_1 = require("../app/modules/privacyPolicy/privacyPolicy.route");
const seller_route_1 = require("../app/modules/seller/seller.route");
const wishlist_route_1 = require("../app/modules/wishList/wishlist.route");
const admin_route_1 = require("../app/modules/admin/admin.route");
const categoryRequest_route_1 = require("../app/modules/categoryRequest/categoryRequest.route");
const router = express_1.default.Router();
const apiRoutes = [
    {
        path: '/user',
        route: user_route_1.UserRoutes,
    },
    {
        path: '/auth',
        route: auth_route_1.AuthRoutes,
    },
    {
        path: '/product',
        route: product_route_1.ProductRoutes,
    },
    {
        path: '/review',
        route: review_route_1.ReviewRoutes,
    },
    {
        path: '/notification',
        route: notification_route_1.NotificationRoutes,
    },
    {
        path: '/report',
        route: report_route_1.ReportRoutes,
    },
    {
        path: '/category',
        route: category_route_1.CategoryRoutes,
    },
    {
        path: '/faq',
        route: faq_route_1.FAQRoutes,
    },
    {
        path: '/terms',
        route: terms_route_1.TermsRoutes,
    },
    {
        path: '/privacy-policy',
        route: privacyPolicy_route_1.PrivacyPolicyRoutes,
    },
    {
        path: '/seller',
        route: seller_route_1.SellerRoutes,
    },
    {
        path: '/wishlist',
        route: wishlist_route_1.WishlistRoutes,
    },
    {
        path: '/admin',
        route: admin_route_1.AdminRoutes,
    },
    {
        path: '/category-request',
        route: categoryRequest_route_1.CategoryRequestRoutes,
    },
];
apiRoutes.forEach(route => router.use(route.path, route.route));
exports.default = router;
//# sourceMappingURL=index.js.map