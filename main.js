// Waiting until document has loaded
window.onload = () => {

    // --- TEIL 1: CSV laden & Tabelle erzeugen ---
    d3.csv("cars.csv").then((data) => {
        console.log(data); // Debug-Ausgabe

        // --- TEIL 2: SCATTERPLOT ERZEUGEN ---

        // Numerische Werte parsen
        const hpKey = Object.keys(data[0]).find(k => k.includes("Horsepower"));
        const dealerKey = Object.keys(data[0]).find(k => k.includes("Dealer"));

        console.log("HP column:", hpKey);
        console.log("Dealer Cost column:", dealerKey);

        // Werte extrahieren
        data.forEach(d => {
            d.HP = +d[hpKey];
            d.Cost = +d[dealerKey];
        });

        // Abmessungen
        const margin = { top: 40, right: 40, bottom: 60, left: 80 };
        const width = 700 - margin.left - margin.right;
        const height = 500 - margin.top - margin.bottom;

        // SVG erzeugen
        const svg = d3.select("body")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left}, ${margin.top})`);

        // Skalen
        const x = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.HP)])
            .range([0, width]);

        const y = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.Cost)])
            .range([height, 0]);

        // Achsen zeichnen
        svg.append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(x));

        svg.append("g")
            .call(d3.axisLeft(y));

        // Achsenbeschriftungen
        svg.append("text")
            .attr("x", width / 2)
            .attr("y", height + 45)
            .style("text-anchor", "middle")
            .text("Horsepower (HP)");

        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("x", -height / 2)
            .attr("y", -60)
            .style("text-anchor", "middle")
            .text("Dealer Cost");

        // Farben nach Fahrzeugtyp
        const color = d3.scaleOrdinal()
            .domain(["Sedan", "SUV", "Sports Car", "Wagon", "Minivan"])
            .range(["steelblue", "orange", "red", "green", "purple"]);

        // Auswahl-Highlight
        let selectedPoint = null;
        function selectPoint(element) {
            if (selectedPoint) {
                selectedPoint.attr("stroke", "none").attr("stroke-width", 0);
            }
            selectedPoint = d3.select(element)
                .attr("stroke", "black")
                .attr("stroke-width", 2);
        }

        // Punkte zeichnen
        const shape = d3.scaleOrdinal()
            .domain(["Sedan", "SUV", "Sports Car", "Wagon", "Minivan"])
            .range([
                d3.symbolCircle,
                d3.symbolSquare,
                d3.symbolTriangle,
                d3.symbolDiamond,
                d3.symbolCross
            ]);

        // Punkte zeichnen (als <path>)
        svg.selectAll(".point")
            .data(data)
            .enter()
            .append("path")
            .attr("class", "point")
            .attr("transform", d => `translate(${x(d.HP)}, ${y(d.Cost)})`)
            .attr("d", d3.symbol().type(d => shape(d.Type)).size(80))
            .attr("fill", d => color(d.Type))
            .attr("opacity", 0.85)
            .on("click", function() {
                selectPoint(this);
            });


        // Legende
        const legend = svg.selectAll(".legend")
            .data(color.domain())
            .enter()
            .append("g")
            .attr("transform", (d, i) => `translate(0, ${i * 20})`);

        legend.append("path")
            .attr("transform", `translate(${width - 14}, 6)`)
            .attr("d", d3.symbol().type(d => shape(d)).size(100))
            .attr("fill", d => color(d));

        legend.append("text")
            .attr("x", width - 26)
            .attr("y", 10)
            .attr("text-anchor", "end")
            .text(d => d);


    }).catch((error) => {
        console.error("Fehler beim Laden der CSV:", error);
    });

};
