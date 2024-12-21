import { setupD3 } from "./d3";

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div>
    <div id="container" style="padding: 20px;"></div>
  </div>
`;

setupD3(document.querySelector<HTMLDivElement>("#container")!);
