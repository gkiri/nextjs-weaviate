export const auth = async () => {
  return {
    user: {
      id: 'mock-user-id',
      email: 'mock@example.com',
    }
  };
};

export const signIn = async () => {
  return null;
};

export const signOut = async () => {
  return null;
};
