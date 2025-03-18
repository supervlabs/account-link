"use client";

import { LogOut, LogIn, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Alert, AlertDescription } from "./ui/alert";
import { getLoginStatus } from "@/lib/fetches";

export default function AuthButton() {
  const [needToLogin, setNeedToLogin] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const status = await getLoginStatus();
        setNeedToLogin(!status?.isLoggedIn);
      } catch (err) {
        if (err instanceof Error) setError(err.message);
        else setError("check_login_failed");
        setNeedToLogin(true);
      }
    };
    checkLogin();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/";
    } catch (error) {
      console.error(error);
    }
  };
  if (needToLogin)
    return (
      <div className="flex flex-col gap-2">
        <div className="flex flex-row gap-1">
          <a
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
            href="/login"
            rel="noopener noreferrer"
          >
            {/* <KeyRound className="dark:invert" height={20} width={20} /> */}
            <LogIn className="dark:invert" height={20} width={20} />
            Login (/login)
          </a>
        </div>
        {error && (
          <Alert variant="destructive">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <AlertDescription className="mt-0">{error}</AlertDescription>
            </div>
          </Alert>
        )}
      </div>
    );
  return (
    <button
      className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
      onClick={handleLogout}
      rel="noopener noreferrer"
    >
      <LogOut className="dark:invert" height={20} width={20} />
      Logout
    </button>
  );
}
