import { setupD3 } from "./d3";
import { SnakeProvider } from "./utils/snakeProvider";

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div>
    <div id="container" style="padding: 20px;"></div>
  </div>
`;

await SnakeProvider.getInstance().readCSV("./data/snakes.csv");
setupD3(document.querySelector<HTMLDivElement>("#container")!);
