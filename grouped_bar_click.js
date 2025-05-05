
d3.csv("data.csv").then(data => {
  data.forEach(d => d.MPG = +d.MPG);

  const nested = d3.groups(data, d => d.Origin, d => d.Manufacturer)
    .map(([origin, mans]) => ({
      origin,
      manufacturers: mans.map(([manufacturer, cars]) => ({
        manufacturer,
        avgMPG: d3.mean(cars, d => d.MPG)
      }))
    }));

  const width = 800, height = 400;
  const svg = d3.select("body").append("svg")
    .attr("width", width).attr("height", height);

  const origins = nested.map(d => d.origin);
  const manufacturers = Array.from(new Set(data.map(d => d.Manufacturer)));

  const x0 = d3.scaleBand().domain(origins).range([80, width - 50]).paddingInner(0.2);
  const x1 = d3.scaleBand().domain(manufacturers).range([0, x0.bandwidth()]).padding(0.05);
  const y = d3.scaleLinear().domain([0, 50]).range([height - 60, 50]);

  const color = d3.scaleOrdinal().domain(manufacturers).range(d3.schemeCategory10);

  svg.append("g").attr("transform", `translate(0,${height - 60})`).call(d3.axisBottom(x0));
  svg.append("g").attr("transform", `translate(80,0)`).call(d3.axisLeft(y));

  const barGroups = svg.selectAll("g.bar-group")
    .data(nested)
    .enter().append("g")
    .attr("transform", d => `translate(${x0(d.origin)},0)`);

  const bars = barGroups.selectAll("rect")
    .data(d => d.manufacturers.map(m => ({ origin: d.origin, ...m })))
    .enter().append("rect")
    .attr("x", d => x1(d.manufacturer))
    .attr("y", d => y(d.avgMPG))
    .attr("width", x1.bandwidth())
    .attr("height", d => height - 60 - y(d.avgMPG))
    .attr("fill", d => color(d.manufacturer))
    .on("click", function (event, d) {
      d3.select("#bar-text")
        .html(`<strong>Origin:</strong> ${d.origin}<br><strong>Manufacturer:</strong> ${d.manufacturer}<br><strong>Average MPG:</strong> ${d.avgMPG.toFixed(2)}`);

      svg.selectAll("rect").attr("fill", r => color(r.manufacturer));
      d3.select(this).attr("fill", "orange");
    })
    .append("title")
    .text(d => `Manufacturer: ${d.manufacturer}\nAvg MPG: ${d.avgMPG.toFixed(2)}`);

  // Legend
  const legend = svg.append("g").attr("transform", `translate(${width - 160}, 20)`);
  manufacturers.slice(0, 10).forEach((man, i) => {
    const yOffset = i * 18;
    legend.append("rect")
      .attr("x", 0).attr("y", yOffset).attr("width", 12).attr("height", 12).attr("fill", color(man));
    legend.append("text")
      .attr("x", 18).attr("y", yOffset + 10).text(man).style("font-size", "12px");
  });
});
