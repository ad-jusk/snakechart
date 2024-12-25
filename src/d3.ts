import * as d3 from "d3";
import { SnakeProvider } from "./utils/snakeProvider";
import { Snake } from "./types/snakeTypes";
import { viewConstants } from "./utils/viewConstants";
import {
  getFilterPredicate,
  getMaxYieldAndLethalDose,
} from "./components/topBar";

const chartHeight = 350;
const chartWidth = 800;
const xAxisPosition = chartHeight - 20;

// MAX DISTANCE TO CHECK FOR NEAR SNAKE GROUPS
const opacityReduceDistance = 60;

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

// ADD ARROW HEAD DEF
chart
  .append("defs")
  .append("marker")
  .attr("id", "arrowhead")
  .attr("viewBox", "0 0 10 10")
  .attr("refX", 10)
  .attr("refY", 5)
  .attr("markerWidth", 10)
  .attr("markerHeight", 10)
  .attr("orient", "auto")
  .append("path")
  .attr("d", "M 0 0 L 10 5 L 0 10 Z")
  .attr("fill", "black");

// AXES DESCRIPTIONS
const xAxisDescription = chart.append("g");
xAxisDescription
  .append("text")
  .attr("x", 0)
  .attr("y", xAxisPosition)
  .attr("font-size", 24)
  .attr("dx", 12)
  .text("TOXICITY");
xAxisDescription
  .append("text")
  .attr("x", 0)
  .attr("y", xAxisPosition)
  .attr("font-size", 10)
  .attr("dx", 12)
  .attr("dy", 10)
  .text("BASED ON LD50 IN");
xAxisDescription
  .append("svg")
  .attr("x", 80)
  .attr("y", xAxisPosition + 1)
  .attr("width", 13)
  .attr("height", 13)
  .attr("viewBox", viewConstants.iconViewbox)
  .html(viewConstants.getMouseIcon());

chart
  .append("text")
  .attr("x", chartWidth / 2)
  .attr("y", 0)
  .attr("font-size", 24)
  .attr("text-anchor", "middle")
  .attr("dy", 25)
  .text("VENOM YIELD");

const renderAxes = (maxYield: number, maxLethalDose: number) => {
  // DELETE AXES IF ALREADY PRESENT
  chart.select("#x-axis").remove();
  chart.select("#y-axis").remove();

  const minYield = 0;
  const minLethalDose = 0;
  const lethalDosePadding = maxLethalDose * 0.1;
  const yieldPadding = maxYield * 0.1;

  xScale.domain([
    maxLethalDose + lethalDosePadding,
    minLethalDose - lethalDosePadding,
  ]);
  yScale
    .domain([minYield - yieldPadding * 2, maxYield + yieldPadding])
    .range([xAxisPosition, 30]);

  const xTickValues = xScale.ticks(0);
  const yTickValues = yScale.ticks(5).filter((t) => t >= 0);

  // AXES
  const xAxis = d3
    .axisBottom(xScale)
    .tickValues(xTickValues)
    .tickFormat((d) => (d === 0 ? "~0.01" : d.toString()));
  const yAxis = d3
    .axisLeft(yScale)
    .tickValues(yTickValues)
    .tickFormat((d) => (d === 0 ? "~0.01" : d.toString()));

  // ADD AXES TO CHART
  chart
    .append("g")
    .attr("id", "x-axis")
    .attr("transform", `translate(0, ${xAxisPosition})`)
    .call(xAxis)
    .select("path")
    .attr("d", `M${100},0 H${chartWidth}`)
    .attr("marker-end", "url(#arrowhead)");
  chart
    .append("g")
    .attr("id", "y-axis")
    .attr("transform", `translate(${chartWidth / 2}, 0)`)
    .call(yAxis)
    .select("path")
    .attr("d", `M0,${xAxisPosition} V${30}`)
    .attr("marker-end", "url(#arrowhead)");
};

