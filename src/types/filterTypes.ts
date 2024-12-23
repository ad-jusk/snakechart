import { Snake } from "./snakeTypes";

export type Filter = {
  name: "yield" | "lethalDosage" | "family";
  condition: (snake: Snake) => boolean;
};
