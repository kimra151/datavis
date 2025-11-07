window.onload = function () {
  d3.csv("cars.csv").then(function (data) {
    console.log("Daten geladen:", data[0]);

    // Spalten finden
    const hpKey = Object.keys(data[0]).find(k => k.includes("Horsepower"));
    const costKey = Object.keys(data[0]).find(k => k.includes("Dealer"));

    // Parsen
    data.forEach(d => {
      d.HP = +d[hpKey] || 0;
      d.Cost = +d[costKey] || 0;
      d.Engine = +d["Engine Size (l)"] || 0;
      d["City Miles Per Gallon"] = +d["City Miles Per Gallon"] || 0;
      d["Highway Miles Per Gallon"] = +d["Highway Miles Per Gallon"] || 0;
      d.Cyl = +d.Cyl || 0;
      d["Wheel Base"] = +d["Wheel Base"] || 0;
      d.Len = +d.Len || 0;
      d.Weight = +d.Weight || 0;
    });

    // Layout
    const margin = { top: 40, right: 60, bottom: 70, left: 90 };
    const width = 700 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    // SVG
    const svg = d3.select("#chart")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Skalen
    const x = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.HP)]).nice()
      .range([0, width]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.Cost)]).nice()
      .range([height, 0]);

    // Achsen
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).ticks(8));

    svg.append("g")
      .call(d3.axisLeft(y).tickFormat(d3.format("$,.0f")));

    // Labels
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", height + 50)
      .attr("text-anchor", "middle")
      .text("Horsepower (HP)");

    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", -65)
      .attr("text-anchor", "middle")
      .text("Dealer Cost ($)");

    // Farben & Symbole
    const types = ["Sedan", "SUV", "Sports Car", "Wagon", "Minivan"];
    const color = d3.scaleOrdinal()
      .domain(types)
      .range(["#3498db", "#e67e22", "#e74c3c", "#2ecc71", "#9b59b6"]);

    const symbol = d3.scaleOrdinal()
      .domain(types)
      .range([
        d3.symbolCircle,
        d3.symbolSquare,
        d3.symbolTriangle,
        d3.symbolDiamond,
        d3.symbolCross
      ]);

    let selectedPoint = null;

    function selectPoint(element, datum) {
      if (selectedPoint) {
        selectedPoint.attr("stroke", "none").attr("stroke-width", 0);
      }
      selectedPoint = d3.select(element)
        .attr("stroke", "black")
        .attr("stroke-width", 3);
      updateInfo(datum);
    }

    // PUNKTE (als <path> für Symbole)
    svg.selectAll(".point")
      .data(data)
      .enter()
      .append("path")
      .attr("class", "point")
      .attr("d", d3.symbol().type(d => symbol(d.Type)).size(110))
      .attr("transform", d => `translate(${x(d.HP)}, ${y(d.Cost)})`)
      .attr("fill", d => color(d.Type))
      .style("cursor", "pointer")
      .on("click", function (event, d) {
        d = d3.select(this).datum();
        selectPoint(this, d);
      });

    // LEGENDE
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
    console.error(err);
    d3.select("body").append("p")
      .text("FEHLER: cars.csv nicht gefunden!")
      .style("color", "red");
  });
};

// TABELLE AKTUALISIEREN
function updateInfo(d) {
  const table = d3.select("#carTable");
  table.html("");

  const rows = [
    ["Name", d.Name],
    ["Type", d.Type],
    ["AWD", d.AWD === "1" ? "Yes" : "No"],
    ["RWD", d.RWD === "1" ? "Yes" : "No"],
    ["Retail Price", d["Retail Price"]],
    ["Dealer Cost", d["Dealer Cost"]],
    ["Engine", `${d.Engine} L`],
    ["Cylinders", d.Cyl],
    ["Weight", `${d.Weight} lbs`]
  ];

  rows.forEach(([key, val]) => {
    const tr = table.append("tr");
    tr.append("td").text(key);
    tr.append("td").text(val || "—");
  });
}