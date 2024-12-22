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
};

const renderSnakes = (snakes: ReadonlyArray<Snake>) => {
  clearSnakesContainer();

  snakes.forEach((snake) => {
    const g = chart
      .append("g")
      .attr("class", "snakeGroup")
      .attr("opacity", viewConstants.iconOpacity);

    const sizeXY =
      snake.size > 200
        ? viewConstants.iconSize.lg
        : snake.size > 100
        ? viewConstants.iconSize.md
        : viewConstants.iconSize.sm;

    g.append("rect")
      .attr("x", xScale(snake.lethalDosage))
      .attr("y", yScale(snake.yield))
      .attr("width", sizeXY)
      .attr("height", sizeXY)
      .attr("fill", "none")
      .attr("pointer-events", "all");

    g.append("svg")
      .attr("id", `icon_${snake.binomial}`)
      .attr("class", "snakeIcon")
      .attr("x", xScale(snake.lethalDosage))
      .attr("y", yScale(snake.yield))
      .attr("width", sizeXY)
      .attr("height", sizeXY)
      .attr("viewBox", viewConstants.iconViewbox)
      .attr(
        "fill",
        snake.family === "Viperidae"
          ? viewConstants.iconColors.viparidae
          : viewConstants.iconColors.elapidae
      )
      .html(
        snake.family === "Viperidae"
          ? svgPaths.viperidaeIcon
          : svgPaths.elapidaeIcon
      );

    g.append("text")
      .attr("id", `label_${snake.binomial}`)
      .attr("class", "snakeLabel")
      .attr("x", xScale(snake.lethalDosage))
      .attr("y", yScale(snake.yield))
      .attr(
        "dx",
        snake.size > 200
          ? viewConstants.labelDx.lg
          : snake.size > 100
          ? viewConstants.labelDx.md
          : viewConstants.labelDx.sm
      )
      .attr(
        "dy",
        snake.size > 200
          ? viewConstants.labelDy.lg
          : snake.size > 100
          ? viewConstants.labelDy.md
          : viewConstants.labelDy.sm
      )
      .attr(
        "fill",
        snake.family === "Viperidae"
          ? viewConstants.labelColors.viparidae
          : viewConstants.labelColors.elapidae
      )
      .attr("font-size", viewConstants.labelFontSize)
      .text(snake.commonName);

    g.on("mouseover", function () {
      // Todo: extract method and hide only near snakes
      const bbox = this.getBBox();
      const cx = bbox.x + bbox.width / 2;
      const cy = bbox.y + bbox.height / 2;
      d3.select(this)
        .raise()
        .attr("opacity", 1)
        .attr("cursor", "pointer")
        .transition()
        .duration(200)
        .ease(d3.easeLinear)
        .attr(
          "transform",
          `translate(${cx}, ${cy}) scale(1.2) translate(${-cx}, ${-cy})`
        );
    }).on("mouseout", function () {
      // Todo: extract method and show only near snakes
      const bbox = this.getBBox();
      const cx = bbox.x + bbox.width / 2;
      const cy = bbox.y + bbox.height / 2;
      d3.select(this)
        .raise()
        .attr("opacity", viewConstants.iconOpacity)
        .transition()
        .duration(200)
        .ease(d3.easeLinear)
        .attr(
          "transform",
          `translate(${cx}, ${cy}) scale(1) translate(${-cx}, ${-cy})`
        );
    });
  });
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
