import { Snake } from "../types/snakeTypes";
import { csv } from "d3";

export class SnakeProvider {
  private static instance: SnakeProvider;
  private snakes: Snake[] = [];

  private constructor() {}

  public static getInstance(): SnakeProvider {
    if (!this.instance) {
      this.instance = new SnakeProvider();
    }
    return this.instance;
  }

  public readCSV = async (filepath: string) => {
    const data = await csv(filepath, (data) => {
      const snake: Snake = {
        family: data.family,
        binomial: data.binomial,
        commonName: data.commonName,
        method: data.method,
        injection: data.injection,
        testedOn: data.testedOn,
        lethalDosage: +data.lethalDosage,
        yield: +data.yield,
        size: +data.size,
        dentition: data.dentition,
      };
      return snake;
    });

    this.snakes = data;
  };

  public getSnakes = (
    predicate: (snake: Snake) => boolean = (_snake) => true,
    sortedByName: boolean = false
  ): ReadonlyArray<Snake> => {
    const snakes = this.snakes.filter(predicate);
    if (sortedByName) {
      return snakes.sort((s1, s2) =>
        ("" + s1.commonName).localeCompare(s2.commonName)
      );
    }
    return snakes;
  };

  public getSnakesByPhraseInCommonName = (
    phrase: string,
    sortedByName: boolean = false
  ): ReadonlyArray<Snake> => {
    const snakes = this.getSnakes(
      (snake) => snake.commonName.toLowerCase().includes(phrase.toLowerCase()),
      sortedByName
    );
    return snakes;
  };
}
