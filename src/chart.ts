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
const tooltipWidth = 150;
const tooltipHeight = 100;

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
  .attr("refX", 5)
  .attr("refY", 5)
  .attr("markerWidth", 8)
  .attr("markerHeight", 8)
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
  .attr("viewBox", viewConstants.viewBox512x512)
  .html(viewConstants.getMouseIcon());
chart
  .append("text")
  .attr("x", chartWidth / 2)
  .attr("y", 0)
  .attr("font-size", 24)
  .attr("text-anchor", "middle")
  .attr("dy", 25)
  .text("VENOM YIELD");

// SNAKE TOOLTIP
const tooltip = chart
  .append("foreignObject")
  .attr("id", "snakeTooltip")
  .attr("x", 0)
  .attr("y", 0)
  .attr("width", tooltipWidth)
  .attr("height", tooltipHeight)
  .attr("font-size", viewConstants.labelFontSize)
  .style("visibility", "hidden");
const tooltipBody = tooltip
  .append("xhtml:div")
  .attr("id", "tooltipBody")
  .style("width", `${tooltipWidth}px`)
  .style("height", `${tooltipHeight}px`)
  .style("max-width", `${tooltipWidth}px`)
  .style("max-height", `${tooltipHeight}px`).html(`
    <div id="tooltipHeader"></div>
    <div id="tooltipContent"></div>
    `);
const closeTooltipButton = tooltipBody
  .append("svg")
  .attr("id", "closeTooltipButton")
  .attr("width", 8)
  .attr("height", 8);
closeTooltipButton.append("path").attr("d", "M 0 0 L 8 8 M 8 0 L 0 8");
closeTooltipButton
  .append("rect")
  .attr("width", 8)
  .attr("height", 8)
  .attr("x", 0)
  .attr("y", 0)
  .on("click", () => hideTooltip());

// CLICK EXPLANATION
const snakeClickExplanation = chart
  .append("g")
  .attr("id", "snakeClickExplanation")
  .attr("transform", `translate(70, 150)`);
snakeClickExplanation
  .append("text")
  .attr("dx", 40)
  .attr("dy", -40)
  .attr("font-size", 14)
  .text("Click for more info!");
snakeClickExplanation
  .append("path")
  .attr("transform", `rotate(-20)`)
  .attr("stroke", "black")
  .attr("d", `M${155},0 H${200}`)
  .attr("marker-end", "url(#arrowhead)");

// HELP
const handleHelpClick = () => {
  const x = 25;
  const y = 0;

  tooltip.raise();
  tooltip.attr("x", x).attr("y", y).style("visibility", "visible");

  tooltipBody.select("#tooltipHeader").html("");
  tooltipBody.select("#tooltipContent").html(
    `<div id="helpContainer">
      <h3>Terminology:</h3>
      <p>LD50 - amount of venom required to kill half of the test population. Smaller amount means more potent venom.</p>
      <p>Venom yield - amount of dryweight venom that the snake injects in a single bite.</p>
      <h3>About:</h3>
      <p>This chart presents venomous snakes whose venom was tested on mice. It does not contain all the snakes in the world since the venom can be tested on other animals. That gives completely different LD50 values.</p>
      <h3>How to use:</h3>
      <p>You can choose the snake family that interests you. Simply click on one of the icons at the top. Max yield and LD50 sliders adjust the axes of the chart to match the specified value. Bigger values will make more snakes appear on the chart. You can also search specific snake by typing its name in the search box.</p>
      <h3>Data acquired from:</h3>
      <a href="https://snakedb.org/pages/index.php" target="blank">SnakeDB</a>
      </div>`
  );
};

const help = chart.append("g").attr("id", "help");
help
  .append("svg")
  .attr("viewBox", viewConstants.viewBox24x24)
  .attr("width", 20)
  .attr("height", 20)
  .attr("fill", "none")
  .html(viewConstants.getHelpIcon());
