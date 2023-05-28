import { createContext, useState, useEffect, useContext } from "react";
import { useLocation } from 'react-router-dom';
import { register, login, checkPermission } from 'api/auth';
import * as jwt from 'jsonwebtoken'


const defaultAuthContext = {
  isAuthenticated: false,
  currentMember: null,
  register:null,
  login:null,
  logout:null,
}

const AuthContext = createContext(defaultAuthContext);
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({children}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [payload, setPayload] = useState(null)
  const {pathname} = useLocation()

  useEffect(() => {
    const checkTokenIsValid = async () => {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
       setIsAuthenticated(false)
       setPayload(null)
       return
      }
      const result = await checkPermission(authToken);
      if (result) {
        setIsAuthenticated(true);
        const temPayload = jwt.decode(authToken)
        setPayload(temPayload)
      }else {
        setIsAuthenticated(false)
        setPayload(null)
      }
    };
    checkTokenIsValid();
  }, [pathname]);

  return (
    <AuthContext.Provider 
      value={{
        isAuthenticated,
        currentMember:payload && {
          id:payload.sub,
          name:payload.name
        },
        register: async(data) => {
          const { success, authToken } = await register({
            username: data.username,
            email: data.email,
            password:data.password
          })
          console.log(data)
          const temPayload = jwt.decode(authToken);
      
          if (temPayload) {
            setPayload(temPayload)
            setIsAuthenticated(true)
            localStorage.setItem('authToken', authToken);
          }else{
            setPayload(null)
            setIsAuthenticated(false)
          }
          return success
        },
        login: async(data) => {
          const {success, authToken} = await login({
            username: data.username,
            password: data.password,
          })
          const temPayload = jwt.decode(authToken);
          if (temPayload) {
            setPayload(temPayload);
            setIsAuthenticated(true);
            localStorage.setItem('authToken', authToken);
          } else {
            setPayload(null);
            setIsAuthenticated(false);
          }
          return success;
        },
        logout: () => {
          localStorage.removeItem('authToken')
          setPayload(null)
          setIsAuthenticated(false)
        }
      }}>
      {children}
    </AuthContext.Provider>
  )
}