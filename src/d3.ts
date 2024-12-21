import * as d3 from "d3";
import { SnakeProvider } from "./utils/snakeProvider";
import { Snake } from "./types/snakeTypes";

let chartHeight = 400;
let chartWidth = 800;

// CHART SVG
const chart = d3
  .create("svg")
  .attr("viewBox", `0 0 ${chartWidth} ${chartHeight}`)
  .attr("preserveAspectRatio", "xMinYMin meet");

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
  const g = chart.append("g");

  g.selectAll("rect")
    .data(snakes)
    .join("rect")
    .attr("x", (d) => xScale(d.lethalDosage))
    .attr("y", (d) => yScale(d.yield))
    .attr("fill", (d) => (d.family.startsWith("V") ? "green" : "red"))
    .attr("opacity", 0.6)
    .attr("width", (d) => (d.size > 200 ? 40 : d.size > 100 ? 30 : 25))
    .attr("height", (d) => (d.size > 200 ? 40 : d.size > 100 ? 30 : 25));

  g.selectAll("text")
    .data(snakes)
    .join("text")
    .attr("x", (d) => xScale(d.lethalDosage))
    .attr("y", (d) => yScale(d.yield))
    .attr("font-size", "8px")
    .attr("dy", (d) => (d.size > 200 ? 45 : d.size > 100 ? 35 : 30))
    .text((d) => d.commonName);
};

export const setupD3 = async (container: HTMLDivElement) => {
  // READ SNAKE DATA
  await SnakeProvider.getInstance().readCSV("./data/snakes.csv");

  const snakes = SnakeProvider.getInstance().getSnakes();
  setupAxesDomain(snakes);
  renderSnakes(snakes);
  container.append(chart.node()!);
};