help
  .append("circle")
  .attr("cx", 10)
  .attr("cy", 10)
  .attr("r", 10)
  .attr("fill", "none")
  .attr("border", "black")
  .attr("cursor", "pointer")
  .attr("pointer-events", "all");
help.on("click", handleHelpClick);

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
    .range([xAxisPosition, 40]);

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
    .attr("d", `M${100},0 H${chartWidth - 5}`)
    .attr("marker-end", "url(#arrowhead)");
  chart
    .append("g")
    .attr("id", "y-axis")
    .attr("transform", `translate(${chartWidth / 2}, 0)`)
    .call(yAxis)
    .select("path")
    .attr("d", `M0,${xAxisPosition} V${35}`)
    .attr("marker-end", "url(#arrowhead)");
};

const renderSnakes = (snakes: ReadonlyArray<Snake>) => {
  clearSnakesContainer();
  hideTooltip();

  snakes.forEach((snake) => {
    const snakeGroup = snakesContainer
      .append("g")
      .attr("id", `group_${snake.binomial}`)
      .attr("class", "snakeGroup")
      .attr("opacity", viewConstants.iconOpacity);

    const sizeXY =
      snake.size >= 200
        ? viewConstants.iconSize.lg
        : snake.size >= 100
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
      .attr("viewBox", viewConstants.viewBox512x512)
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
        snake.size >= 200
          ? viewConstants.labelDx.lg
          : snake.size >= 100
          ? viewConstants.labelDx.md
          : viewConstants.labelDx.sm
      )
      .attr(
        "dy",
        snake.size >= 200
          ? viewConstants.labelDy.lg
          : snake.size >= 100
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
      })
      .on("click", function () {
        onSnakeClick(x, y, snake, sizeXY);
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

const onSnakeClick = (
  baseX: number,
  baseY: number,
  snake: Snake,
  snakeIconSize: number
) => {
  removeClickExplanation();

  tooltip.raise();

  const tooltipOffset = 10;

  // DISPLAY TOOLTIP ON THE LEFT AS DEFAULT
  let x = baseX - tooltipWidth - tooltipOffset;
  let y = baseY - (tooltipHeight - snakeIconSize) / 2;

  // DISPLAY TOOLTIP ON THE RIGHT IF NO SPACE
  if (x < 0) {
    x = baseX + snakeIconSize + tooltipOffset;
  }

  tooltip.attr("x", x).attr("y", y).style("visibility", "visible");

  tooltipBody.select("#tooltipHeader").html(`<p>${snake.commonName}</p>`);

  tooltipBody.select("#tooltipContent").html(`
    <div>
      <p>Binomial:<p>
      <p>Family:</p>
      <p>LD50:</p>
      <p>Venom yield:</p>
      <p>Maximum size:</p>
      <p>Dentition type:</p>
    </div>
    <div id="tooltipSnakeData">
      <p>${snake.binomial}<p>
      <p>${snake.family}</p>
      <p>${snake.lethalDosage}mg/kg</p>
      <p>${snake.yield}mg</p>
      <p>${snake.size}cm</p>
      <p>${snake.dentition}</p>
    </div>
    `);
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
  const snakeIcons = snakesContainer.selectAll("g");
  if (snakeIcons.size() > 0) {
    removeClickExplanation();
  }
  snakeIcons.remove();
};

const hideTooltip = () => {
  tooltip.style("visibility", "hidden");
};

const removeClickExplanation = () => {
  if (chart.select("#snakeClickExplanation")) {
    snakeClickExplanation.remove();
  }
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
  const snakes = SnakeProvider.getInstance().getSnakes(filterPredicate);
  const [maxYield, maxLethalDose] = getMaxYieldAndLethalDose();
  renderAxes(maxYield, maxLethalDose);
  renderLD50Info(maxLethalDose / 2);
  renderSnakes(snakes);
};

export const setupD3 = async (container: HTMLDivElement) => {
  requestChartRender(getFilterPredicate());
  container.append(chart.node()!);
};
