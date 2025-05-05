
d3.csv("data.csv").then(data => {
  data.forEach(d => {
    d.MPG = +d.MPG;
    d["Model Year"] = +d["Model Year"];
  });

  const avgByYear = d3.rollups(data, v => d3.mean(v, d => d.MPG), d => d["Model Year"])
    .sort((a, b) => a[0] - b[0]);

  const margin = {top: 20, right: 30, bottom: 40, left: 60},
        width = 700 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

  const svg = d3.select("body").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3.scaleLinear()
      .domain(d3.extent(avgByYear, d => d[0])).nice()
      .range([0, width]);

  const y = d3.scaleLinear()
      .domain([0, d3.max(avgByYear, d => d[1])]).nice()
      .range([height, 0]);

  const line = d3.line()
      .x(d => x(d[0]))
      .y(d => y(d[1]));

  svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).tickFormat(d3.format("d")));

  svg.append("g")
      .call(d3.axisLeft(y));

  svg.append("path")
      .datum(avgByYear)
      .attr("fill", "none")
      .attr("stroke", "green")
      .attr("stroke-width", 2)
      .attr("d", line);

  svg.selectAll("circle")
      .data(avgByYear)
      .enter().append("circle")
      .attr("cx", d => x(d[0]))
      .attr("cy", d => y(d[1]))
      .attr("r", 4)
      .attr("fill", "darkblue")
      .on("click", function(event, d) {
        d3.select("#line-info").html(`<strong>Model Year:</strong> ${d[0]}<br><strong>Avg MPG:</strong> ${d[1].toFixed(2)}`);
        svg.selectAll("circle").attr("fill", "darkblue");
        d3.select(this).attr("fill", "orange");
      })
      .append("title")
      .text(d => `Year: ${d[0]}, Avg MPG: ${d[1].toFixed(2)}`);

  d3.select("body").append("div")
    .attr("id", "line-info")
    .style("margin", "20px")
    .style("font-size", "16px")
    .style("color", "#333")
    .html("Click a point to see details.");
});
