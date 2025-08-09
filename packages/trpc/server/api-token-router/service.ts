
// Dummy token data store (in-memory for demonstration)
const dummyTokens: Array<{
  id: string;
  name: string;
  userId: string;
  teamId: string;
  expiresAt?: Date;
  createdAt: Date;
}> = [];

export const getApiTokens = async ({ userId, teamId }: { userId: string; teamId: string }) => {
  console.log("getApiTokens() called with:", { userId, teamId });
  
  // Return tokens for the current user and team
  return dummyTokens.filter(
    (token) => token.userId === userId && token.teamId === teamId
  );
};

export const createApiToken = async ({
  userId,
  teamId,
  tokenName,
  expiresIn,
}: {
  userId: string;
  teamId: string;
  tokenName: string;
  expiresIn?: number;
}) => {
  console.log("createApiToken() called with:", { userId, teamId, tokenName, expiresIn });

  const newToken = {
    id: `token_${Date.now()}`,
    name: tokenName,
    userId,
    teamId,
    expiresAt: expiresIn ? new Date(Date.now() + expiresIn) : undefined,
    createdAt: new Date(),
  };

  dummyTokens.push(newToken);
  return newToken;
};

export const deleteTokenById = async ({
  id,
  teamId,
  userId,
}: {
  id: string;
  teamId: string;
  userId: string;
}) => {
  console.log("deleteTokenById() called with:", { id, teamId, userId });

  const tokenIndex = dummyTokens.findIndex(
    (token) => token.id === id && token.teamId === teamId && token.userId === userId
  );

  if (tokenIndex !== -1) {
    dummyTokens.splice(tokenIndex, 1);
    return { success: true };
  }

  return { success: false, error: "Token not found or access denied" };
};
