import { redirect } from "next/navigation";
import GoogleLoginButton from "@/components/google-login";
import { generateGoogleOAuthURL } from "@/lib/login-uri";
import { checkLoginStatus } from "@/components/check-login";
import { headers } from "next/headers";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const { error: errorParam } = await searchParams;
  const { isLoggedIn, error } = await checkLoginStatus();
  const headersList = await headers();
  const referer = headersList.get("referer") || "/";
  if (isLoggedIn) {
    redirect(referer);
  }

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  const oauthUrl = generateGoogleOAuthURL(
    `${backendUrl}/auth/callback/google`,
    "/"
  );
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Sign in to your account
          </h2>
        </div>
        <GoogleLoginButton
          oauthUrl={oauthUrl}
          initialError={errorParam || error || null}
        />
      </div>
    </div>
  );
}
