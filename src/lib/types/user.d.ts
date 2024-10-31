import { Request } from "express";

import { User } from "../lib/types";

declare module "express" {
  export interface Request {
    user?: User;
  }
}
