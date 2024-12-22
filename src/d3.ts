import * as d3 from "d3";
import { SnakeProvider } from "./utils/snakeProvider";
import { Snake } from "./types/snakeTypes";
import { viewConstants, svgPaths } from "./utils/viewConstants";

let chartHeight = 400;
let chartWidth = 800;

// CHART SVG
const chart = d3
  .create("svg")
  .attr("id", "chart")
  .attr("viewBox", `0 0 ${chartWidth} ${chartHeight}`)
  .attr("preserveAspectRatio", "xMinYMin meet");
const snakesContainer = chart.append("g").attr("id", "snakesContainer");

// X SCALE
const xScale = d3.scaleLinear().range([0, chartWidth]);

// Y SCALE
const yScale = d3.scaleLinear().range([chartHeight, 0]);

// AXES
const xAxis = d3.axisBottom(xScale).ticks(0).tickSize(0);
const yAxis = d3.axisLeft(yScale).ticks(0).tickSize(0);

// ADD AXES TO CHART
chart
  .append("g")
  .attr("transform", `translate(0, ${chartHeight / 2})`)
  .call(xAxis);
chart
  .append("g")
  .attr("transform", `translate(${chartWidth / 2}, 0)`)
  .call(yAxis);

const setupAxesDomain = (snakes: ReadonlyArray<Snake>) => {
  const maxLethalDose = Math.max(...snakes.map((snake) => snake.lethalDosage));
  const minLethalDose = Math.min(...snakes.map((snake) => snake.lethalDosage));
  const maxYield = Math.max(...snakes.map((snake) => snake.yield));
  const minYield = Math.min(...snakes.map((snake) => snake.yield));
  const lethalDosePadding = (maxLethalDose - minLethalDose) * 0.1;
  const yieldPadding = (maxYield - minYield) * 0.1;
  xScale.domain([
    maxLethalDose + lethalDosePadding,
    minLethalDose - lethalDosePadding,
  ]);
  yScale.domain([minYield - yieldPadding * 2, maxYield + yieldPadding]);
  console.log(yScale.domain());
};

const renderSnakes = (snakes: ReadonlyArray<Snake>) => {
  clearSnakesContainer();

  snakesContainer
    .selectAll("svg")
    .data(snakes)
    .join("svg")
    .attr("id", (d) => `icon_${d.binomial}`)
    .attr("class", "snakeIcon")
    .attr("x", (d) => xScale(d.lethalDosage))
    .attr("y", (d) => yScale(d.yield))
    .attr("width", (d) =>
      d.size > 200
        ? viewConstants.iconSize.lg
        : d.size > 100
        ? viewConstants.iconSize.md
        : viewConstants.iconSize.sm
    )
    .attr("height", (d) =>
      d.size > 200
        ? viewConstants.iconSize.lg
        : d.size > 100
        ? viewConstants.iconSize.md
        : viewConstants.iconSize.sm
    )
    .attr("viewBox", viewConstants.iconViewbox)
    .attr("fill", (d) =>
      d.family === "Viperidae"
        ? viewConstants.iconColors.viparidae
        : viewConstants.iconColors.elapidae
    )
    .attr("opacity", viewConstants.iconOpacity)
    .html((d) =>
      d.family === "Viperidae" ? svgPaths.viperidaeIcon : svgPaths.elapidaeIcon
    )
    .on("mouseover", function (event, d) {
      d3.select(this).attr("opacity", 1);
      // Todo: hide near snakes
    })
    .on("mouseout", function (event, d) {
      d3.select(this).attr("opacity", viewConstants.iconOpacity);
      // Todo: show near snakes
    });

  snakesContainer
    .selectAll("text")
    .data(snakes)
    .join("text")
    .attr("id", (d) => `label_${d.binomial}`)
    .attr("class", "snakeLabel")
    .attr("x", (d) => xScale(d.lethalDosage))
    .attr("y", (d) => yScale(d.yield))
    .attr("dx", (d) =>
      d.size > 200
        ? viewConstants.labelDx.lg
        : d.size > 100
        ? viewConstants.labelDx.md
        : viewConstants.labelDx.sm
    )
    .attr("dy", (d) =>
      d.size > 200
        ? viewConstants.labelDy.lg
        : d.size > 100
        ? viewConstants.labelDy.md
        : viewConstants.labelDy.sm
    )
    .attr("fill", (d) =>
      d.family === "Viperidae"
        ? viewConstants.labelColors.viparidae
        : viewConstants.labelColors.elapidae
    )
    .attr("font-size", viewConstants.labelFontSize)
    .attr("opacity", viewConstants.iconOpacity)
    .text((d) => d.commonName);
};

const clearSnakesContainer = () => {
  snakesContainer.selectAll("svg").remove();
  snakesContainer.selectAll("text").remove();
};

export const setupD3 = async (container: HTMLDivElement) => {
  const snakeProvider = SnakeProvider.getInstance();
  // READ SNAKE DATA
  await snakeProvider.readCSV("./data/snakes.csv");
  const snakes = snakeProvider.getSnakes();

  setupAxesDomain(snakes);
  renderSnakes(snakes);
  container.append(chart.node()!);
};
