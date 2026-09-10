import React, { createContext, useContext, useState } from 'react';

const AuthRoleContext = createContext();

export function AuthRoleProvider({ children }) {
  // Current active role: 'admin' or 'manager'
  const [currentRole, setCurrentRole] = useState('admin');
  // Current active branch scope: null (all for admin) or branch id for manager
  const [selectedBranchId, setSelectedBranchId] = useState('b-01');

  // Simulated current logged in profile info
  const currentUser = {
    id: currentRole === 'admin' ? 'u-admin' : 'u-mgr-pp',
    name: currentRole === 'admin' ? 'Bong Leak (Super Admin)' : 'Sokha Meng (PP Hub Manager)',
    email: currentRole === 'admin' ? 'admin@voleakexpress.com' : 'sokha.pp@voleakexpress.com',
    role: currentRole,
    branch_id: currentRole === 'manager' ? selectedBranchId : null,
    avatar_url:
      currentRole === 'admin'
        ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
        : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
  };

  const switchRole = (newRole) => {
    setCurrentRole(newRole);
  };

  return (
    <AuthRoleContext.Provider
      value={{
        currentRole,
        setCurrentRole: switchRole,
        selectedBranchId,
        setSelectedBranchId,
        currentUser,
        isAdmin: currentRole === 'admin',
        isManager: currentRole === 'manager',
      }}
    >
      {children}
    </AuthRoleContext.Provider>
  );
}

export function useAuthRole() {
  const context = useContext(AuthRoleContext);
  if (!context) {
    return {
      currentRole: 'admin',
      setCurrentRole: () => {},
      selectedBranchId: 'op-1',
      setSelectedBranchId: () => {},
      currentUser: {
        id: 'u-admin',
        name: 'Bong Leak (Super Admin)',
        email: 'admin@voleakexpress.com',
        role: 'admin',
      },
      isAdmin: true,
      isManager: false,
    };
  }
  return context;
}
