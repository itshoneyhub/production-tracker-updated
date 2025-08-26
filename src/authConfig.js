export const msalConfig = {
  auth: {
    clientId: "035c45db-bf88-464f-9eba-140b798d611d",
    authority: "https://login.microsoftonline.com/common",
    redirectUri: "http://localhost:5173"
  },
  cache: {
    cacheLocation: "sessionStorage", // This configures where your cache will be stored
    storeAuthStateInCookie: false, // Set this to "true" if you are having issues on IE11 or Edge
  }
};

export const loginRequest = {
  scopes: ["User.Read", "Files.Read", "Sites.Read.All"]
};
