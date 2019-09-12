function makeResponsive() {
  // if the SVG area isn't empty when the browser loads,
// remove it and replace it with a resized version of the chart
  var svgArea = d3.select("#scatter").select("svg");

  if (!svgArea.empty()) {
    svgArea.remove();
  }

  // svg params
  var svgHeight = window.innerHeight;
  var svgWidth = window.innerWidth;

  var margin = {
    top: 15,
    right: 40,
    bottom: 60,
    left: 100
  };

  var width = svgWidth - margin.left - margin.right;
  var height = svgHeight - margin.top - margin.bottom;

  // Create an SVG wrapper, append an SVG group that will hold our chart, and shift the latter by left and top margins.
  var svg = d3.select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

  var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`)
    .classed("chart", true);

  // Import Data
  d3.csv("assets/data/data.csv")
  // function(err, healthData){
  //   if (err)throw err;
    .then(function(healthData) {

          // Step 1: Parse Data/Cast as numbers
          // ==============================
          healthData.forEach(function(data) {
            data.poverty = +data.poverty;
            data.healthcare = +data.healthcare;
            data.age = +data.age;
            data.income = +data.income;
            data.obesity = +data.obesity;
            data.smokes = +data.smokes;
          });

          // Step 2: Create scale functions
          // ==============================
          var xLinearScale = d3.scaleLinear()
            .domain([8.5, .5+d3.max(healthData, d => d.poverty)])
            .range([0, width]);

          var yLinearScale = d3.scaleLinear()
            .domain([0, d3.max(healthData, d => d.healthcare)])
            .range([height, 0]);

          // Step 3: Create axis functions
          // ==============================
          var bottomAxis = d3.axisBottom(xLinearScale);
          var leftAxis = d3.axisLeft(yLinearScale);

          // Step 4: Append Axes to the chart
          // ==============================
          chartGroup.append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(bottomAxis);

          chartGroup.append("g")
            .call(leftAxis);

          // Step 5: Create Circles
              // ==============================
              var circlesGroup = chartGroup.selectAll("circle")
              .data(healthData)
              .enter()
              .append("circle")
              .attr("cx", d => xLinearScale(d.poverty))
              .attr("cy", d => yLinearScale(d.healthcare))
              .attr("r", "15")
              .classed("stateCircle", true);

          // State Abbreviations in circles
              var textGroup = chartGroup.selectAll(".stateText")
              .data(healthData)
              .enter()
              .append("text")
              .classed("stateText", true)
              .attr("x", d =>xLinearScale(d.poverty))
              .attr("y", d => yLinearScale(d.healthcare))
              .attr("dy", 3)
              .attr("font-size", "8px")
              .text(function(d){return d.abbr});


          // Step 6: Initialize tool tip
          // ==============================
          var toolTip = d3.tip()
            .attr("class","d3-tip")
            .offset([80, -60])
            .html(function(d) {
              return (`${d.state}<br>Poverty: ${d.poverty}% <br>Healthcare: ${d.healthcare}%`);
            });

          // Step 7: Create tooltip in the chart
          // ==============================
          chartGroup.call(toolTip);

          // Step 8: Create event listeners to display and hide the tooltip
          // ==============================
          circlesGroup.on("mouseover", function(data) {
            toolTip.show(data, this);
          })
            // onmouseout event
            .on("mouseout", function(data, index) {
              toolTip.hide(data);
            });


          // Create axes labels
          chartGroup.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left + 40)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .classed("axis-text", true)
            .text("Lacks Healthcare (%)");

          chartGroup.append("text")
            .attr("transform", `translate(${width / 2}, ${height + margin.top + 30})`)
            .classed("axis-text", true)
            .text("In Poverty %");
        });
}
makeResponsive();

// Event listener for window resize.
// When the browser window is resized, makeResponsive() is called.
d3.select(window).on("resize", makeResponsive);
