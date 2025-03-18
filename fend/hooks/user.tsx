"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { LoginStatus } from "@/lib/types";

// API에서 로그인 상태 가져오기
const getLoginStatus = async (): Promise<LoginStatus> => {
  console.log("getLoginStatus in hook")
  try {
    const response = await fetch("/api/auth/status", {
      // 캐시 방지를 위한 옵션
      //   cache: "no-store",
      next: { revalidate: 60 },
    });
    const data = await response.json();
    return data as LoginStatus;
  } catch (error) {
    console.error("Failed to fetch login status:", error);
    return { isLoggedIn: false };
  }
};

// Context 값의 타입 정의
interface UserContextType {
  userState: LoginStatus;
  setLoginStatus: React.Dispatch<React.SetStateAction<LoginStatus>>;
  login: (loginStatus: LoginStatus) => void;
  logout: () => void;
  refreshUserInfo: () => Promise<void>;
  isLoading: boolean;
}

// Provider Props 타입 정의
interface UserProviderProps {
  children: ReactNode;
}

// 기본값으로 사용할 초기 상태
const initialState: LoginStatus = {
  isLoggedIn: false,
};

// Context 생성 (기본값은 타입 체킹을 위한 목적)
const UserContext = createContext<UserContextType>({
  userState: initialState,
  setLoginStatus: () => {},
  login: () => {},
  logout: () => {},
  refreshUserInfo: async () => {},
  isLoading: false,
});

// Provider 컴포넌트
export function UserProvider({ children }: UserProviderProps) {
  const [userState, setLoginStatus] = useState<LoginStatus>(initialState);
  const [isLoading, setIsLoading] = useState(true);

  // 사용자 정보 가져오기 함수
  const fetchUserInfo = async () => {
    setIsLoading(true);
    try {
      const loginStatus = await getLoginStatus();
      setLoginStatus(loginStatus);
    } catch (error) {
      console.error(error);
      setLoginStatus(initialState);
    } finally {
      setIsLoading(false);
    }
  };

  // 사용자 정보 새로고침 함수
  const refreshUserInfo = async () => {
    await fetchUserInfo();
  };

  // 로그인 함수
  const login = (loginStatus: LoginStatus) => {
    setLoginStatus(loginStatus);
  };

  // 로그아웃 함수
  const logout = () => {
    setLoginStatus(initialState);

    // 서버에 로그아웃 요청
    fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    }).catch((error) => console.error(error));
  };

  useEffect(() => {
    fetchUserInfo();
    // // 1분마다 사용자 정보 재검증
    // const intervalId = setInterval(() => {
    //   fetchUserInfo();
    // }, 60000);

    // return () => {
    //   clearInterval(intervalId);
    // };
  }, []);

  const contextValue: UserContextType = {
    userState,
    setLoginStatus,
    login,
    logout,
    refreshUserInfo,
    isLoading,
  };

  return (
    <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
  );
}

// Context를 사용하기 위한 커스텀 Hook
export const useUserContext = () => useContext(UserContext);
