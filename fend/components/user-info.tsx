"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { getLoginStatus } from "@/lib/fetches";

export default function UserInfoCard() {
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    async function fetchUserData() {
      try {
        setIsLoading(true);
        const loginStatus = await getLoginStatus();
        if (!loginStatus.isLoggedIn || !loginStatus.user?.id) {
          setIsLoading(false);
          return;
        }
        console.log(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/users/${loginStatus.user.id}`
        );
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/users/${loginStatus.user.id}`,
          {
            credentials: "include",
          }
        );

        if (!response.ok) {
          const body = await response.json();
          throw new Error(body.error || "user_info_fetch_failed");
        }
        const data = await response.json();
        setUserData(data);
      } catch {
      } finally {
        setIsLoading(false);
      }
    }
    fetchUserData();
  }, []);

  if (isLoading && !userData) return null;
  return (
    <>
      {userData && (
        <Card className="w-full max-w-xl shadow-md">
          <CardHeader>
            <CardTitle>User Info</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-100 p-3 rounded-md overflow-auto max-h-60 dark:bg-gray-800">
              <pre className="text-xs">{JSON.stringify(userData, null, 2)}</pre>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
