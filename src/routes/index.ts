import express from 'express';
import { AuthRoutes } from '../app/modules/auth/auth.route';
import { UserRoutes } from '../app/modules/user/user.route';
import { ProductRoutes } from '../app/modules/product/product.route';
import { NotificationRoutes } from '../app/modules/notification/notification.route';
import { ReviewRoutes } from '../app/modules/review/review.route';
import { ReportRoutes } from '../app/modules/report/report.route';
import { CategoryRoutes } from '../app/modules/category/category.route';
import { FAQRoutes } from '../app/modules/faq/faq.route';
import { TermsRoutes } from '../app/modules/terms/terms.route';
import { SellerRoutes } from '../app/modules/seller/seller.route';
const router = express.Router();

const apiRoutes = [
  {
    path: '/user',
    route: UserRoutes,
  },
  {
    path: '/auth',
    route: AuthRoutes,
  },
  {
    path: '/product',
    route: ProductRoutes,
  },
  {
    path: '/review',
    route: ReviewRoutes,
  },
  {
    path: '/notification',
    route: NotificationRoutes,
  },
  {
    path: '/report',
    route: ReportRoutes,
  },
  {
    path: '/category',
    route: CategoryRoutes,
  },
  {
    path: '/faq',
    route: FAQRoutes,
  },
  {
    path: '/terms',
    route: TermsRoutes,
  },
  {
    path: '/seller',
    route: SellerRoutes,
  },
];

apiRoutes.forEach(route => router.use(route.path, route.route));

export default router;
