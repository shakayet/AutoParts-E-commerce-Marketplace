export type ICategoryRequest = {
  requesterId: string;
  name: string;
  description?: string;
  status?: 'pending' | 'approved' | 'rejected';
  createdAt?: Date;
};
