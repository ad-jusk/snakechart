import * as d3 from "d3";
import { requestChartRender } from "../d3";
import { Filter } from "../types/filterTypes";
import { Snake } from "../types/snakeTypes";
import { viewConstants } from "../utils/viewConstants";

const containerHeight = 60;
const containerWidth = 820;
const sliderWidth = 130;
const sliderHeight = 30;

const maxYieldValue = 200;
const maxLethalDosageValue = 1;

let filterArray: Filter[] = [
  {
    name: "yield",
    condition: (snake) => snake.yield <= maxYieldValue,
    logic: "and",
  },
  {
    name: "lethalDosage",
    condition: (snake) => snake.lethalDosage <= maxLethalDosageValue,
    logic: "and",
  },
  {
    name: "Elapidae",
    condition: (snake) => snake.family === "Elapidae",
    logic: "or",
  },
];

const topBarSvg = d3
  .create("svg")
  .attr("id", "filters")
  .attr("viewBox", `0 0 ${containerWidth} ${containerHeight}`)
  .attr("preserveAspectRatio", "xMinYMin meet");

// YIELD SLIDER
topBarSvg
  .append("foreignObject")
  .attr("x", containerWidth - sliderWidth)
  .attr("y", 0)
  .attr("width", sliderWidth)
  .attr("height", sliderHeight).html(`
    <div id="yieldContainer" class="sliderContainer">
      <label id="yieldLabel">
        Max venom yield: ${maxYieldValue}mg
      </label>
      <input id="yieldSlider" type="range" min="10" max="3000" step="1" value=${maxYieldValue}>
    </div>`);

// LD50 SLIDER
topBarSvg
  .append("foreignObject")
  .attr("x", containerWidth - sliderWidth)
  .attr("y", containerHeight / 2)
  .attr("width", sliderWidth)
  .attr("height", sliderHeight).html(`
    <div id="ld50Container" class="sliderContainer">
      <label id="ld50Label">
        Max LD50: ${maxLethalDosageValue}mg/kg
      </label>
      <input id="ld50Slider" type="range" min="1" max="12" step="1" value=${maxLethalDosageValue}>
    </div>`);

topBarSvg.select("#yieldSlider").on("change", function () {
  const input = this as HTMLInputElement;
  filterArray = filterArray.filter((filter) => filter.name != "yield");
  filterArray.push({
    name: "yield",
    condition: (snake) => snake.yield <= parseFloat(input.value),
    logic: "and",
  });
  requestChartRender(getFilterPredicate());
});

topBarSvg.select("#yieldSlider").on("input", function () {
  const input = this as HTMLInputElement;
  topBarSvg
    .select("#yieldLabel")
    .text(`Max venom yield: ${parseFloat(input.value)}mg`);
});

topBarSvg.select("#ld50Slider").on("change", function () {
  const input = this as HTMLInputElement;
  filterArray = filterArray.filter((filter) => filter.name != "lethalDosage");
  filterArray.push({
    name: "lethalDosage",
    condition: (snake) => snake.lethalDosage <= parseFloat(input.value),
    logic: "and",
  });
  requestChartRender(getFilterPredicate());
});

topBarSvg.select("#ld50Slider").on("input", function () {
  const input = this as HTMLInputElement;
  topBarSvg
    .select("#ld50Label")
    .text(`Max LD50: ${parseFloat(input.value)}mg/kg`);
});

