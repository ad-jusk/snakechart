import { setupTopBar } from "./components/topBar";
import { setupD3 } from "./d3";

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div>
    <div id="topBarContainer"></div>
    <div id="chartContainer"></div>
  </div>
`;

setupTopBar(document.querySelector<HTMLDivElement>("#topBarContainer")!);
setupD3(document.querySelector<HTMLDivElement>("#chartContainer")!);
