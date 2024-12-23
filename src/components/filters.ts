import * as d3 from "d3";
import { requestChartRender } from "../d3";
import { Filter } from "../types/filterTypes";
import { Snake } from "../types/snakeTypes";

const filtersHeight = 30;
const filtersWidth = 820;

const initalMaxYield = 200;
const initialMaxLethalDosage = 2;

let filterArray: Filter[] = [
  {
    name: "yield",
    condition: (snake) => snake.yield <= initalMaxYield,
  },
  {
    name: "lethalDosage",
    condition: (snake) => snake.lethalDosage <= initialMaxLethalDosage,
  },
];

const filters = d3
  .create("svg")
  .attr("id", "filters")
  .attr("viewBox", `0 0 ${filtersWidth} ${filtersHeight}`)
  .attr("preserveAspectRatio", "xMinYMin meet");

// YIELD SLIDER
filters
  .append("foreignObject")
  .attr("x", 0)
  .attr("y", 0)
  .attr("width", 130)
  .attr("height", 30).html(`
    <div class="sliderContainer">
      <label>
        Max venom yield:
      </label>
        <input id="yieldSlider" type="range" min="10" max="3000" step="1" value=${initalMaxYield}>
    </div>`);

// LD50 SLIDER
filters
  .append("foreignObject")
  .attr("x", 130)
  .attr("y", 0)
  .attr("width", 130)
  .attr("height", 30).html(`
    <div class="sliderContainer">
      <label>
        Max LD50:
      </label>
        <input id="ld50Slider" type="range" min="1" max="12" step="1" value=${initialMaxLethalDosage}>
    </div>`);

filters.select("#yieldSlider").on("change", function () {
  const input = this as HTMLInputElement;
  filterArray = filterArray.filter((filter) => filter.name != "yield");
  filterArray.push({
    name: "yield",
    condition: (snake) => snake.yield <= parseFloat(input.value),
  });
  requestChartRender(getFilterPredicate());
});

filters.select("#ld50Slider").on("change", function () {
  const input = this as HTMLInputElement;
  filterArray = filterArray.filter((filter) => filter.name != "lethalDosage");
  filterArray.push({
    name: "lethalDosage",
    condition: (snake) => snake.lethalDosage <= parseFloat(input.value),
  });
  requestChartRender(getFilterPredicate());
});

export const getFilterPredicate =
  (): ((snake: Snake) => boolean) => (snake: Snake) =>
    filterArray.every((filter) => filter.condition(snake));

export const setupFilters = (container: HTMLDivElement) => {
  container.append(filters.node()!);
};
