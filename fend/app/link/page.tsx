"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
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
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { getLoginStatus } from "@/lib/fetches";
import { generateGoogleOAuthURL } from "@/lib/login-uri";
import { usePathname } from "next/navigation";

export default function UserLinkPage() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [localUser, setLocalUser] = useState(null);
  const [providedUserData, setProvidedUserData] = useState<{
    id?: number;
    email: string;
    name: string;
  } | null>(null);
  const [remoteUser, setRemoteUser] = useState(null);
  const [progress, setProgress] = useState(0);

  // Get state_uri and direct_uri from query parameters
  const stateUri = searchParams.get("state_uri");
  const redirectUri = searchParams.get("redirect_uri");
  useEffect(() => {
    async function fetchData() {
      if (!stateUri) {
        setError("no_state_uri_provided");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        // Fetch data using state_uri
        let response = await fetch(stateUri);
        if (!response.ok) {
          throw new Error("failed_to_get_user_state");
        }
        const remoteUserData = await response.json();
        setRemoteUser(remoteUserData);

        const loginStatus = await getLoginStatus();
        if (!loginStatus.isLoggedIn) {
          setIsLoading(false);
          const REDIRECT_URI = `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/callback/google`;
          console.log(REDIRECT_URI);
          console.log(`window.location.href`, window.location.href);
          window.location.href = generateGoogleOAuthURL(
            REDIRECT_URI,
            window.location.href
          );
        }
        if (!loginStatus.user) {
          setError("no_user_info_in_login_status");
          setIsLoading(false);
          return;
        }

        // Progress animation
        const interval = setInterval(() => {
          setProgress((prev) => {
            if (prev >= 90) {
              clearInterval(interval);
              return 90;
            }
            return prev + 10;
          });
        }, 200);

        console.log(`PUT user ${process.env.NEXT_PUBLIC_BACKEND_URL}`);
        // update my user data
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
                  domain: new URL(stateUri).hostname,
                  user: remoteUserData,
                },
              ],
            }),
          }
        );
        if (!userUpdateResp.ok) {
          throw new Error("user_update_failed");
        }
        const userInfo = await userUpdateResp.json();
        const providingUserData = {
          id: loginStatus.user.id,
          email: loginStatus.user.email,
          name: loginStatus.user.name,
        };
        response = await fetch(stateUri, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(providingUserData),
        });
        if (!response.ok) {
          throw new Error("failed_to_push_user_state");
        }
        setProvidedUserData(providingUserData);

        setLocalUser(userInfo);
        setProgress(100);
        clearInterval(interval);

        // // If direct_uri exists, redirect after fetching data
        // if (redirectUri) {
        //   // Short delay before redirect
        //   setTimeout(() => {
        //     window.location.href = redirectUri;
        //   }, 10000); // Redirect after 2 seconds
        // }
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError(`${err}`);
        }
        setProgress(100);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [pathname, stateUri, redirectUri]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">User Link Process</CardTitle>
          <CardDescription>
            {isLoading
              ? "Loading data..."
              : error
              ? "An error occurred"
              : "Redirect ready"}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Progress indicator */}
          <Progress value={progress} className="w-full" />

          {/* URI information */}
          <div className="bg-gray-100 p-3 rounded-md text-sm font-mono break-all">
            <div className="mb-1">
              <span className="font-semibold">State URI:</span>{" "}
              {stateUri || "None"}
            </div>
            <div>
              <span className="font-semibold">Direct URI:</span>{" "}
              {redirectUri || "None"}
            </div>
          </div>

          {/* Loading state */}
          {isLoading && (
            <div className="text-center py-4">
              <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
              <p className="text-gray-600">Loading data. Please wait...</p>
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
          {/* Data display area */}
          {remoteUser && (
            <div className="mt-4">
              <h3 className="font-medium mb-2">
                Received remote data (from{" "}
                {`${process.env.NEXT_PUBLIC_SITE_DOMAIN}`})
              </h3>
              <div className="bg-gray-100 p-3 rounded-md overflow-auto max-h-60">
                <pre className="text-xs">
                  {JSON.stringify(remoteUser, null, 2)}
                </pre>
              </div>
            </div>
          )}
          {providedUserData && (
            <div className="mt-4">
              <h3 className="font-medium mb-2">
                Provided local data (to{" "}
                {`${stateUri ? new URL(stateUri).origin : "?"}`})
              </h3>
              <div className="bg-gray-100 p-3 rounded-md overflow-auto max-h-60">
                <pre className="text-xs">
                  {JSON.stringify(providedUserData, null, 2)}
                </pre>
              </div>
            </div>
          )}
          {localUser && (
            <div className="mt-4">
              <h3 className="font-medium mb-2">
                User Data in the domain (
                {`${process.env.NEXT_PUBLIC_SITE_DOMAIN}`})
              </h3>
              <div className="bg-gray-100 p-3 rounded-md overflow-auto max-h-60">
                <pre className="text-xs">
                  {JSON.stringify(localUser, null, 2)}
                </pre>
              </div>
            </div>
          )}
          {/* Success state */}
          {!isLoading && !error && (
            <Alert variant="default" className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>
                {redirectUri
                  ? `Redirecting to ${redirectUri} shortly.`
                  : "Data successfully loaded."}
              </AlertDescription>
            </Alert>
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

          {!isLoading && !error && redirectUri && (
            <Button
              className="gap-2"
              onClick={() => (window.location.href = redirectUri)}
            >
              Go now <ExternalLink className="h-4 w-4" />
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
