import { IPublicClientApplication, PublicClientApplication } from "@azure/msal-browser";

export const getMsalUser = (instance: IPublicClientApplication) => {
  const account =
    instance.getActiveAccount() || instance.getAllAccounts()[0];

  if (!account) return null;

  const c = account.idTokenClaims as any;

  return {
    name: c?.name,
    firstName: c?.given_name,
    email: c?.preferred_username || c?.email,
    userId: c?.oid,
    tenantId: c?.tid,
  };
};
