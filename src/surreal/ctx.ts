import { createContext } from "react";
import Surreal from "surrealdb";
import { Record } from "../surreal";

export const DbContext = createContext<{
  db: Surreal;
  auth: Record | undefined;
}>({
  db: new Surreal(),
  auth: undefined,
});
