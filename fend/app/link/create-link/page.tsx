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
import { Loader2, Copy, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { setLink } from "@/lib/fetches";

export default function CreateLinkPage() {
  const [userLinkUri, setUserLinkUri] = useState(
    `${process.env.NEXT_PUBLIC_FRONTEND_URL}/api/user_link`
  );
  const [redirectUri, setRedirectUri] = useState(`/`);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    user_link?: string;
    error?: string;
  } | null>(null);

  useEffect(() => {
    const storedValue = localStorage.getItem("user_link_uri");
    if (storedValue) {
      setUserLinkUri(storedValue);
    }
  }, []);

  const createLink = async () => {
    setLoading(true);
    setResult(null);
    try {
      setResult(await setLink(userLinkUri, redirectUri));
      toast.success("Link created successfully!");
    } catch (error) {
      console.error(error);
      const errmsg = error instanceof Error ? error.message : "unknown_error";
      setResult({
        error: errmsg,
      });
      toast.error(errmsg);
    } finally {
      setLoading(false);
    }
  };

  // const copyToClipboard = () => {
  //   if (result?.user_link) {
  //     navigator.clipboard.writeText(result.user_link);
  //     toast.success("Link copied to clipboard");
  //   }
  // };

  const goToLink = () => {
    if (result?.user_link) {
      toast.success("Go to Link");
      window.location.href = result.user_link;
    }
  };

  return (
    <>
      <div className="container max-w-md mx-auto py-10">
        <Card>
          <CardHeader>
            <CardTitle>Create Account Link URL</CardTitle>
            <CardDescription>
              Generate a shareable link for account link
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="redirectUri">User Link URI</Label>
                <Input
                  id="userLinkUri"
                  placeholder="Enter redirect URI"
                  value={userLinkUri}
                  onChange={(e) => {
                    setUserLinkUri(e.target.value);
                    localStorage.setItem("user_link_uri", e.target.value);
                  }}
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

            {result?.error && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{result.error}</AlertDescription>
              </Alert>
            )}

            {result?.user_link && (
              <Alert className="mt-4 bg-green-50 text-green-800 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-800" />
                <AlertTitle>Success</AlertTitle>
                <AlertDescription>
                  <div className="mt-2">
                    <p className="font-medium">Your link:</p>
                    <p className="mt-1 break-all font-mono text-sm bg-green-100 p-2 rounded">
                      {result.user_link}
                    </p>
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => setResult(null)}>
              Reset
            </Button>
            {result?.user_link ? (
              <Button onClick={goToLink}>
                <Copy className="mr-2 h-4 w-4" /> Go To Link
              </Button>
            ) : (
              <Button onClick={createLink} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                    Creating...
                  </>
                ) : (
                  "Create Link"
                )}
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </>
  );
}
