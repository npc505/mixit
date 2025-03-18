import Surreal from "surrealdb";


export async function login(db: Surreal, username: string, password: string): Promise<void> {
    try {
      const token = await db.signin({
        access : 'account',
        namespace: 'mixit',
        database: 'mixit',
        variables: {
          username: username,
          password: password,
        },
      });
  
      console.log("si existe", token);
    } catch (err: unknown) {
      console.error("Failed", err instanceof Error ? err.message : String(err));
    }
  }

interface GoogleOauth {
  username: string,
  sub: string
}

interface OwnAuth {
  username: string,
  email: string,
  password: string,
}

function instanceOfGoogleOauth(object: any): object is GoogleOauth {
    return 'sub' in object && 'username' in object;
}

export async function register(db: Surreal, credentials: GoogleOauth | OwnAuth): Promise<void> {
  try {
    if (instanceOfGoogleOauth(credentials)) {
      console.log("Register with Google OAuth")
      const token = await db.signup({
          access : 'account',
          namespace: 'mixit',
          database: 'mixit',
          variables: {
            username: credentials.username,
            sub: credentials.sub,
          },
      });
      
      console.log("ahora existe", token);
    } else {
      console.log("Register with Email")
      const token = await db.signup({
          access : 'account',
          namespace: 'mixit',
          database: 'mixit',
          variables: {
            username: credentials.username,
            email: credentials.email,
            password: credentials.password,
          },
      });
      
      console.log("ahora existe", token);
    }
  } catch (err: unknown) {
      console.error("Failed", err instanceof Error ? err.message : String(err));
  }
}
