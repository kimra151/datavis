// Waiting until document has loaded
window.onload = () => {

  d3.csv("cars.csv").then((data) => {
                console.log(data); // Zum Debuggen: Daten in der Konsole anzeigen

                // Erzeuge eine Tabelle mit den Daten
                const table = d3.select("#carTable");

                // Füge die Header-Zeile hinzu
                const thead = table.append("thead");
                thead.append("tr")
                    .selectAll("th")
                    .data(Object.keys(data[0])) // Nehme die Keys des ersten Objekts als Header
                    .enter()
                    .append("th")
                    .text((d) => d);

                // Füge die Daten-Zeilen hinzu
                const tbody = table.append("tbody");
                const rows = tbody.selectAll("tr")
                    .data(data)
                    .enter()
                    .append("tr");

                rows.selectAll("td")
                    .data((d) => Object.values(d)) // Werte jeder Zeile
                    .enter()
                    .append("td")
                    .text((d) => d);
            }).catch((error) => {
                console.error("Fehler beim Laden der CSV:", error);
            });

};
