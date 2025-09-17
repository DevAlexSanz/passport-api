import { Request } from 'express';
import { Role } from '../Role';
import type { File as MulterFile } from 'multer';

declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      id: string;
      role?: Role;
      email?: string;
      pharmacyId?: string;
    };

    file?: MulterFile;
    files?: MulterFile[] | { [fieldname: string]: MulterFile[] };
  }
}

declare global {
  namespace Express {
    namespace Multer {
      interface File extends MulterFile {}
    }
  }
}
