import { Snake } from "./snakeTypes";

export type Filter = {
  name: string;
  condition: (snake: Snake) => boolean;
  logic: "and" | "or";
};
