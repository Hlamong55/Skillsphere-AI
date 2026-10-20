
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5001/api",
});

// Automatically attach login token
api.interceptors.request.use(
  (config) => {
    const storedUser = localStorage.getItem("userInfo");

    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);

        if (user.token) {
          config.headers.Authorization = `Bearer ${user.token}`;
        }
      } catch (error) {
        console.error("Invalid stored user data", error);
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