// FAMILY FILTER
const addFamily = (family: string, x: number) => {
  const g = families.append("g");

  const disableOrEnableFamilyGroup = (disable: boolean) => {
    if (disable) {
      filterArray = filterArray.filter((filter) => filter.name != family);
      g.attr("opacity", 0.3);
      g.select("svg").attr("fill", "grey");
      g.select("text").attr("fill", "grey");
    } else {
      g.attr("opacity", 1);
      g.select("svg").attr("fill", viewConstants.getSnakeIconColor(family));
      g.select("text").attr("fill", viewConstants.getSnakeLabelColor(family));
    }
  };
  g.append("rect")
    .attr("x", x)
    .attr("y", containerHeight / 2 - viewConstants.iconSize.sm / 2)
    .attr("width", viewConstants.iconSize.sm)
    .attr("height", viewConstants.iconSize.sm)
    .attr("fill", "none")
    .attr("pointer-events", "all");
  g.append("svg")
    .attr("class", "snakeIcon")
    .attr("x", x)
    .attr("y", containerHeight / 2 - viewConstants.iconSize.sm / 2)
    .attr("width", viewConstants.iconSize.sm)
    .attr("height", viewConstants.iconSize.sm)
    .attr("viewBox", viewConstants.iconViewbox)
    .attr("fill", viewConstants.getSnakeIconColor(family))
    .html(viewConstants.getSnakeIcon(family));
  g.append("text")
    .attr("x", x + viewConstants.iconSize.sm / 2)
    .attr("y", containerHeight / 2 + viewConstants.iconSize.sm)
    .attr("font-size", viewConstants.labelFontSize)
    .attr("text-anchor", "middle")
    .attr("fill", viewConstants.getSnakeLabelColor(family))
    .attr("dy", -2)
    .text(family);

  g.on("mouseenter", function () {
    d3.select(this).attr("cursor", "pointer");
  });
  g.on("click", function () {
    const containedFilterBeforeClick = filterArray.find(
      (filter) => filter.name === family
    );
    if (containedFilterBeforeClick) {
      filterArray = filterArray.filter((filter) => filter.name != family);
      disableOrEnableFamilyGroup(true);
    } else {
      filterArray.push({
        name: family,
        condition: (snake) => snake.family === family,
        logic: "or",
      });
      disableOrEnableFamilyGroup(false);
    }
    requestChartRender(getFilterPredicate());
  });

  disableOrEnableFamilyGroup(
    filterArray.find((filter) => filter.name === family) === undefined
  );
};

const families = topBarSvg.append("g");
addFamily("Elapidae", 515);
addFamily("Viperidae", 550);
addFamily("Colubridae", 590);
addFamily("Atractaspididae", 640);
families
  .append("text")
  .attr("x", 590)
  .attr("y", 12)
  .attr("text-anchor", "middle")
  .text("CHOOSE FAMILY:");

// SIZES EXPLANATION
const addSize = (
  family: string,
  x: number,
  iconSize: number,
  label: string,
  labelDy: number
) => {
  const g = sizes.append("g");
  g.append("rect")
    .attr("x", x)
    .attr("y", 0)
    .attr("width", iconSize)
    .attr("height", iconSize)
    .attr("fill", "none")
    .attr("pointer-events", "all");
  g.append("svg")
    .attr("class", "snakeIcon")
    .attr("x", x)
    .attr("y", containerHeight - iconSize - 15)
    .attr("width", iconSize)
    .attr("height", iconSize)
    .attr("viewBox", viewConstants.iconViewbox)
    .attr("fill", "black")
    .html(viewConstants.getSnakeIcon(family));
  g.append("text")
    .attr("x", x + iconSize / 2)
    .attr("y", containerHeight - iconSize - 15)
    .attr("font-size", viewConstants.labelFontSize)
    .attr("text-anchor", "middle")
    .attr("fill", "black")
    .attr("dy", labelDy)
    .text(label);
};

const sizes = topBarSvg.append("g");
addSize(
  "Elapidae",
  195,
  viewConstants.iconSize.sm,
  "< 100cm",
  viewConstants.labelDy.sm
);
addSize(
  "Elapidae",
  230,
  viewConstants.iconSize.md,
  "100cm - 200cm",
  viewConstants.labelDy.md
);
addSize(
  "Elapidae",
  270,
  viewConstants.iconSize.lg,
  "> 200cm",
  viewConstants.labelDy.lg
);

// CHART TITLE
const titleGroup = topBarSvg.append("g");
titleGroup
  .append("text")
  .attr("x", 0)
  .attr("y", containerHeight - 22)
  .attr("font-size", 30)
  .text("DROPS OF DEATH");
titleGroup
  .append("text")
  .attr("x", 0)
  .attr("y", containerHeight - 7)
  .attr("font-size", 14)
  .text("SNAKE VENOM YIELD AND POTENCY");

export const getFilterPredicate = (): ((snake: Snake) => boolean) => {
  return (snake: Snake) => {
    let andConditionsMet = true;
    let orConditionsMet = false;

    filterArray.forEach((filter) => {
      const filterResult = filter.condition(snake);

      if (filter.logic === "and") {
        andConditionsMet = andConditionsMet && filterResult;
      } else if (filter.logic === "or") {
        orConditionsMet = orConditionsMet || filterResult;
      }
    });

    return andConditionsMet && orConditionsMet;
  };
};

export const setupTopBar = (container: HTMLDivElement) => {
  container.append(topBarSvg.node()!);
};
