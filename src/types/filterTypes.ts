import { Snake } from "./snakeTypes";

export const SnakeFilterNames = {
  LD50: "LD50",
  Yield: "Yield",
  Elapidae: "Elapidae",
  Viperidae: "Viperidae",
  Colubridae: "Colubridae",
  Atractaspididae: "Atractaspididae",
  CommonName: "CommonName",
} as const;

export type Filter = {
  condition: (snake: Snake) => boolean;
  logic: "and" | "or";
};
