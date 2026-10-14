import NextAuth, { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { serverConfig } from "../../../lib/config";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: serverConfig.googleClientId,
      clientSecret: serverConfig.googleClientSecret,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  secret: serverConfig.nextAuthSecret,
};

export default NextAuth(authOptions);
