// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import AzureAD from "next-auth/providers/azure-ad";

export const { handlers, auth } = NextAuth({
  providers: [
    AzureAD({
      clientId: process.env.AZURE_AD_CLIENT_ID, // Get from company Azure portal
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET,
      tenantId: process.env.AZURE_AD_TENANT_ID,
    }),
  ],
  // Store sessions in Supabase (free)
  adapter: PrismaAdapter(prisma),
});
