import { login } from "@/models/user.model";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "../prisma";
import { User } from "../types";
import { createNewAuditLog } from "@/models/audit-log.model";

const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        if (!credentials || !credentials.email || !credentials.password)
          return null;

        const { email, password } = credentials;

        const user = await login({ email, password });

        if (!user) return null;

        const role = await prisma.role.findUnique({
          where: { id: user.roleId },
        });

        if (!role) return null;

        // add to audit log
        await createNewAuditLog({
          actionType: "login",
          actionDetails: "User logged in",
          actionOn: "user",
          performedBy: user.id,
        });

        return {
          id: `${user.id}`,
          email: user.email,
          role: role.name,
          name: user.name,
          location: user.location,
        };
      },
    }),
  ],
  callbacks: {
    jwt: ({ token, user }) => {
      if (user) token.user = user as User;
      return token;
    },
    session: ({ session, token }) => {
      session.user = token.user;

      return session;
    },
  },
  pages: {
    signIn: "/dashboard",
    signOut: "/",
    error: "/",
  },
};

export default authOptions;
