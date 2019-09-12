function makeResponsive() {
  // if the SVG area isn't empty when the browser loads,
// remove it and replace it with a resized version of the chart
  var svgArea = d3.select("#scatter").select("svg");

  if (!svgArea.empty()) {
    svgArea.remove();
  }

  // svg params
  var svgHeight = window.innerHeight / 1.5;
  var svgWidth = window.innerWidth;

  var margin = {
    top: 15,
    right: 40,
    bottom: 80,
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

  // Initial Params
  var chosenXAxis = "poverty";
  var chosenYAxis = "healthcare";

  // function used for updating x-scale var upon click on axis label
  function xScale(healthData, chosenXAxis) {
      // create scales
      var xLinearScale = d3.scaleLinear()
      .domain([d3.min(healthData, d => d[chosenXAxis]) * 0.8,
      d3.max(healthData, d => d[chosenXAxis]) * 1.2])
      .range([0, width]);

  return xLinearScale;
  }
  // function used for updating xAxis var upon click on axis label
  function renderXAxes(newXScale, xAxis) {
      var bottomAxis = d3.axisBottom(newXScale);

      xAxis.transition()
          .duration(1000)
          .call(bottomAxis);

      return xAxis;
  }

  // function used for updating y-scale var upon click on axis label
  function yScale(healthData, chosenYAxis) {
      // create scales
      var yLinearScale = d3.scaleLinear()
      .domain([0, d3.max(healthData, d => d[chosenYAxis])])
      .range([height, 0]);

      return yLinearScale;
  }

  // function used for updating yAxis var upon click on axis label
  function renderYAxes(newYScale, yAxis) {
      var leftAxis = d3.axisLeft(newYScale);

      yAxis.transition()
          .duration(1000)
          .call(leftAxis);

      return yAxis;
  }

  // function used for updating circles group with a transition to
  // new circles
  function renderXCircles(circlesGroup, newXScale, chosenXAxis) {
      circlesGroup.selectAll("circle").transition()
          .duration(1000)
          .attr("cx", d => newXScale(d[chosenXAxis]));
      circlesGroup.selectAll("text").transition()
          .duration(1000)
          .attr("dx", d => newXScale(d[chosenXAxis]));

      return circlesGroup;
  }

  function renderYCircles(circlesGroup, newYScale, chosenYAxis) {
      circlesGroup.selectAll("circle").transition()
          .duration(1000)
          .attr("cy", d => newYScale(d[chosenYAxis]));
      circlesGroup.selectAll("text").transition()
          .duration(1000)
          .attr("dy", d => newYScale(d[chosenYAxis]));
      return circlesGroup;
  }

  // function used for updating circles group with new tooltip
  function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

  if (chosenXAxis === "poverty") {
      var xlabel = "Poverty(%)";
  }
  else if (chosenXAxis === "age") {
      var xlabel = "Age(Median)";
  }
  else if (chosenXAxis === "income"){
      var xlabel = "Household Income (Median)";
  }

  if (chosenYAxis === "healthcare") {
      var ylabel = "Lack of Healthcare(%)";
  }
  else if (chosenYAxis ==="smokes") {
      var ylabel = "Smokes(%)";
  }
  else if (chosenYAxis ==="obesity"){
      var ylabel = "Obese (%)"
  }

  var toolTip = d3.tip()
      .attr("class", "d3-tip")
      // .offset([80, -60])
      .html(function(d) {
      return (`${d.state}<br>${xlabel}:${d[chosenXAxis]}
          <br>${ylabel}:${d[chosenYAxis]}`);
      });

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function(data) {
      toolTip.show(data, this);
  })
      // onmouseout event
      .on("mouseout", function(data, index) {
      toolTip.hide(data);
      });

      return circlesGroup;
  }

  // Import Data
  d3.csv("assets/data/data.csv")
  // function(err, healthData){
  //   if (err)throw err;
    .then(function(healthData, err) {
      if (err) throw err;

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
          var xLinearScale = xScale(healthData, chosenXAxis);

          var yLinearScale = yScale(healthData, chosenYAxis);

          // Step 3: Create axis functions
          // ==============================
          var bottomAxis = d3.axisBottom(xLinearScale);
          var leftAxis = d3.axisLeft(yLinearScale);

          // Step 4: Append Axes to the chart
          // ==============================
          var xAxis = chartGroup.append("g")
            .classed("x-axis", true)
            .attr("transform", `translate(0, ${height})`)
            .call(bottomAxis);

          var yAxis = chartGroup.append("g")
            .classed("y-axis", true)
            .call(leftAxis);

          // Step 5: Create Circles
          // ==============================
          var circlesGroup = chartGroup.selectAll("circle")
            .data(healthData)
            .enter()
            .append("g");

          circlesGroup.append("circle")
            .attr("cx", d => xLinearScale(d[chosenXAxis]))
            .attr("cy", d => yLinearScale(d[chosenYAxis]))
            .attr("r", "15")
            .classed("stateCircle", true);

          // State Abbreviations in circles
          circlesGroup.append("text")
            .attr("dx", d =>xLinearScale(d[chosenXAxis]))
            .attr("dy", d => yLinearScale(d[chosenYAxis])+3)
            .attr("font-size", "10px")
            .text(function(d){return d.abbr})
            .classed("stateText", true);

          // Create axes labels
          //x-axis
          var labelsXGroup = chartGroup.append("g")
            .attr("transform", `translate(${width / 2}, ${height + 20})`);

          var povertyLabel = labelsXGroup.append("text")
            .attr("y", 10)
            .attr("value", "poverty")
            .classed("aText", true)
            .classed("active", true)
            .text("In Poverty (%)");

          var ageLabel = labelsXGroup.append("text")
            .attr("y", 30)
            .attr("value", "age")
            .classed("aText", false)
            .classed("inactive", true)
            .text("Age (Median)");

          var incomeLabel = labelsXGroup.append("text")
            .attr("y", 45)
            .attr("value", "income")
            .classed("aText", false)
            .classed("inactive", true)
            .text("Household Income (Median)");

          //y-axis
          var labelsYGroup = chartGroup.append("g")
            .attr("transform", "rotate(-90)");

          var healthcareLabel = labelsYGroup.append("text")
            .attr("y", 0 - margin.left + 40)
            .attr("x", 0 - (height / 2))
            .attr("dy", "2em")
            .attr("value", "healthcare")
            .classed("aText", true)
            .classed("active", true)
            .text("Lacks Healthcare (%)");

          var smokesLabel = labelsYGroup.append("text")
            .attr("y", 0 - margin.left)
            .attr("x", 0 - (height / 2))
            .attr("dy", "3em")
            .attr("value", "smokes")
            .classed("aText", false)
            .classed("inactive", true)
            .text("Smokes (%)");

          var obeseLabel = labelsYGroup.append("text")
            .attr("y", 0 - margin.left)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .attr("value", "obesity")
            .classed("aText", false)
            .classed("inactive", true)
            .text("Obese (%)");

          // updateToolTip function above csv import
          var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

        // x axis labels event listener
        labelsXGroup.selectAll("text")
            .on("click", function() {
            // get value of selection
            var value = d3.select(this).attr("value");
            if (value !== chosenXAxis) {

              // replaces chosenXAxis with value
              chosenXAxis = value;

              // console.log(chosenXAxis)

              // functions here found above csv import
              // updates x scale for new data
              xLinearScale = xScale(healthData, chosenXAxis);

              // updates x axis with transition
              xAxis = renderXAxes(xLinearScale, xAxis);

              // // updates y axis
              //
              // yAxis = renderYAxes(yLinearScale, yAxis);

              // updates circles with new x values
              circlesGroup = renderXCircles(circlesGroup, xLinearScale, chosenXAxis);

              // updates tooltips with new info
              circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

              // changes classes to change bold text
              if (chosenXAxis === "poverty") {
              povertyLabel
                  .classed("active", true)
                  .classed("inactive", false);
              ageLabel
                  .classed("active", false)
                  .classed("inactive", true);
              incomeLabel
                  .classed("active", false)
                  .classed("inactive", true);
              }
              else if (chosenXAxis === "age"){
              povertyLabel
                  .classed("active", false)
                  .classed("inactive", true);
              ageLabel
                  .classed("active", true)
                  .classed("inactive", false);
              incomeLabel
                  .classed("active", false)
                  .classed("inactive", true);
              }
              else if (chosenXAxis === "income"){
              povertyLabel
                  .classed("active", false)
                  .classed("inactive", true);
              ageLabel
                  .classed("active", false)
                  .classed("inactive", true);
              incomeLabel
                  .classed("active", true)
                  .classed("inactive", false);
              }
            }
      });
      // x axis labels event listener
      labelsYGroup.selectAll("text")
          .on("click", function() {
          // get value of selection
          var value = d3.select(this).attr("value");
          if (value !== chosenYAxis) {

            // replaces chosenXAxis with value
            chosenYAxis = value;

            // console.log(chosenXAxis)

            // functions here found above csv import
            // updates x scale for new data
            yLinearScale = yScale(healthData, chosenYAxis);

            // updates x axis with transition
            // xAxis = renderXAxes(xLinearScale, xAxis);

            // updates y axis
            yAxis = renderYAxes(yLinearScale, yAxis);


            // updates circles with new x values
            circlesGroup = renderYCircles(circlesGroup, yLinearScale, chosenYAxis);

            // updates tooltips with new info
            circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

            // changes classes to change bold text
            if (chosenYAxis === "healthcare") {
            healthcareLabel
                .classed("active", true)
                .classed("inactive", false);
            smokesLabel
                .classed("active", false)
                .classed("inactive", true);
            obeseLabel
                .classed("active", false)
                .classed("inactive", true);
            }
            else if (chosenYAxis === "smokes"){
            healthcareLabel
                .classed("active", false)
                .classed("inactive", true);
            smokesLabel
                .classed("active", true)
                .classed("inactive", false);
            obeseLabel
                .classed("active", false)
                .classed("inactive", true);
            }
            else if (chosenYAxis === "obesity"){
            healthcareLabel
                .classed("active", false)
                .classed("inactive", true);
            smokesLabel
                .classed("active", false)
                .classed("inactive", true);
            obeseLabel
                .classed("active", true)
                .classed("inactive", false);
            }
          }
    });


  });
}
makeResponsive();

// Event listener for window resize.
// When the browser window is resized, makeResponsive() is called.
d3.select(window).on("resize", makeResponsive);
