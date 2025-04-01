// from our csv file, we load in the data and can standardize the column headings
d3.csv("updated_dataset.csv").then(function(data) {
    // Convert numeric fields and standardize text fields
    data.forEach(d => {
        d['Purchase Amount (USD)'] = +d['Purchase Amount (USD)'];
        d.Season = d.Season.charAt(0).toUpperCase() + d.Season.slice(1).toLowerCase();
        d['Age Group'] = d['Age Group'].trim();
    });

    // we want purchase amount and age group! so we need to filter for age group
    const validData = data.filter(d => 
        d.Season && ["Winter", "Spring", "Summer", "Fall"].includes(d.Season) &&
        d['Age Group'] && ["Gen Z", "Millennial", "Boomer"].includes(d['Age Group'])
    );

    //we group the data for x and y axis -- we need purchase amount grouped by generation
    const groupedData = d3.rollup(
        validData,
        v => d3.sum(v, d => d['Purchase Amount (USD)']),
        d => d.Season,
        d => d['Age Group']
    );

    const lineData = Array.from(groupedData, ([season, ageGroups]) => ({
        season,
        ...Object.fromEntries(ageGroups)
    }));

    // container svg -formatting
    const margin = {top: 40, right: 100, bottom: 60, left: 60};
    const width = 800 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    const svg = d3.select("#chart3")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const seasons = ["Winter", "Spring", "Summer", "Fall"];
    const ageGroups = ["Gen Z", "Millennial", "Boomer"];

    // x and y scale -- season as x, amount of purchase as y in usd
    const xScale = d3.scaleBand()
        .domain(seasons)
        .range([0, width])
        .padding(0.2);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(lineData, d => Math.max(...ageGroups.map(group => d[group] || 0)))])
        .range([height, 0]);
    
    const color = d3.scaleOrdinal()
        .domain(ageGroups)
        .range(["#51ff33", "#4ECDC4", "#45B7D1"]);

    // axes formatting
    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(xScale));

    svg.append("g")
        .call(d3.axisLeft(yScale));

    // each of the gen. gets a line to see trend overtime
    const lines = ageGroups.map(group => {
        return svg.append("path")
            .datum(lineData)
            .attr("fill", "none")
            .attr("stroke", color(group))
            .attr("stroke-width", 2.5)
            .attr("d", d3.line()
                .x(d => xScale(d.season) + xScale.bandwidth()/2)
                .y(d => yScale(d[group] || 0))
            )
            .attr("class", "line")  
            .on("click", function() {
                const clickedLine = d3.select(this);
                const isActive = clickedLine.style("opacity") === "1";
                
                // Reset opacity for all lines
                svg.selectAll(".line").style("opacity", 0.3);
                
    // we want to format so that if the user clicks a line, the other grey out
                if (isActive) {
                    clickedLine.style("opacity", 1);
                                attr("stroke-width", 5.5);
                                glow.style("opacity", 1);
                } else {
                    clickedLine.style("opacity", 1);}});
    });

    //legend formatting for the chart
    const legend = svg.append("g")
        .attr("transform", `translate(${width - 100}, 20)`);

    ageGroups.forEach((group, i) => {
        const legendItem = legend.append("g")
            .attr("transform", `translate(0, ${i * 25})`);

        legendItem.append("circle")
            .attr("r", 6)
            .attr("fill", color(group));

        legendItem.append("text")
            .attr("x", 15)
            .attr("dy", "0.32em")
            .text(group);
    });

    // labels for x and y , x-- seasons y -- purchase amount
    svg.append("text")
        .attr("transform", `translate(${width/2}, ${height + margin.bottom - 10})`)
        .style("text-anchor", "middle")
        .text("Season");

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Total Purchase Amount (USD)");
});

