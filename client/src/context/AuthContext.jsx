import { createContext, useState } from "react";

/* eslint-disable react-refresh/only-export-components */
export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("userInfo");

    return storedUser ? JSON.parse(storedUser) : null;
  });

  // Login
  const login = (data) => {
    localStorage.setItem("userInfo", JSON.stringify(data));

    setUser(data);
  };

  // Logout
  const logout = () => {
    localStorage.removeItem("userInfo");

    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
