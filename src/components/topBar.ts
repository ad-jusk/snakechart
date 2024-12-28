import * as d3 from "d3";
import { requestChartRender } from "../d3";
import { Filter, SnakeFilterNames } from "../types/filterTypes";
import { Snake } from "../types/snakeTypes";
import { viewConstants } from "../utils/viewConstants";
import { SnakeProvider } from "../utils/snakeProvider";

const containerHeight = 60;
const containerWidth = 820;
const sliderWidth = 130;
const sliderHeight = 30;
const searchBarWidth = 160;
const searchBarHeight = 20;

let maxYieldValue = 100;
let maxLethalDosageValue = 1;

const defaultFilters: ReadonlyArray<Filter> = [
  {
    name: SnakeFilterNames.Yield,
    condition: (snake) => snake.yield <= 100,
    logic: "and",
  },
  {
    name: SnakeFilterNames.LD50,
    condition: (snake) => snake.lethalDosage <= 1,
    logic: "and",
  },
  {
    name: SnakeFilterNames.Elapidae,
    condition: (snake) => snake.family === SnakeFilterNames.Elapidae,
    logic: "or",
  },
];
let currentFilters = defaultFilters.slice(0);

const removeFilter = (filterName: string) => {
  currentFilters = currentFilters.filter(
    (filter) => filter.name !== filterName
  );
};

const addFilter = (filter: Filter) => {
  removeFilter(filter.name);
  currentFilters.push(filter);
};

