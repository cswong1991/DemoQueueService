import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

export default NextAuth({
    providers: [
        CredentialsProvider({
            id: 'queueService-Login',
            name: 'Credentials',
            type: "credentials",
            credentials: {
                username: { label: "Username", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials, req) {
                let loginURL = (process.env.SERVER_PRIVATE_ENDPOINT ?? "") + (process.env.NEXT_PUBLIC_ENDPOINT_LOGIN ?? "");
                try {
                    let testURL = new URL(loginURL);
                    if (!['http:', 'https:'].includes(testURL.protocol)) {
                        throw Error('Invalid URL');
                    }
                } catch {
                    console.log("Invalid URL");
                    console.log(loginURL);
                    return;
                }

                const res = await fetch(loginURL, {
                    method: 'POST',
                    body: JSON.stringify(credentials),
                    headers: { "Content-Type": "application/json" }
                })
                return (res.ok) ? await res.json() : null;
            }
        })
    ],
    callbacks: {
        async session({ session, token, user }) {
            if (token?.access_token) { session.access_token = token.access_token }
            return session
        },
        async jwt({ token, user, account, profile, isNewUser }) {
            if (user?.access_token) { token.access_token = user.access_token }
            return token
        }
    },
    theme: {
        colorScheme: "auto", // "auto" | "dark" | "light"
        brandColor: "", // Hex color code
        logo: "" // Absolute URL to image
    }
});
