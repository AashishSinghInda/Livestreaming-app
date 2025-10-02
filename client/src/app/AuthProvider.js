"use client"

import { isTokenExpired } from "../../utils/checkTokenExpiry";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import instance from "../../utils/axiosInstance";



export default function AuthProvider({children}) {

  const router = useRouter()

  useEffect(() => {
    const checkTokens = async () => {
      const accessToken = localStorage.getItem("accessToken");
      const refreshToken = localStorage.getItem("refreshToken");

   
      if (!accessToken || !refreshToken) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
       // router.push('/login')
        return;
      }

     

 
      if ( isTokenExpired(accessToken)   &&   !isTokenExpired(refreshToken)) {
        try {
          const res = await instance.post("/auth/refresh-token", {
            refreshToken,
          })

          const newAccessToken = res.data.accessToken;
        
          localStorage.setItem("accessToken", newAccessToken);
        } catch (err) {
          console.log("Refresh token expired:", err);
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          router.push("/login");
        }
      }

     
      if ( isTokenExpired(refreshToken)) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        router.push("/login");
      }
    };

    checkTokens();
  }, [router]);  


  return <>{children}</>;
 
}