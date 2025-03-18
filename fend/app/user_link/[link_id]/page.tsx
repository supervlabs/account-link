"use client";

import { use, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getLoginStatus } from "@/lib/fetches";
import { generateGoogleOAuthURL } from "@/lib/login-uri";
import { IUserLink, LoginStatus } from "@/lib/types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  Loader2,
  LogIn,
} from "lucide-react";

export default function UserLinkApprovedPage({
  params,
}: {
  params: Promise<{ link_id: string }>;
}) {
  const resolvedParams = use(params);
  const { link_id } = resolvedParams;
  const router = useRouter();
  const [userLinkData, setUserLinkData] = useState<IUserLink | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState<LoginStatus["user"] | null>(null);
  const [linkUpdated, setLinkUpdated] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // 사용자 링크 데이터 불러오기
  const fetchUserLinkData = useCallback(async () => {
    try {
      const resp = await fetch(`/api/user_link/${link_id}`);
      if (!resp.ok) {
        throw new Error("user_link_fetch_failed");
      }
      const data = (await resp.json()) as IUserLink;
      console.log("User link data:", data);
      return data;
    } catch (err) {
      console.error(err);
      return null;
    }
  }, [link_id]);

  // 로그인 상태 확인
  const checkLoginStatus = useCallback(async () => {
    try {
      const loginStatus = await getLoginStatus();
      return loginStatus;
    } catch (err) {
      console.error("Failed to check login status:", err);
      return { isLoggedIn: false, user: null };
    }
  }, []);

  // 사용자 연결 업데이트
  const updateUserLink = useCallback(
    async (data: IUserLink, currentUser: LoginStatus["user"]) => {
      try {
        if (!currentUser) {
          throw new Error("no_user_data");
        }

        const userUpdateResp = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/users`,
          {
            method: "PUT",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              linked_users: [
                {
                  domain: data.initiator,
                  user: data.user,
                },
              ],
            }),
          }
        );

        if (!userUpdateResp.ok) {
          throw new Error("user_update_failed");
        }
        // const userLink = {
        //   link_id: link_id, // `${decoded.iss}:$${decoded.sub}`,
        //   initiator: new URL(process.env.NEXT_PUBLIC_FRONTEND_URL!).hostname,
        //   destination: data.initiator,
        //   redirect_uri: "",
        //   user: {
        //     id: currentUser.id,
        //     name: currentUser.name,
        //     email: currentUser.email,
        //   },
        // } as IUserLink;
        // const replyUserLink = await fetch(`/api/user_link/${link_id}`, {
        //   method: "POST",
        //   body: JSON.stringify(userLink),
        // });
        // if (!replyUserLink.ok) {
        //   throw new Error("user_link_fetch_failed");
        // }

        return true;
      } catch (err) {
        console.error("Failed to update user link:", err);
        return false;
      }
    },
    []
  );

  // 로그인 처리
  const handleLogin = useCallback(() => {
    if (!userLinkData) return;

    const loginUrl = generateGoogleOAuthURL(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/callback/google`,
      window.location.href
    );
    router.push(loginUrl);
  }, [userLinkData, router]);

  // 리다이렉트 처리
  const handleRedirect = useCallback(async () => {
    if (!userLinkData || !userData) return;

    // 아직 사용자 연결이 업데이트되지 않았다면 업데이트
    if (!linkUpdated) {
      const updated = await updateUserLink(userLinkData, userData);
      if (updated) {
        setLinkUpdated(true);
      } else {
        setError("Failed to update user link");
        return;
      }
    }

    // 리다이렉트
    router.push(userLinkData.redirect_uri);
  }, [userLinkData, userData, linkUpdated, updateUserLink, router]);

  // 초기화 단 한번만 실행
  useEffect(() => {
    if (isInitialized) return;

    const initialize = async () => {
      setIsLoading(true);
      setError(null);

      // 사용자 링크 데이터 가져오기
      const data = await fetchUserLinkData();
      if (!data) {
        setError("user_link_data_not_found");
        setIsLoading(false);
        setIsInitialized(true);
        return;
      }

      setUserLinkData(data);

      // 로그인 상태 확인
      const loginStatus = await checkLoginStatus();
      setIsLoggedIn(loginStatus.isLoggedIn);

      if (loginStatus.isLoggedIn && loginStatus.user) {
        setUserData(loginStatus.user);

        // 이미 로그인되어 있으면 링크 업데이트 시도
        const updated = await updateUserLink(data, loginStatus.user);
        setLinkUpdated(updated);
      }

      setIsLoading(false);
      setIsInitialized(true);
    };

    initialize();
  }, [isInitialized, fetchUserLinkData, checkLoginStatus, updateUserLink]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">User Link Approved</CardTitle>
          <CardDescription>
            {isLoading
              ? "Loading data..."
              : error
              ? "An error occurred"
              : linkUpdated
              ? "Account successfully linked"
              : "Ready to link accounts"}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Loading state */}
          {isLoading && (
            <div className="text-center py-4">
              <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
              <p className="text-gray-600">
                Loading user link data. Please wait...
              </p>
            </div>
          )}

          {/* Error state */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* User Link Data */}
          {!isLoading && !error && userLinkData && (
            <>
              <Alert variant="default" className="bg-blue-50 border-blue-200">
                <CheckCircle2 className="h-4 w-4 text-blue-600" />
                <AlertTitle>Link Request From</AlertTitle>
                <AlertDescription>
                  <span className="font-semibold">
                    {userLinkData.initiator}
                  </span>{" "}
                  wants to link with your account.
                </AlertDescription>
              </Alert>

              {/* Remote User Data */}
              <div className="mt-4">
                <h3 className="font-medium mb-2">
                  User Data from {userLinkData.initiator}
                </h3>
                <div className="bg-gray-100 p-3 rounded-md overflow-auto max-h-60">
                  <pre className="text-xs">
                    {JSON.stringify(userLinkData, null, 2)}
                  </pre>
                </div>
              </div>

              {/* Local User Data if logged in */}
              {isLoggedIn && userData && (
                <div className="mt-4">
                  <h3 className="font-medium mb-2">
                    Your Account on {process.env.NEXT_PUBLIC_SITE_DOMAIN}
                  </h3>
                  <div className="bg-gray-100 p-3 rounded-md overflow-auto max-h-60">
                    <pre className="text-xs">
                      {JSON.stringify(userData, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              {/* Link Status */}
              {linkUpdated && (
                <Alert
                  variant="default"
                  className="bg-green-50 border-green-200"
                >
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertTitle>Accounts Linked</AlertTitle>
                  <AlertDescription>
                    Your account has been successfully linked with{" "}
                    {userLinkData.initiator}.
                  </AlertDescription>
                </Alert>
              )}
            </>
          )}
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => window.history.back()}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>

          {!isLoading &&
            !error &&
            userLinkData &&
            (isLoggedIn ? (
              <Button className="gap-2" onClick={handleRedirect}>
                {linkUpdated
                  ? "go to " + userLinkData.redirect_uri
                  : "Link and Continue"}
                <ExternalLink className="h-4 w-4" />
              </Button>
            ) : (
              <Button className="gap-2" onClick={handleLogin}>
                Login to Continue
                <LogIn className="h-4 w-4" />
              </Button>
            ))}
        </CardFooter>
      </Card>
    </div>
  );
}
