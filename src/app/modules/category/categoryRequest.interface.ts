export type ICategoryRequest = {
  requesterId: string;
  name: string;
  description?: string;
  status?: 'pending' | 'approved' | 'rejected';
  adminComment?: string;
  createdAt?: Date;
};