const renderSnakes = (snakes: ReadonlyArray<Snake>) => {
  clearSnakesContainer();

  snakes.forEach((snake) => {
    const snakeGroup = snakesContainer
      .append("g")
      .attr("id", `group_${snake.binomial}`)
      .attr("class", "snakeGroup")
      .attr("opacity", viewConstants.iconOpacity);

    const sizeXY =
      snake.size > 200
        ? viewConstants.iconSize.lg
        : snake.size > 100
        ? viewConstants.iconSize.md
        : viewConstants.iconSize.sm;
    const x = xScale(snake.lethalDosage) - sizeXY / 2;
    const y = yScale(snake.yield) - sizeXY / 2;

    snakeGroup
      .append("rect")
      .attr("x", x)
      .attr("y", y)
      .attr("width", sizeXY)
      .attr("height", sizeXY)
      .attr("fill", "none")
      .attr("pointer-events", "all");

    snakeGroup
      .append("svg")
      .attr("id", `icon_${snake.binomial}`)
      .attr("class", "snakeIcon")
      .attr("x", x)
      .attr("y", y)
      .attr("width", sizeXY)
      .attr("height", sizeXY)
      .attr("viewBox", viewConstants.iconViewbox)
      .attr("fill", viewConstants.getSnakeIconColor(snake.family))
      .html(viewConstants.getSnakeIcon(snake.family));

    snakeGroup
      .append("text")
      .attr("id", `label_${snake.binomial}`)
      .attr("class", "snakeLabel")
      .attr("x", x)
      .attr("y", y)
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
      .attr("fill", viewConstants.getSnakeLabelColor(snake.family))
      .attr("font-size", viewConstants.labelFontSize)
      .text(snake.commonName);

    snakeGroup
      .on("mouseover", function () {
        onSnakeMouseOver(this);
      })
      .on("mouseout", function () {
        onSnakeMouseOut(this);
      });
  });
};

const onSnakeMouseOver = (snakeGroup: SVGGraphicsElement) => {
  const bbox = snakeGroup.getBBox();
  const cx = bbox.x + bbox.width / 2;
  const cy = bbox.y + bbox.height / 2;
  d3.select(snakeGroup)
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

  d3.selectAll(".snakeGroup")
    .filter(function (_d, i, n) {
      return n[i] !== snakeGroup;
    })
    .filter(function (_d, i, n) {
      const distance = getDistanceBetweenSnakeGroups(
        n[i] as SVGGraphicsElement,
        snakeGroup
      );
      return distance < opacityReduceDistance;
    })
    .attr("opacity", 0.1);
};

const onSnakeMouseOut = (snakeGroup: SVGGraphicsElement) => {
  const bbox = snakeGroup.getBBox();
  const cx = bbox.x + bbox.width / 2;
  const cy = bbox.y + bbox.height / 2;
  d3.select(snakeGroup)
    .raise()
    .attr("opacity", viewConstants.iconOpacity)
    .transition()
    .duration(200)
    .ease(d3.easeLinear)
    .attr(
      "transform",
      `translate(${cx}, ${cy}) scale(1) translate(${-cx}, ${-cy})`
    );

  // REDUCE OPACITY OF SNAKE GROUPS THAT ARE CLOSE
  d3.selectAll(".snakeGroup")
    .filter(function (_d, i, n) {
      return n[i] !== snakeGroup;
    })
    .filter(function (_d, i, n) {
      const distance = getDistanceBetweenSnakeGroups(
        n[i] as SVGGraphicsElement,
        snakeGroup
      );
      return distance < opacityReduceDistance;
    })
    .attr("opacity", viewConstants.iconOpacity);
};

const getDistanceBetweenSnakeGroups = (
  snakeGroup1: SVGGraphicsElement,
  snakeGroup2: SVGGraphicsElement
): number => {
  const bbox1 = snakeGroup1.getBBox();
  const cx1 = bbox1.x + bbox1.width / 2;
  const cy1 = bbox1.y + bbox1.height / 2;

  const bbox2 = snakeGroup2.getBBox();
  const cx2 = bbox2.x + bbox2.width / 2;
  const cy2 = bbox2.y + bbox2.height / 2;

  return Math.round(Math.sqrt(Math.pow(cx2 - cx1, 2) + Math.pow(cy2 - cy1, 2)));
};

const clearSnakesContainer = () => {
  snakesContainer.selectAll("g").remove();
};

const renderLD50Info = (averageLD50: number) => {
  chart.select("#ld50InfoGroup").remove();

  const g = chart.append("g").attr("id", "ld50InfoGroup");
  g.append("text")
    .attr("x", chartWidth / 4)
    .attr("y", chartHeight)
    .attr("dy", -3)
    .attr("text-anchor", "middle")
    .text(`LD50 > ${averageLD50}mg/kg`);

  g.append("text")
    .attr("x", chartWidth - chartWidth / 4)
    .attr("y", chartHeight)
    .attr("dy", -3)
    .attr("text-anchor", "middle")
    .text(`LD50 < ${averageLD50}mg/kg`);
};

export const requestChartRender = (
  filterPredicate: (snake: Snake) => boolean
) => {
  const snakes = SnakeProvider.getInstance().getFilteredSnakes(filterPredicate);
  const [maxYield, maxLethalDose] = getMaxYieldAndLethalDose();
  renderAxes(maxYield, maxLethalDose);
  renderLD50Info(maxLethalDose / 2);
  renderSnakes(snakes);
};

export const setupD3 = async (container: HTMLDivElement) => {
  // READ SNAKE DATA
  await SnakeProvider.getInstance().readCSV("./data/snakes_full.csv");
  requestChartRender(getFilterPredicate());
  container.append(chart.node()!);
};
