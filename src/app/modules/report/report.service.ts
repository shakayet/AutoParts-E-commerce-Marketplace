/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-undef */
import { Report } from './report.model';
import { Notification } from '../notification/notification.model';
import StorageService from '../../services/storage.service';

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

const getReportsFromDB = async (query: any = {}) => {
  const q: any = {};
  if (query.type) q.type = query.type;
  if (query.targetId) q.targetId = query.targetId;
  const reports = await Report.find(q).sort({ createdAt: -1 }).limit(500);
  return reports;
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

export const ReportService = {
  createReportToDB,
  deleteReportFromDB,
  getReportsFromDB,
  updateReportStatusToDB,
};
