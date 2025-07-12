import { Status } from './Status';

export type Pharmacy = {
  id: string;
  name: string;
  description: string;
  profilePhoto: string;
  coverPhoto: string;
  address: string;
  phone: string;
  email: string;
  status: Status;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type CreatePharmacy = Omit<
  Pharmacy,
  'id' | 'status' | 'createdAt' | 'updatedAt'
>;
