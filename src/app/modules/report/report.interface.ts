export type IReport = {
  reporterId: string;
  type: 'product' | 'seller';
  targetId: string; // productId or seller userId
  reason: string;
  status: 'pending' | 'reviewed' | 'dismissed';
  image: string;
  createdAt?: Date;
};

export type ReportModel = object;
