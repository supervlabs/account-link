import { IUser, LoginStatus } from "./types";

export const getLoginStatus = async () => {
  try {
    const response = await fetch("/api/auth/status");
    const data = await response.json();
    return data as LoginStatus;
  } catch (error) {
    console.error(error);
    return { isLoggedIn: false } as LoginStatus;
  }
};

export const setLink = async (userLinkUri: string, redirectUri: string) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/create_link`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        user_link_uri: userLinkUri,
        redirect_uri: redirectUri,
      }),
    }
  );
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "failed_to_create_link");
  }
  return data as {
    user_link: string;
  };
};

export const getUser = async (id: number) => {
  try {
    const response = await fetch(`/users/${id}`, {
      method: "GET",
      credentials: "include",
    });
    const data = await response.json();
    return data as IUser;
  } catch (error) {
    console.error(error);
    return null;
  }
};
