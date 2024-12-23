import { setupFilters } from "./components/filters";
import { setupD3 } from "./d3";

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div>
    <div id="filtersContainer"></div>
    <div id="chartContainer"></div>
  </div>
`;

setupFilters(document.querySelector<HTMLDivElement>("#filtersContainer")!);
setupD3(document.querySelector<HTMLDivElement>("#chartContainer")!);
