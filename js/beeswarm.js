function beeswarm(i) {

  let legendDiv = '#legend' + (i+1)
  let infoDiv = '#info' + (i+1)
  let chartDiv = '#chart' + (i+1)
  let sourceDiv = '#source' + (i+1)
  var dvcbs;

  var pymChild = null;

  //Load data and config file
  d3.queue()
    .defer(d3.csv, "https://raw.githubusercontent.com/theojolliffe/healthindexlads/main/"+subDomains[i].Measure.replace(/\s/g, '')+".csv")
    .await(makesubDist);

  function makesubDist(error, data) {
    subDist = data;

  }

  function drawGraphic() {

    var svg = d3.select(chartDiv).append('svg'),
      margin = {top: 10, right: 40, bottom: 40, left: 10};

      svg.selectAll("*").remove()
      d3.select(legendDiv).selectAll("*").remove()


      svg.attr("height",dvcbs.essential.svgheight)
      svgwidth =  parseInt(svg.style("width"));

      width = svgwidth - margin.left - margin.right,
      height = svg.attr("height") - margin.top - margin.bottom;

    var formatValue = d3.format(",d");

    var x = d3.scaleLinear()
      .rangeRound([0, width]);

    var g = svg.append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    if(dvcbs.essential.xAxisScale == "auto") {
      x.domain(d3.extent(graphic_data, function(d) { return d.value; }));
    } else {
      x.domain([60,140]);
    }


      var simulation = d3.forceSimulation(graphic_data)
        .force("x", d3.forceX(function(d) { return x(d.value); }).strength(1))
        .force("y", d3.forceY(height / 2))
        .force("collide", d3.forceCollide(6))
        .stop();

      for (var i = 0; i < 120; ++i) simulation.tick();

      if(svgwidth < dvcbs.optional.mobileBreakpoint) {
        numberticks = dvcbs.optional.x_num_ticks_sm_md[0];
      } else {
        numberticks = dvcbs.optional.x_num_ticks_sm_md[1];
      }

      g.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).ticks(numberticks, ".0s"));

    //get unique groups
    var groups = graphic_data.map(function(obj) { return obj.id; });
      groups = groups.filter(function(v,i) { return groups.indexOf(v) == i; });

    createLegend(groups);

    // console.log("graphic_data", graphic_data) // Does this for some reason stop the problem of graphic data being read before being defined?

    var cell = g.append("g")
      .attr("class", "cells")
    .selectAll("g").data(d3.voronoi()
      .extent([[-margin.left, -margin.top], [width + margin.right, height + margin.top]])
      .x(function(d) { return d.x; })
      .y(function(d) { return d.y; })
      .polygons(graphic_data)).enter().append("g");

    cell.append("circle")
      .attr("r", 5)
      .attr("cx", function(d) { return d.data.x; })
      .attr("cy", function(d) { return d.data.y; })
      .attr("class", function(d) { return "cell cell" + d.data.id.split(" ").join("");})
      .attr("fill",function(d){return  dvcbs.essential.colour_palette[groups.indexOf(d.data.id)]});

    cell.append("path")
      .attr("d", function(d) {
        return "M" + d.join("L") + "Z"; })
      .on("mouseover", function(d) {
        d3.select(infoDiv).html("<span id='label'>" + d.data.unique + ":</span> " + formatValue(d.data.value));
      })
      .on("mouseout", function(d) {
        d3.select(infoDiv).html("");
      });


    //add xaxislabel
      svg.append("g")
        .attr("transform", "translate(" + (svgwidth - margin.right + margin.left) +"," + (height+margin.top + margin.bottom) + ")")
      .append("text")
      .attr("id","xaxislabel")
      .attr("text-anchor", "end")
      .text(dvcbs.essential.xAxisLabel);

    //add source
      d3.select(sourceDiv).text("Source: " + dvcbs.essential.sourceText);

    if (pymChild) {
      pymChild.sendHeight();
    }

  }


  if (Modernizr.svg) {
    //load config
    d3.json("configbs.json", function(error, config) {
    dvcbs=config

    setTimeout(function(){
      subDist = subDist.map(d => ({ 'id': d['parents'], 'unique': d['Area Name'], 'value': parseFloat(d['Index value']) }))
      graphic_data = subDist
      graphic_data.forEach((item, i) => {
        if (item.unique==place.name) {
          item.id = place.name
        }
        else if (item.id == selected.parent) {
          item.id = region.name
        }
        else {
          item.id = "Rest of England"
        }
      });
    }, 100);

    setTimeout(function(){
      //use pym to create iframed chart dependent on specified variables
      pymChild = new pym.Child({ renderCallback: drawGraphic});
    }, 200);



    })
  } else {
     //use pym to create iframe containing fallback image (which is set as default)
    pymChild = new pym.Child();
    if (pymChild) {
      pymChild.sendHeight();
    }
  }

  function  createLegend(groups) {

      var legend = d3.select(legendDiv)
        .append('ul')
        .attr('class', 'key')
        .selectAll('g')
        .data(groups)
        .enter()
        .append('li')
        //.style("background-color", function(d , i) { return dvcbs.essential.colour_palette[i]; })
        .attr('class', function(d, i) { return 'key-item key-' + i + ' b '+ d.replace(' ', '-').toLowerCase(); })
        .on("mouseover",function(d, i){
          d3.selectAll(".key-item").style("opacity",0.2);
          d3.selectAll(".key-" + i).style("opacity",1);
          d3.selectAll(".cell").style("opacity",0.2);
          d3.selectAll(".cell" + d.split(" ").join("")).style("opacity",1);
        })
        .on("mouseout",function(d, i){
          d3.selectAll(".key-item").style("opacity",1);
          d3.selectAll(".cell").style("opacity",1);
        })

      legend.append('b').attr("class", "legendBlocks")
        .style("background-color", function(d , i) { return dvcbs.essential.colour_palette[i]; });

      legend.append('label').text(function(d,i) {
        var value = parseFloat(d).toFixed(1);
        return d;
      });

  }

  function type(d) {
    if (!d.value) return;
    d.value = +d.value;
    return d;
  }

}
