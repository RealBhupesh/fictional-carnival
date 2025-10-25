import { prisma } from "@/lib/db/prisma";
import { credentialSchema } from "@/lib/utils/validators";
import { Role } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { ZodError } from "zod";

const signAccessToken = (payload: { id: string; role: Role }) => {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error("NEXTAUTH_SECRET is not configured");
  }
  return jwt.sign(payload, secret, { expiresIn: "7d" });
};

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: "/login"
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          const { email, password } = credentialSchema.parse(credentials);
          const user = await prisma.user.findUnique({ where: { email } });
          if (!user) {
            return null;
          }
          const isValid = await bcrypt.compare(password, user.password);
          if (!isValid) {
            return null;
          }
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            image: user.image ?? undefined
          };
        } catch (error) {
          if (error instanceof ZodError) {
            console.error("Invalid credentials", error.flatten());
            return null;
          }
          console.error("Authorize error", error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role: Role }).role;
        token.accessToken = signAccessToken({ id: token.id as string, role: token.role as Role });
      } else if (!token.accessToken && token.id && token.role) {
        token.accessToken = signAccessToken({ id: token.id as string, role: token.role as Role });
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
      }
      session.accessToken = token.accessToken as string;
      return session;
    }
  }
};
