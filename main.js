let selectedPoint = null;

window.onload = function () {
  d3.csv("cars.csv").then(function (data) {
    console.log("Daten geladen:", data[0]);

    const hpKey = Object.keys(data[0]).find(k => k.includes("Horsepower"));
    const costKey = Object.keys(data[0]).find(k => k.includes("Dealer"));

    data.forEach(d => {
      d.HP = +d[hpKey] || 0;
      d.Cost = +d[costKey] || 0;
      d.Engine = +d["Engine Size (l)"] || 0;
      d.Cyl = +d.Cyl || 0;
      d.CityMPG = +d["City Miles Per Gallon"] || 0;
      d.Weight = +d.Weight || 0;
    });

    const margin = { top: 40, right: 70, bottom: 70, left: 90 };
    const width = 720 - margin.left - margin.right;
    const height = 520 - margin.top - margin.bottom;

    const svg = d3.select("#chart")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.HP)]).nice()
      .range([0, width]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.Cost)]).nice()
      .range([height, 0]);

    // Achsen
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).ticks(8))
      .append("text")
      .attr("x", width / 2)
      .attr("y", 40)
      .attr("fill", "black")
      .attr("font-size", 14)
      .attr("text-anchor", "middle")
      .text("Horsepower");

    svg.append("g")
      .call(d3.axisLeft(y).tickFormat(d3.format("$,.0f")))
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", -60)
      .attr("fill", "black")
      .attr("font-size", 14)
      .attr("text-anchor", "middle")
      .text("Miles Per Gallon");

    // Farben & Symbole
    const types = ["Sedan", "SUV", "Sports Car", "Wagon", "Minivan"];
    const color = d3.scaleOrdinal()
      .domain(types)
      .range(["#3498db", "#e67e22", "#e74c3c", "#2ecc71", "#9b59b6"]);

    const symbol = d3.scaleOrdinal()
      .domain(types)
      .range([d3.symbolCircle, d3.symbolSquare, d3.symbolTriangle, d3.symbolDiamond, d3.symbolCross]);

    function selectPoint(el, d) {
      if (selectedPoint) selectedPoint.attr("stroke", "none");
      selectedPoint = d3.select(el)
        .attr("stroke", "black")
        .attr("stroke-width", 3);
      updateInfo(d);
    }

    // Punkte
    svg.selectAll(".point")
      .data(data)
      .enter()
      .append("path")
      .attr("class", "point")
      .attr("d", d3.symbol().type(d => symbol(d.Type)).size(110))
      .attr("transform", d => `translate(${x(d.HP)}, ${y(d.Cost)})`)
      .attr("fill", d => color(d.Type))
      .style("cursor", "pointer")
      .on("click", function (e, d) { 
        d = d3.select(this).datum();
        selectPoint(this, d); 
      });

    // Legende
    const legend = svg.selectAll(".legend")
      .data(types)
      .enter()
      .append("g")
      .attr("class", "legend")
      .attr("transform", (d, i) => `translate(0,${i * 26})`);

    legend.append("path")
      .attr("transform", `translate(${width - 14}, 8)`)
      .attr("d", d3.symbol().type(d => symbol(d)).size(120))
      .attr("fill", d => color(d));

    legend.append("text")
      .attr("x", width - 30)
      .attr("y", 12)
      .attr("text-anchor", "end")
      .text(d => d);

  }).catch(err => {
    d3.select("body").append("p")
      .text("FEHLER: cars.csv nicht gefunden!")
      .style("color", "red")
      .style("text-align", "center");
  });
};

// STARPLOT – BONUS!
function drawStarPlot(car) {
  d3.select("#starplot").html("");

  const width = 320, height = 320;
  const radius = 100;
  const cx = width / 2, cy = height / 2;

  const svg = d3.select("#starplot")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  const features = [
    { key: "CityMPG", label: "City MPG", max: 100 },
    { key: "HP", label: "Horsepower", max: 800 },
    { key: "Cost", label: "Dealer Cost", max: 200000 },
    { key: "Weight", label: "Weight", max: 5000 },
    { key: "Engine", label: "Engine Size", max: 6 },
    { key: "Cyl", label: "Cylinders", max: 12 }
  ];

  const angle = Math.PI * 2 / features.length;

  // Gitter
  for (let i = 1; i <= 5; i++) {
    const r = radius * i / 5;
    svg.append("polygon")
      .attr("points", features.map((f, j) => {
        const a = angle * j - Math.PI / 2;
        return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
      }).join(" "))
      .attr("fill", "none")
      .attr("stroke", "#ddd");
  }

  // Achsen + Labels
  features.forEach((f, i) => {
    const a = angle * i - Math.PI / 2;
    const x2 = cx + radius * Math.cos(a);
    const y2 = cy + radius * Math.sin(a);

    svg.append("line")
      .attr("x1", cx).attr("y1", cy)
      .attr("x2", x2).attr("y2", y2)
      .attr("stroke", "#999");

    svg.append("text")
      .attr("x", x2 + Math.cos(a) * 15)
      .attr("y", y2 + Math.sin(a) * 15)
      .attr("text-anchor", Math.cos(a) > 0 ? "start" : "end")
      .text(f.label);
  });

  // Daten
  const values = features.map(f => (car[f.key] || 0) / f.max);
  const line = d3.line()
    .x((d, i) => cx + radius * d * Math.cos(angle * i - Math.PI / 2))
    .y((d, i) => cy + radius * d * Math.sin(angle * i - Math.PI / 2));

  svg.append("path")
    .datum(values)
    .attr("d", line)
    .attr("fill", "#e67e22")
    .attr("fill-opacity", 0.5)

}

// TABELLE + STARPLOT
function updateInfo(d) {
  const table = d3.select("#carTable").html("");

  const rows = [
    ["Name", d.Name],
    ["Type", d.Type],
    ["AWD", d.AWD === "1" ? "Yes" : "No"],
    ["RWD", d.RWD === "1" ? "Yes" : "No"],
    ["Retail Price", d["Retail Price"]],
    ["Dealer Cost", d["Dealer Cost"]],
    ["Engine Size", d.Engine + " L"],
    ["Cylinders", d.Cyl],
    ["City MPG", d.CityMPG],
    ["Weight", d.Weight + " lbs"]
  ];

  rows.forEach(([k, v]) => {
    table.append("tr")
      .html(`<td>${k}</td><td>${v || "—"}</td>`);
  });

  drawStarPlot(d);
}