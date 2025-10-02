import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const instance = axios.create({
    baseURL : BASE_URL,
    withCredentials : true,
})

instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;


      try {
         const refreshToken = localStorage.getItem("refreshToken");
                 if (!refreshToken) throw new Error("No refresh token");

        const res = await axios.post(`${BASE_URL}/auth/refresh-token`, { refreshToken });
             const newAccessToken = res.data.accessToken;
             localStorage.setItem("accessToken", newAccessToken);
             originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
       return instance(originalRequest);
      } catch (err) {
        console.log("Refresh token expired ya invalid hai:", err);
          localStorage.removeItem("accessToken");
             localStorage.removeItem("refreshToken");
            window.location.href = "/login";
            return Promise.reject(err);
            }   
    }
 
    return Promise.reject(error);
  }
);

export default instance;