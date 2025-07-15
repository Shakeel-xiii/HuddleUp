import React from "react";

const AuthContext = React.createContext();

export const AuthProvider = ({ children }) => {
  const [loggedInUser, setLoggedInUser] = React.useState(null);
  const [userRole, setUserRole] = React.useState(null);

  return (
    <AuthContext.Provider value={{ loggedInUser, setLoggedInUser, userRole, setUserRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => React.useContext(AuthContext);

export default AuthContext;
