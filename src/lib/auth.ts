import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      allowDangerousEmailAccountLinking: true,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID ?? "",
      clientSecret: process.env.GITHUB_SECRET ?? "",
      allowDangerousEmailAccountLinking: true,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          throw new Error("Invalid email or password");
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isValid) {
          throw new Error("Invalid email or password");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
          timezone: user.timezone,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.timezone = user.timezone;
      }

      // Handle session update (e.g., profile changes)
      if (trigger === "update" && session) {
        if (session.name) token.name = session.name;
        if (session.timezone) token.timezone = session.timezone;
        if (session.image) token.picture = session.image;
      }

      // For OAuth users, fetch role from DB if not set
      if (token.id && !token.role) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id },
          select: { role: true, timezone: true },
        });
        if (dbUser) {
          token.role = dbUser.role;
          token.timezone = dbUser.timezone;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.timezone = token.timezone;
      }
      return session;
    },
  },
};

// RBAC helper functions
export function hasRole(userRole: Role, requiredRole: Role): boolean {
  const roleHierarchy: Record<Role, number> = {
    OWNER: 4,
    ADMIN: 3,
    MEMBER: 2,
    VIEWER: 1,
  };
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}

export function canManageMembers(role: Role): boolean {
  return hasRole(role, "ADMIN");
}

export function canEditContent(role: Role): boolean {
  return hasRole(role, "MEMBER");
}

export function canViewContent(role: Role): boolean {
  return hasRole(role, "VIEWER");
}
