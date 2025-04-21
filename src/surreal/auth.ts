import Surreal from "surrealdb";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    google?: any;
  }
}

export async function login(
  db: Surreal,
  credentials: GoogleOauth | OwnAuthSignin,
): Promise<boolean> {
  try {
    if (instanceOfGoogleOauth(credentials)) {
      const token = await db.signin({
        access: "account",
        namespace: "mixit",
        database: "mixit",
        variables: {
          email: credentials.email,
          sub: credentials.sub,
          username: "",
          password: "",
        },
      });

      document.cookie = `jwt=${token}; path=/`;
      return true;
    } else {
      const token = await db.signin({
        access: "account",
        namespace: "mixit",
        database: "mixit",
        variables: {
          username: credentials.username,
          password: credentials.password,
          sub: "",
          email: "",
        },
      });

      document.cookie = `jwt=${token}; path=/`;
      return true;
    }
  } catch (err: unknown) {
    console.error("Failed", err instanceof Error ? err.message : String(err));
  }

  return false;
}

interface GoogleOauth {
  email: string;
  sub: string;
}

interface OwnAuthSignin {
  username: string;
  password: string;
}

interface OwnAuthSignup {
  username: string;
  email: string;
  password: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function instanceOfGoogleOauth(object: any): object is GoogleOauth {
  return "sub" in object && "email" in object;
}

export async function register(
  db: Surreal,
  credentials: GoogleOauth | OwnAuthSignup,
): Promise<boolean> {
  try {
    if (instanceOfGoogleOauth(credentials)) {
      console.log("Register with Google OAuth");
      const token = await db.signup({
        access: "account",
        namespace: "mixit",
        database: "mixit",
        variables: {
          email: credentials.email,
          sub: credentials.sub,
        },
      });

      document.cookie = `jwt=${token}; path=/`;
      return true;
    } else {
      console.log("Register with Email");
      const token = await db.signup({
        access: "account",
        namespace: "mixit",
        database: "mixit",
        variables: {
          username: credentials.username,
          email: credentials.email,
          password: credentials.password,
        },
      });

      document.cookie = `jwt=${token}; path=/`;
      return true;
    }
  } catch (err: unknown) {
    console.error("Failed", err instanceof Error ? err.message : String(err));
  }

  return false;
}

// Load the Google API script
export function loadGoogleScript(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onLoad: (this: GlobalEventHandlers, ev: Event) => any,
) {
  // Remove any existing script to avoid duplicates
  const existingScript = document.getElementById("google-auth-script");
  if (existingScript) {
    return;
  }

  const script = document.createElement("script");
  script.src = "https://accounts.google.com/gsi/client";
  script.id = "google-auth-script";
  script.async = true;
  script.defer = true;
  document.body.appendChild(script);

  script.onload = onLoad;
}

export enum Method {
  Register,
  Login,
}

// Function to handle Google sign-in response
export async function handleGoogleCallback(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  response: any,
  db: Surreal | undefined,
  method: Method,
) {
  try {
    // Decode the JWT token to get user info
    const payload = decodeJwtResponse(response.credential);
    console.log("Google Sign In successful");

    // Extract the Google ID and email
    const googleId = payload.sub; // Google's unique identifier for the user
    const userEmail = payload.email;

    // console.log("Google ID:", googleId);
    // console.log("Email:", userEmail);

    // Save the user to your database
    if (db != undefined) {
      switch (method) {
        case Method.Register:
          return await register(db, {
            sub: googleId,
            email: userEmail,
          });
        case Method.Login:
          return await login(db, {
            email: userEmail,
            sub: googleId,
          });
      }
    }

    // Redirect or show success message
  } catch (error) {
    console.error("Google sign-in error:", error);
    /* setErrorMessage */ console.log(
      "Google sign-in failed. Please try again.",
    );
  }

  return false;
}

// Helper function to decode the JWT token
function decodeJwtResponse(token: string) {
  const base64Url = token.split(".")[1];
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split("")
      .map(function (c) {
        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join(""),
  );
  return JSON.parse(jsonPayload);
}

// Function to trigger Google sign-in
export function handleGoogleSignIn() {
  if (window.google && window.google.accounts.id) {
    window.google.accounts.id.prompt();
  } else {
    console.error("Google API not loaded yet");
    /* setErrorMessage */ console.log(
      "Google sign-in not available. Please try again later.",
    );
  }
}
