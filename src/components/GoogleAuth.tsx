import { useEffect, useRef, useState } from "react";
import { loadGoogleScript } from "../surreal/auth";

interface GoogleAuthProps {
  callback: (response: unknown) => Promise<boolean>;
}

const GoogleAuth = ({ callback }: GoogleAuthProps) => {
  const googleButtonRef = useRef<HTMLDivElement>(null);
  const [isGoogleApiReady, setIsGoogleApiReady] = useState(false);
  const isInitialized = useRef(false);

  useEffect(() => {
    if (isInitialized.current) {
      setIsGoogleApiReady(true);
      return;
    }

    loadGoogleScript(() => {
      if (
        window.google &&
        window.google.accounts &&
        window.google.accounts.id
      ) {
        try {
          window.google.accounts.id.initialize({
            client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
            callback: callback,
          });
          isInitialized.current = true;
          setIsGoogleApiReady(true);
        } catch (error) {
          console.error("Error initializing Google API:", error);
          setIsGoogleApiReady(false);
        }
      } else {
        console.warn("Google API not found after script load attempt.");
        setIsGoogleApiReady(false);
      }
    });
  }, [callback]);

  useEffect(() => {
    if (isGoogleApiReady && googleButtonRef.current) {
      try {
        window.google.accounts.id.renderButton(googleButtonRef.current, {
          theme: "outline",
          size: "large",
          type: "standard",
          shape: "rectangular",
          text: "signup_with",
          logo_alignment: "left",
          width: 240,
        });
      } catch (error) {
        console.error("Error rendering Google button:", error);
      }
    }
  }, [isGoogleApiReady, googleButtonRef.current]);

  return (
    <div className="flex flex-row justify-center items-center gap-4">
      <div ref={googleButtonRef}>
        {!isGoogleApiReady && <span>Loading Google button...</span>}
      </div>
    </div>
  );
};

export default GoogleAuth;
