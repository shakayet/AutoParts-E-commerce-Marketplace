/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-undef */
import { Report } from './report.model';
import { Notification } from '../notification/notification.model';
import StorageService from '../../services/storage.service';
import QueryBuilder from '../../builder/QueryBuilder';
import { IReport } from './report.interface';
import { Product } from '../product/product.model';
import { User } from '../user/user.model';
import { emailTemplate } from '../../../shared/emailTemplate';
import { emailHelper } from '../../../helpers/emailHelper';

type PaginatedResult<T> = {
  data: T[];
  meta: { total: number; page: number; limit: number; totalPages: number };
};

const createReportToDB = async (
  reporterId: string,
  payload: {
    type: 'product' | 'seller';
    targetId: string;
    reason: string;
    image?: string;
  },
) => {
  const result = await Report.create({ reporterId, ...payload });

  // create admin notification
  const notification = await Notification.create({
    user: reporterId, // system/admin recipient; front-end/admin dashboard will query reports
    type: 'PRODUCT_REPORTED',
    data: { reportId: result._id, ...payload },
  });

  // emit global event
  try {
    const io = (global as any).io;
    if (io) io.emit('REPORT_CREATED', notification);
  } catch (err) {
    console.error('Error emitting NEW_REVIEW event:', err);
  }

  return result;
};

const deleteReportFromDB = async (id: string) => {
  const res = await Report.findByIdAndDelete(id);
  if (!res) throw new Error('Report not found');
  if (res.image) {
    await StorageService.deleteByUrl(res.image);
  }
};

const getReportsFromDB = async (
  query: any = {},
): Promise<PaginatedResult<IReport>> => {
  const searchableFields = ['reason', 'status'];
  const queryBuilder = new QueryBuilder(Report.find({}), query)
    .search(searchableFields)
    .filter()
    .sort()
    .paginate()
    .fields();

  const [reports, total] = await Promise.all([
    queryBuilder.modelQuery.exec(),
    queryBuilder.getPaginationInfo(),
  ]);

  return {
    data: reports as IReport[],
    meta: {
      total: total.total,
      page: total.page,
      limit: total.limit,
      totalPages: total.totalPage,
    },
  };
};

const updateReportStatusToDB = async (
  id: string,
  status: 'pending' | 'reviewed' | 'dismissed',
) => {
  const report = await Report.findById(id);
  if (!report) throw new Error('Report not found');
  report.status = status;
  await report.save();
  return report;
};

const reviewReportToDB = async (
  id: string,
  status: 'resolved' | 'dismissed',
  explanation: string,
) => {
  const report = await Report.findById(id);
  if (!report) throw new Error('Report not found');

  report.status = status;
  report.adminNote = explanation;
  await report.save();

  let email;
  let productName;
  let productId;
  let productDetails;

  if (report.type === 'product') {
    const product = await Product.findById(report.targetId);
    if (product) {
      const seller = await User.findById(product.sellerId);
      email = seller?.email || undefined;
      productName = product.title;
      productId = String(product._id);
      productDetails = `Condition: ${product.condition || 'N/A'}, Price: ${
        product.price ?? 'N/A'
      }`;
    }
  } else if (report.type === 'seller') {
    const user = await User.findById(report.targetId);
    email = user?.email || undefined;
  }

  if (email) {
    const tpl = emailTemplate.reportStatusUpdate({
      email,
      decision: status,
      explanation,
      productName,
      productId,
      productDetails,
    });
    await emailHelper.sendEmail(tpl);
  }

  return report;
};

export const ReportService = {
  createReportToDB,
  deleteReportFromDB,
  getReportsFromDB,
  updateReportStatusToDB,
  reviewReportToDB,
};
