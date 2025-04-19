import { createContext } from "react";
import Surreal from "surrealdb";
export const DbContext = createContext<Surreal>(new Surreal());
