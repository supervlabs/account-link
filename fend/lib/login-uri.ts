export function generateGoogleOAuthURL(
  redirect_uri: string,
  return_uri?: string
) {
  const params = new URLSearchParams({
    client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
    redirect_uri,
    response_type: "code",
    scope: [
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile",
    ].join(" "),
    access_type: "offline",
    prompt: "consent",
  });
  if (return_uri) {
    if (!return_uri.startsWith("http")) {
      return_uri = new URL(return_uri, `${process.env.NEXT_PUBLIC_FRONTEND_URL}`).toString();
    }
    const state = encodeURIComponent(
      JSON.stringify({
        return_uri,
      })
    );
    
    params.append("state", state);
  }
  return `https://accounts.google.com/o/oauth2/auth?${params.toString()}`;
}
