import { JwtPayload } from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      user: JwtPayload;
    }
  }
  // extend Multer's File type to include a cloud url property
  namespace Express {
    namespace Multer {
      interface File {
        url?: string;
      }
    }
  }
}
