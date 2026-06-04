import type { NextAuthConfig } from "next-auth";

const adminEmails = (process.env.ADMIN_EMAILS || "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export const authConfig = {
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const path = nextUrl.pathname;
      const isProtected =
        path.startsWith("/dashboard") ||
        path.startsWith("/onboarding") ||
        path.startsWith("/admin");
      const isAuthPage =
        path.startsWith("/login") || path.startsWith("/register");
      if (isProtected && !isLoggedIn) return false;
      if (isAuthPage && isLoggedIn)
        return Response.redirect(new URL("/dashboard", nextUrl));
      return true;
    },
    jwt({ token, user }) {
      if (user?.email) {
        token.email = user.email;
        token.isAdmin = adminEmails.includes(user.email.toLowerCase());
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string;
        (session.user as any).isAdmin = Boolean(token.isAdmin);
      }
      return session;
    },
  },
} satisfies NextAuthConfig;