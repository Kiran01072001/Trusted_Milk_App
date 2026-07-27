import React, { createContext, useContext, useState } from 'react';

const AddressContext = createContext();

export function AddressProvider({ children }) {
  const [address, setAddress] = useState('Home - 123, Green Hills, Hyderabad');
  return (
    <AddressContext.Provider value={{ address, setAddress }}>
      {children}
    </AddressContext.Provider>
  );
}

export function useAddress() {
  return useContext(AddressContext);
}
