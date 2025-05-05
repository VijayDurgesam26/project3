
d3.csv("data.csv").then(data => {
  data.forEach(d => d.Horsepower = +d.Horsepower);

  const margin = {top: 20, right: 30, bottom: 40, left: 50},
        width = 700 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

  const svg = d3.select("body").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.Horsepower)]).nice()
      .range([0, width]);

  const histogram = d3.histogram()
      .value(d => d.Horsepower)
      .domain(x.domain())
      .thresholds(x.ticks(20));

  const bins = histogram(data);

  const y = d3.scaleLinear()
      .domain([0, d3.max(bins, d => d.length)])
      .range([height, 0]);

  svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x));

  svg.append("g")
      .call(d3.axisLeft(y));

  const tooltip = d3.select("body").append("div")
      .style("position", "absolute")
      .style("padding", "6px")
      .style("background", "white")
      .style("border", "1px solid #ccc")
      .style("border-radius", "4px")
      .style("display", "none");

  const bars = svg.selectAll("rect")
      .data(bins)
    .enter().append("rect")
      .attr("x", 1)
      .attr("transform", d => `translate(${x(d.x0)},${y(d.length)})`)
      .attr("width", d => Math.max(0, x(d.x1) - x(d.x0) - 1))
      .attr("height", d => height - y(d.length))
      .attr("fill", "steelblue")
      .on("mouseover", (event, d) => {
        tooltip.style("display", "block")
               .html(`Range: ${d.x0} - ${d.x1}<br>Frequency: ${d.length}`);
      })
      .on("mousemove", event => {
        tooltip.style("left", event.pageX + 10 + "px")
               .style("top", event.pageY - 28 + "px");
      })
      .on("mouseout", () => tooltip.style("display", "none"))
      .on("click", (event, d) => {
        d3.select("#selected-bar-text")
          .html(`<strong>Selected Range:</strong> ${d.x0} – ${d.x1}<br><strong>Frequency:</strong> ${d.length}`);
        bars.attr("fill", "steelblue");
        d3.select(event.currentTarget).attr("fill", "orange");
      });

  d3.select("body").append("div")
    .attr("id", "selected-bar-text")
    .style("margin", "20px")
    .style("font-size", "16px")
    .style("color", "#333");
});
