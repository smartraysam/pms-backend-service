import NextAuth from "next-auth";
import { JWT } from "next-auth/jwt";
import { ITokens, Role, User } from ".";

declare module "next-auth" {
  interface Session {
    user: User;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    user: User;
  }
}

declare module "next/server" {
  interface NextRequest {
    user: User;
  }
}
