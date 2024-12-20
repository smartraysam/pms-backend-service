import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  ChangePasswordProps,
  LoginProps,
  ResetPasswordProps,
  Role,
} from "../lib/types";
import crypto from "crypto";
import { Prisma, PrismaClient, TokenTypes } from "@prisma/client";
import { NewAdminData } from "@/lib/types/post.types";
import { ROLES } from "@/lib/constants/auth.const";
import prisma from "@/lib/prisma";

export const registerAdmin = async (data: NewAdminData) => {
  const passwordSaltFactor = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(
    data.password,
    passwordSaltFactor
  );
  const prevUser = await prisma.user.findFirst({
    where: {
      OR: [{ email: data.email }, { phone_number: data.phone_number }],
    },
  });

  if (prevUser)
    throw new Error(
      "Oops! a user with this email address or phone number already exists"
    );

  data.password = hashedPassword;
  if (data.role === "admin") {
    data.role = { connect: { name: ROLES.SUPER_MANAGER } };
    delete data.adminId;
  } else if (data.role === "manager") {
    data.role = { connect: { name: ROLES.OPERATIONAL_MANAGER } };
    data.managerId = data.adminId ? parseInt(data.adminId) : undefined;
  } else if (data.role === "operator") {
    data.role = { connect: { name: ROLES.LOCATION_MANAGER } };
    data.managerId = data.adminId ? parseInt(data.adminId) : undefined;
  }
  const user = await prisma.user.create({
    data: {
      ...data,
    },
  });
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

export const login = async ({ email, password }: LoginProps) => {
  const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";
  const user = await prisma.user.findUnique({
    where: { email }
  });
  if (!user) return null;

  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) return null;

const token = jwt.sign(
  { userId: user.id, email: user.email },
  JWT_SECRET,
  { expiresIn: "1h" } // Token expiration time, e.g., 1 hour
);
const { password: userPassword, ...userWithoutPassword } = user;
return { user: userWithoutPassword, token , expiresIn: 3600};
};

export const getUsers = async () => {
  return await prisma.user.findMany();
};
export const getUser = async (id: string | number) => {
  return await prisma.user.findUnique({ where: { id: Number(id) } });
};

export const getUsersCount = async () => {
  return await prisma.vehicle.count({});
};

export const getUsersRole = async (role?: Role) => {
  return await prisma.user.findMany({
    where: { role: { name: role } },
  });
};

export const getOperationalManagersUnderLocationManagers = async (
  locationManagerId: string
) => {
  return await prisma.user.findMany({
    where: {
      role: { name: ROLES.OPERATIONAL_MANAGER },
      managerId: parseInt(locationManagerId),
    },
  });
};

export const deleteAccount = async (id: number) => {
  const user = await prisma.user.delete({ where: { id } });

  if (!user) throw new Error("Oops! Operational Manager does not exist");
};
export const updateUserData = async (
  id: number,
  data: Partial<Prisma.UserUpdateInput>
) => {
  if (data.email) {
    if (
      await prisma.user.findFirst({
        where: {
          email: <string>data.email,
          NOT: { id },
        },
      })
    ) {
      throw new Error(
        "Oops! another user with this email address already exists"
      );
    }
  }

  if (data.phone_number) {
    if (
      await prisma.user.findFirst({
        where: {
          phone_number: <string>data.phone_number,
          NOT: { id },
        },
      })
    ) {
      throw new Error(
        "Oops! another user with this phone number already exists"
      );
    }
  }

  const user = await prisma.user.update({ where: { id }, data });

  if (!user) throw new Error("Oops! Operational Manager does not exist");

  return user;
};



const upsertToken = async (upsertTokenDto: Prisma.TokenCreateInput) => {
  const token = await prisma.token.findFirst({
    where: {
      email: upsertTokenDto.email,
      type: upsertTokenDto.type,
    },
  });

  if (!token) {
    return await prisma.token.create({ data: upsertTokenDto });
  } else {
    await prisma.token.update({
      where: { id: token.id },
      data: { value: token.value },
    });
  }
};

export const forgotPassword = async (email: string) => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user)
    throw new Error("Oops! a user with this email account does not exist");

  const token = crypto.randomUUID().split("-").join("");

  await upsertToken({
    email,
    value: token,
    type: TokenTypes.passwordResetToken,
  });

  /** SEND TO EMAIL */
  console.log(token);
  return token;
};

export const resetPassword = async ({
  token,
  password,
}: ResetPasswordProps) => {
  const dbToken = await prisma.token.findFirst({
    where: { value: token, type: TokenTypes.passwordResetToken },
  });

  if (!dbToken) {
    throw new Error("This token is invalid or has expired");
  }

  const passwordSaltFactor = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(password, passwordSaltFactor);

  await prisma.user.update({
    where: {
      email: dbToken.email,
    },
    data: {
      password: hashedPassword,
    },
  });

  await prisma.token.delete({ where: { id: dbToken.id } });
};

export const changePassword = async (
  userId: string,
  props: ChangePasswordProps
) => {
  const user = await prisma.user.findUnique({
    where: {
      id: parseInt(userId),
    },
  });

  if (!user) throw new Error("User does not exist");

  const isValidPassword = await bcrypt.compare(
    props.currentPassword,
    user.password
  );

  if (!isValidPassword) throw new Error("Current password is incorrect");

  const passwordSaltFactor = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(
    props.newPassword,
    passwordSaltFactor
  );

  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      password: hashedPassword,
    },
  });
};
