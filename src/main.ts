import { setupTopBar } from "./components/topBar";
import { setupD3 } from "./d3";

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div>
    <div id="filtersContainer"></div>
    <div id="chartContainer"></div>
  </div>
`;

setupTopBar(document.querySelector<HTMLDivElement>("#filtersContainer")!);
setupD3(document.querySelector<HTMLDivElement>("#chartContainer")!);