const topBarSvg = d3
  .create("svg")
  .attr("id", "topBar")
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
  maxYieldValue = parseFloat(input.value);
  addFilter({
    name: SnakeFilterNames.Yield,
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
  maxLethalDosageValue = parseFloat(input.value);
  addFilter({
    name: SnakeFilterNames.LD50,
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

const disableOrEnableFamilyGroup = (family: string, disable: boolean) => {
  const g = families.select(`#${family}`);
  if (disable) {
    removeFilter(family);
    g.attr("opacity", 0.3);
    g.select("svg").attr("fill", "grey");
    g.select("text").attr("fill", "grey");
  } else {
    addFilter({
      name: family as any,
      condition: (snake) => snake.family === family,
      logic: "or",
    });
    g.attr("opacity", 1);
    g.select("svg").attr("fill", viewConstants.getSnakeIconColor(family));
    g.select("text").attr("fill", viewConstants.getSnakeLabelColor(family));
  }
};

const disableAllFamilyGroups = () => {
  disableOrEnableFamilyGroup(SnakeFilterNames.Elapidae, true);
  disableOrEnableFamilyGroup(SnakeFilterNames.Viperidae, true);
  disableOrEnableFamilyGroup(SnakeFilterNames.Colubridae, true);
  disableOrEnableFamilyGroup(SnakeFilterNames.Atractaspididae, true);
};

const addFamily = (family: string, x: number) => {
  const g = families
    .append("g")
    .attr("class", "snakeFamilySelector")
    .attr("id", family);

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

  g.on("click", function () {
    const familyFilterActive = currentFilters.find(
      (filter) => filter.name === family
    );
    disableOrEnableFamilyGroup(family, familyFilterActive !== undefined);
    requestChartRender(getFilterPredicate());
  });

  disableOrEnableFamilyGroup(
    family,
    currentFilters.find((filter) => filter.name === family) === undefined
  );
};

const families = topBarSvg.append("g");
addFamily(SnakeFilterNames.Elapidae, 515);
addFamily(SnakeFilterNames.Viperidae, 550);
addFamily(SnakeFilterNames.Colubridae, 590);
addFamily(SnakeFilterNames.Atractaspididae, 640);
families
  .append("text")
  .attr("x", 590)
  .attr("y", 12)
  .attr("text-anchor", "middle")
  .text("CHOOSE FAMILY:");

// SIZES
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
  SnakeFilterNames.Elapidae,
  195,
  viewConstants.iconSize.sm,
  "< 100cm",
  viewConstants.labelDy.sm
);
addSize(
  SnakeFilterNames.Elapidae,
  230,
  viewConstants.iconSize.md,
  "< 200cm",
  viewConstants.labelDy.md
);
addSize(
  SnakeFilterNames.Elapidae,
  270,
  viewConstants.iconSize.lg,
  ">= 200cm",
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

const matchSlidersToFilters = () => {
  topBarSvg.select("#ld50Slider").attr("value", maxLethalDosageValue);
  topBarSvg.select("#yieldSlider").attr("value", maxYieldValue);
  topBarSvg.select("#ld50Label").text(`Max LD50: ${maxLethalDosageValue}mg/kg`);
  topBarSvg
    .select("#yieldLabel")
    .text(`Max venom yield: ${maxYieldValue}mg/kg`);
};

// SEARCH BAR
const searchBar = topBarSvg
  .append("foreignObject")
  .attr("id", "searchBar")
  .attr("x", containerWidth / 2 - searchBarWidth / 2)
  .attr("y", containerHeight / 2 - searchBarHeight / 2)
  .attr("height", searchBarHeight)
  .attr("width", searchBarWidth).html(`
         <input id="snakeNameTextField" type="text" 
                placeholder="Search" 
                style="width: ${searchBarWidth}px; height: ${searchBarHeight}px; box-sizing: border-box;">
  `);
const dropdown = d3.create("div").attr("id", "snakeNameListContainer");
const dropdownList = dropdown.append("ul").attr("id", "snakeNameList");

dropdownList.on("click", function (event) {
  const li = event.target;
  const liText = li.textContent || li.innerText;
  const snake =
    SnakeProvider.getInstance().getSnakesByPhraseInCommonName(liText)[0];

  if (!snake) {
    return;
  }

  maxLethalDosageValue = Math.ceil(parseFloat(snake.lethalDosage.toString()));
  maxYieldValue = Math.ceil(parseFloat(snake.yield.toString()));
  const ld50Filter = currentFilters.find(
    (filter) => filter.name === SnakeFilterNames.LD50
  );
  const yieldFilter = currentFilters.find(
    (filter) => filter.name === SnakeFilterNames.Yield
  );
  if (ld50Filter) {
    ld50Filter.condition = (snake) =>
      snake.lethalDosage <= maxLethalDosageValue;
  }
  if (yieldFilter) {
    yieldFilter.condition = (snake) => snake.yield <= maxYieldValue;
  }

  disableAllFamilyGroups();
  disableOrEnableFamilyGroup(snake.family, false);

  addFilter({
    name: SnakeFilterNames.CommonName,
    condition: (s) => s.commonName === snake.commonName,
    logic: "and",
  });

  matchSlidersToFilters();
  dropdown.style("visibility", "hidden");
  searchBar.select("#snakeNameTextField").property("value", snake.commonName);
  requestChartRender(getFilterPredicate());
});

searchBar.select("#snakeNameTextField").on("input", function () {
  const value = (this as HTMLInputElement).value;
  const snakes = SnakeProvider.getInstance().getSnakesByPhraseInCommonName(
    value,
    true
  );

  if (value.length === 0) {
    removeFilter(SnakeFilterNames.CommonName);
    requestChartRender(getFilterPredicate());
    dropdown.style("visibility", "hidden");
    return;
  }

  if (snakes.length === 0) {
    dropdown.style("visibility", "hidden");
    return;
  }

  dropdownList.selectAll("li").remove();
  snakes.forEach((snake) => dropdownList.append("li").text(snake.commonName));
  dropdown.style("visibility", "visible");
});

const bindDropdownSizeAndPosition = () => {
  const searchBarElement = topBarSvg.select("#searchBar").node() as HTMLElement;
  const topBarElement = topBarSvg.node()! as SVGGraphicsElement;
  if (searchBarElement) {
    const rect = searchBarElement.getBoundingClientRect();
    const topBarRect = topBarElement.getBoundingClientRect();
    dropdown.style("width", `${rect.width}px`);
    dropdown.style("top", `${topBarRect.height}px`);
  } else {
    dropdown.style("width", `${searchBarWidth}px`);
  }
};

export const getFilterPredicate = (): ((snake: Snake) => boolean) => {
  return (snake: Snake) => {
    let andConditionsMet = true;
    let orConditionsMet = false;

    currentFilters.forEach((filter) => {
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

export const getMaxYieldAndLethalDose = (): number[] => {
  return [maxYieldValue, maxLethalDosageValue];
};

const fillDropdown = () => {
  const snakes = SnakeProvider.getInstance().getSnakes((_snake) => true, true);
  snakes.forEach((snake) => dropdownList.append("li").text(snake.commonName));
};

export const setupTopBar = (container: HTMLDivElement) => {
  container.append(topBarSvg.node()!);
  container.append(dropdown.node()!);
  window.addEventListener("resize", bindDropdownSizeAndPosition);
  bindDropdownSizeAndPosition();
  fillDropdown();
};
