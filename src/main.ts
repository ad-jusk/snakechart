import { setupTopBar } from "./components/topBar";
import { setupD3 } from "./chart";
import { SnakeProvider } from "./utils/snakeProvider";

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div>
    <div id="topBarContainer"></div>
    <div id="chartContainer"></div>
  </div>
`;

const setup = async () => {
  await SnakeProvider.getInstance().readCSV("./data/snakes_full.csv");
  setupTopBar(document.querySelector<HTMLDivElement>("#topBarContainer")!);
  setupD3(document.querySelector<HTMLDivElement>("#chartContainer")!);
};

setup();
