"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Copy, AlertCircle } from "lucide-react";
import { toast, Toaster } from "sonner";
import JsonViewer from "@/components/json-viewer";
import { decodeUserLink } from "@/lib/jwt";
import { IUserLink } from "@/lib/types";
import { useSearchParams } from "next/navigation";
import { ApproveDialog } from "@/components/approve-dialog";

const getUserLinkToken = async (userLinkUri: string, redirectUri: string) => {
  const searchParams = new URLSearchParams();
  searchParams.append("user_link_uri", userLinkUri);
  searchParams.append("redirect_uri", redirectUri);
  const response = await fetch(`/api/user_link?${searchParams.toString()}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });
  const data = await response.json();
  if (!response.ok || !data["x-user-link-token"]) {
    throw new Error(data.error || "failed_to_get_user_link_token");
  }
  return data["x-user-link-token"] as string;
};

export default function UserLinkPage() {
  const searchParams = useSearchParams();
  const [userLinkUri, setUserLinkUri] = useState(
    `${process.env.NEXT_PUBLIC_FRONTEND_URL}/api/user_link`
  );
  const [userLinkId, setUserLinkId] = useState<string | null>(null);
  const [userLinkToken, setUserLinkToken] = useState<string | null>(null);
  const [redirectUri, setRedirectUri] = useState(`/`);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showApproveDialog, setShowApproveDialog] = useState(false);

  useEffect(() => {
    const storedValue = localStorage.getItem("user_link_uri_v2");
    if (storedValue) {
      setUserLinkUri(storedValue);
    }
  }, []);
  useEffect(() => {
    if (searchParams.get("error")) {
      setError(searchParams.get("error"));
    }
  }, [searchParams]);

  const createUserLinkToken = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getUserLinkToken(userLinkUri, redirectUri);
      const decoded = decodeUserLink<IUserLink>(token);
      setUserLinkId(decoded.link_id);
      setUserLinkToken(token);
      toast.success("x-user-link-token created successfully!");
    } catch (err) {
      console.error(err);
      const errmsg = err instanceof Error ? err.message : "unknown_error";
      setError(errmsg);
      toast.error(errmsg);
    } finally {
      setLoading(false);
    }
  };

  const requestToLink = async () => {
    setLoading(true);
    if (!userLinkToken || !userLinkId) {
      const errmsg = "user_link_token_not_provided";
      setError(errmsg);
      toast.error(errmsg);
      setLoading(false);
      return;
    }

    setShowApproveDialog(true);
    setLoading(false);
  };

  const proceedWithLinking = async () => {
    setLoading(true);
    try {
      const response = await fetch(userLinkUri, {
        method: "POST",
        headers: {
          "x-user-link-token": userLinkToken!,
        },
        mode: "cors",
      });

      const data = await response.json();
      if (!response.ok) {
        const errmsg = data.error || "user_link_fetch_failed";
        setError(errmsg);
        toast.error(errmsg);
        return;
      }

      const link = data.user_link || new URL(userLinkId!, userLinkUri);
      toast.success(`Redirecting to ${link}`);
      console.log(`Redirect to ${link}`);
      window.location.href = link;
    } catch (err) {
      const errmsg =
        err instanceof Error ? err.message : "user_link_fetch_failed";
      setError(errmsg);
      toast.error(errmsg);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setShowApproveDialog(false);
    toast.info("Account linking cancelled");
  };

  const handleApprove = () => {
    setShowApproveDialog(false);
    proceedWithLinking();
  };

  return (
    <>
      <div className="container max-w-md mx-auto py-10">
        <Card>
          <CardHeader>
            <CardTitle>User Link</CardTitle>
            <CardDescription>
              Generate a shareable link for user account link
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="redirectUri">x-user-link-token</Label>
                <Input
                  id="x-user-link-token"
                  value={userLinkToken || ""}
                  disabled
                />
              </div>
            </div>
            <div className="grid w-full items-center gap-4 mt-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="redirectUri">Redirect URI</Label>
                <Input
                  id="redirectUri"
                  placeholder="Enter redirect URI"
                  value={redirectUri}
                  onChange={(e) => setRedirectUri(e.target.value)}
                />
              </div>
            </div>

            <div className="grid w-full items-center gap-4 mt-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="redirectUri">Service Endpoint</Label>
                <Input
                  id="serviceEndpoint"
                  value={`${userLinkUri}`}
                  onChange={(e) => {
                    setUserLinkUri(e.target.value);
                    localStorage.setItem("user_link_uri_v2", e.target.value);
                  }}
                />
              </div>
            </div>

            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => {
                setError(null);
                setUserLinkToken(null);
              }}
            >
              Reset
            </Button>
            {userLinkToken ? (
              <Button onClick={requestToLink}>
                <Copy className="mr-2 h-4 w-4" /> Request To Link
              </Button>
            ) : (
              <Button onClick={createUserLinkToken} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                    Creating...
                  </>
                ) : (
                  "Create Link Token"
                )}
              </Button>
            )}
          </CardFooter>
        </Card>
        {userLinkToken && (
          <JsonViewer
            title="Decoded x-user-link-token"
            content={decodeUserLink(userLinkToken!)}
          />
        )}
      </div>
      {showApproveDialog && (
        <ApproveDialog
          title="Consent to Share Information"
          description={`You're about to link your account with ${
            new URL(userLinkUri).hostname
          }. This will share your profile information including your name, email, and user ID. Do you consent to sharing this information?`}
          onCancel={handleCancel}
          onApprove={handleApprove}
        />
      )}
      <Toaster position="top-center" richColors />
    </>
  );
}
