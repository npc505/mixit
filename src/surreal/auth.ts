import Surreal from "surrealdb";

export async function login(db:Surreal, username:string, password:string): Promise<void> {
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