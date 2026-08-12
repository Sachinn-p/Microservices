import { createContext, useContext } from 'react';

export const UserContext = createContext('user-1');

export const useUser = () => useContext(UserContext);
