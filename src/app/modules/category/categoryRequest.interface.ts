export type ICategoryRequest = {
  requesterId: string;
  name: string;
  icon?: string;
  image?: string;
  description?: string;
  status?: 'pending' | 'approved' | 'rejected';
  createdAt?: Date;
};
