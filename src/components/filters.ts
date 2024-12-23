import * as d3 from "d3";

const filtersHeight = 30;
const filtersWidth = 820;

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
        Venom yield range:
      </label>
        <input id="yieldSlider" type="range" min="0" max="3000" step="300" value="300">
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
        LD50 range:
      </label>
        <input id="ld50Slider" type="range" min="0" max="30" step="3" value="3">
    </div>`);

filters.select("#yieldSlider").on("change", function () {
  console.log("Yield changed!");
});

filters.select("#ld50Slider").on("change", function () {
  console.log("LD50 changed!");
});

export const setupFilters = (container: HTMLDivElement) => {
  container.append(filters.node()!);
};
