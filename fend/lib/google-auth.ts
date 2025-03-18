import { OAuth2Client } from "google-auth-library";

export async function verifyAccessToken(
  oauth2Client: OAuth2Client,
  accessToken: string
) {
  try {
    const tokenInfo = await oauth2Client.getTokenInfo(accessToken);
    if (tokenInfo.expiry_date && tokenInfo.expiry_date < Date.now()) {
      throw new Error("access_token_has_expired");
    }
    if (tokenInfo.aud !== process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
      throw new Error("invalid_google_client_id");
    }
    console.log("tokenInfo from access token", tokenInfo);
    const response = await fetch(
      `https://www.googleapis.com/oauth2/v3/userinfo`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    if (!response.ok) {
      throw new Error("failed_to_fetch_user_info");
    }
    const userInfo = await response.json();
    return {
      iss: userInfo.iss || "https://accounts.google.com",
      sub: userInfo.sub,
      email: userInfo.email,
      name: userInfo.name,
    } as {
      iss: string;
      sub: string;
      name: string;
      email: string;
      // given_name: string;
      // family_name: string;
      // picture: string;
      // email_verified: boolean;
    };
  } catch (error) {
    console.error(error);
    throw new Error("error_verifying_access_token");
  }
}
