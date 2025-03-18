import { Repository } from "typeorm";
import { appDataSource } from "../data-source";
import { User } from "../entities/User";

import { Credentials, OAuth2Client, TokenPayload } from "google-auth-library";
import { createSessionToken } from "../utils/jwt";
// import { storeRefreshToken } from "../utils/redis";
// import { google } from "googleapis";

export class GoogleAuthService {
  oauth2Client: OAuth2Client;
  private userRepository: Repository<User>;

  constructor(
    public clientId: string,
    private clientSecret: string,
    redirectUri: string
  ) {
    this.userRepository = appDataSource.getRepository(User);
    this.oauth2Client = new OAuth2Client(
      this.clientId,
      this.clientSecret,
      redirectUri
    );
  }

  private async fetchUserInfo(credentials: Credentials) {
    this.oauth2Client.setCredentials(credentials);
    const userInfoResponse = await this.oauth2Client.request<TokenPayload>({
      url: "https://www.googleapis.com/oauth2/v3/userinfo",
    });
    if (userInfoResponse.status !== 200) {
      throw new Error("user_info_retrieval_failed");
    }
    return userInfoResponse?.data;
  }

  // async verifyAccessToken(accessToken: string): Promise<any> {
  //   try {
  //     this.oauth2Client.setCredentials({
  //       access_token: accessToken,
  //     });
  //     const oauth2 = google.oauth2({
  //       version: "v2",
  //       auth: this.oauth2Client,
  //     });
  //     const tokenInfo = await oauth2.userinfo.get();
  //     return {
  //       sub: tokenInfo.data.id,
  //       email: tokenInfo.data.email,
  //       name: tokenInfo.data.name,
  //       verified_email: tokenInfo.data.verified_email,
  //     };
  //   } catch (error) {
  //     console.error(error);
  //     throw new Error("failed_to_verify_access_token");
  //   }
  // }

  async handleCallback<Credentials>(params: { code: string }) {
    const { code } = params;
    const { tokens } = await this.oauth2Client.getToken(code);
    if (!tokens.id_token) {
      throw new Error("invalid_id_token");
    }
    const ticket = await this.oauth2Client.verifyIdToken({
      idToken: tokens.id_token,
      audience: this.clientId,
    });
    const idTokenPayload = ticket.getPayload();
    if (!idTokenPayload) {
      throw new Error("invalid_id_token_payload");
    }
    const userInfo = await this.fetchUserInfo(tokens);

    if (!idTokenPayload.iss || !idTokenPayload.sub) {
      throw new Error("invalid_user_info");
    }
    console.log(`idTokenPayload`, idTokenPayload);
    console.log(`userInfo`, userInfo);
    let sign_up = false;
    let user = await this.userRepository.findOne({
      where: {
        iss: idTokenPayload.iss,
        sub: idTokenPayload.sub,
      },
    });
    if (!user) {
      sign_up = true;
      user = await this.userRepository.save(
        this.userRepository.create({
          iss: idTokenPayload.iss,
          sub: idTokenPayload.sub,
          name: userInfo.name,
          email: userInfo.email,
        })
      );
    }
    if (!user) {
      throw new Error("user_not_found");
    }

    // if (tokens.refresh_token && tokens.expiry_date) {
    //   const expiresIn = Math.floor((tokens.expiry_date - Date.now()) / 1000);
    //   storeRefreshToken(idTokenPayload.sub, tokens.refresh_token, expiresIn);
    // }

    const sessionToken = createSessionToken({
      iss: idTokenPayload.iss,
      sub: idTokenPayload.sub,
      id: user.id,
      email: user.email,
      name: user.name,
    });

    return {
      user,
      sessionToken,
      credentials: tokens,
      sign_up,
    };
  }
}
