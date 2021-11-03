function lineChart(i) {
        let chartDiv = '#chart' + (i+1)
        var graphic = d3.select(chartDiv);
        var keypoints = d3.select('#keypoints');
        var pymChild = null;

        function drawGraphic(width) {

           var threshold_md = 788;
           var threshold_sm = dvc.optional.mobileBreakpoint;

            //Replace default alt text for screenreader
            if(dvc.essential.screenreadertext != "") {
              d3.select("#screenreadertext").text(dvc.essential.screenreadertext);
            }

            legendLabels = [];

            for (var column in graphic_data[0]) {
                  if (column == 'date') continue;
                  legendLabels.push(column);

             }

            //set variables for chart dimensions dependent on width of #chart1
            if (parseInt(graphic.style("width")) < threshold_sm) {
                            var margin = {	top: 	dvc.optional.margin_sm[0],
                                    right: 	dvc.optional.margin_sm[1],
                                    bottom: dvc.optional.margin_sm[2],
                                    left: 	dvc.optional.margin_sm[3]
                                  };
                            var size = 0;	// used for margin_centre and x_ticks
                            var chart_width = parseInt(graphic.style("width")) - margin.left - margin.right;
                            var height = Math.ceil((chart_width * dvc.optional.aspectRatio_sm[1]) / dvc.optional.aspectRatio_sm[0]) - margin.top - margin.bottom;
                              }

          else if (parseInt(graphic.style("width")) < threshold_md){
                                var margin = {	top: 	dvc.optional.margin_md[0],
                                    right: 	dvc.optional.margin_md[1],
                                    bottom: dvc.optional.margin_md[2],
                                    left: 	dvc.optional.margin_md[3]
                                  };
                            var size = 1;
                            var chart_width = parseInt(graphic.style("width")) - margin.left - margin.right;
                                  var height = Math.ceil((chart_width * dvc.optional.aspectRatio_md[1]) / dvc.optional.aspectRatio_md[0]) - margin.top - margin.bottom;
                            }

             else {
                                var margin = {	top: 	dvc.optional.margin_lg[0],
                                    right: 	dvc.optional.margin_lg[1],
                                    bottom: dvc.optional.margin_lg[2],
                                    left: 	dvc.optional.margin_lg[3]
                                  };
                            var size = 2;
                            var chart_width = parseInt(graphic.style("width")) - margin.left - margin.right;
                                  var height = Math.ceil((chart_width * dvc.optional.aspectRatio_lg[1]) / dvc.optional.aspectRatio_lg[0]) - margin.top - margin.bottom;
                            }


            // clear out existing graphics
          graphic.selectAll("*").remove();
          keypoints.selectAll("*").remove();

            var x = d3.scaleTime()
                .range([0, chart_width]);

            var y = d3.scaleLinear()
                .range([height, 0]);

            x.domain(d3.extent(graphic_data, function(d) { return d.date; }));

            var xAxis = d3.axisBottom(x)
                .tickFormat(function(d,i) {
                    //specify date format for x axis depending on #chart1 width
                    if (parseInt(graphic.style("width")) <= threshold_sm) {
                        var fmt = d3.timeFormat(dvc.optional.xAxisTextFormat_sm_md_lg[0]);
                        return '\u2019' + fmt(d);
                    } else if (parseInt(graphic.style("width")) <= threshold_md){
                        var fmt = d3.timeFormat(dvc.optional.xAxisTextFormat_sm_md_lg[1]);
                        return  fmt(d);
                    } else {
                        var fmt = d3.timeFormat(dvc.optional.xAxisTextFormat_sm_md_lg[2]);
                        return fmt(d);
                    }
                })
            .tickPadding(5)

              //specify number of ticks on x axis and whether 1st and last data point labels are included
              if(parseInt(graphic.style("width"))<threshold_sm){
                  xAxis.tickValues(x.ticks(dvc.optional.x_num_ticks_sm_md_lg[0]).concat( x.domain() ));
              } else if (parseInt(graphic.style("width")) <= threshold_md){
            xAxis.tickValues(x.ticks(dvc.optional.x_num_ticks_sm_md_lg[1])/*.concat( x.domain() )*/);
          } else {
                  xAxis.tickValues(x.ticks(dvc.optional.x_num_ticks_sm_md_lg[2])/*.concat( x.domain() )*/);
              }

            var yAxis = d3.axisLeft(y);


          //specify number or ticks on y axis
          if (parseInt(graphic.style("width")) <= threshold_sm) {
            yAxis.ticks(dvc.optional.y_num_ticks_sm_md_lg[0])
           } else if (parseInt(graphic.style("width")) <= threshold_md){
            yAxis.ticks(dvc.optional.y_num_ticks_sm_md_lg[1])
           } else {
            yAxis.ticks(dvc.optional.y_num_ticks_sm_md_lg[2])
           }

            //gridlines
            var y_axis_grid = function() { return yAxis; }

             var counter;


            var line = d3.line()
                 .defined(function(d){return d.amt!=null;}) // Right you scallywags, I'm going to tell you what this line does. This means that the line will not be drawn between any points a data point is NaN, or whatever function you want
                 .curve(d3.curveLinear)
                .x(function(d) { return x(d.date); })
                .y(function(d) { return y(d.amt); });

            // parse data into columns
            var lines = {};
            for (var column in graphic_data[0]) {
                if (column == 'date') continue;
                lines[column] = graphic_data.map(function(d) {
                    return {
                        'date': d.date,
                        'amt': d[column]
                    };
                });
            }

             // do some code to overwrite blanks with the last known point
             keys=d3.keys(lines)
             for(i=0;i<keys.length;i++){
               lines[keys[i]].forEach(function(d,j){
                 if(d.amt!="null"){
                   counter = j;
                 }else{
                   d.date=lines[keys[i]][counter].date
                   d.amt=lines[keys[i]][counter].amt
                 }
               })
             }


            //y domain calculations	: zero to intelligent max choice, or intelligent min and max choice,  or interval chosen manually
            if (dvc.essential.yAxisScale == "auto_zero_max"){
             var yDomain = [
                    0,
                    d3.max(d3.entries(lines), function(c) {
                      return d3.max(c.value, function(v) {
                        var n = v.amt;
                        return Math.ceil(n);
                      });
                    })
                   ];
          } else if (dvc.essential.yAxisScale == "auto_min_max"){
            var yDomain = [
                    d3.min(d3.entries(lines), function(c) {
                      return d3.min(c.value, function(v) {
                        var n = v.amt;
                        return Math.floor(n);
                      });
                    }),

                    d3.max(d3.entries(lines), function(c) {
                      return d3.max(c.value, function(v) {
                        var n = v.amt;
                        return Math.ceil(n);
                      });
                    })
                  ];
          } else {
             var yDomain = dvc.essential.yAxisScale;
            }

            y.domain(yDomain);

            //create svg for chart
         // var legend = d3.select(chartDiv).append('svg')
          // 			//.attr("width", chart_width + margin.left + margin.right)
          // 			//.attr("height", margin.bottom +330) //height + margin.top + margin.bottom +30)
          // 			// .append("g")
          // 			// .attr("id", "legend");


            //var svg = d3.select(chartDiv).append('svg')
            var svg = d3.select(chartDiv).append('svg')
                  .attr("id","chart")
                  .style("background-color","#fff")
                  .attr("width", chart_width + margin.left + margin.right)
                  .attr("height", height + margin.top + margin.bottom )  //+30)
                  .append("g")
                  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

              svg.append("rect")
                .style("fill", "#fff")
                .attr("width", chart_width)
                .attr("height", height);

                svg.append('g')
                    .attr('class', 'y axis')
                    .call(yAxis);

                svg.append('g')
                    .attr('class', 'y grid')
                    .call(y_axis_grid()
                        .tickSize(-chart_width, 0, 0)
                        .tickFormat('')
                    );

              //y axis label
                 svg.append("text")
                  //.attr('class', 'unit')
                  .attr('transform','translate(' + -margin.left + ',-10)') // " + eval(-margin.top + (lineNo+1)*20) + "
                  .attr("font-size","14px")
                    .attr("fill","#666")
                  .text(function(d,i) { return dvc.essential.yAxisLabel});


              //create x axis, if y axis doesn't start at 0 drop x axis accordingly
              svg.append('g')
                    .attr('class', 'x axis')
                    .attr('transform', function(d){
                          if(yDomain[0] != 0){
                        return 'translate(0,' + (height + 30) + ')'
                      } else {
                        return 'translate(0,' + height  + ')'
                      }
                  })
                    .call(xAxis);

            //create icon to symbolise break in y axis if required
            if(yDomain[0] > 0 && dvc.essential.yAxisBreak == true){
              var paths = svg.append("defs")
                    .append("g")
                    .attr("id","icon")
                    .append("g");

                  paths.append("polyline")
                     .attr("points", "2.881,9.54 7.94,5.061 12.341,9.54 17.77,5.061")
                     .attr("stroke", "#666")
                     .attr("fill", "none")
                  paths.append("polyline")
                    .attr("points", "2.881,14.54 7.94,10.061 12.341,14.54 17.77,10.061")
                    .attr("stroke", "#666")
                    .attr("fill", "none");

                //specify position of icon
                svg.append("g").attr("id","iconpath")
                    .attr("transform","translate(-10,3)")
                    .append("use")
                    .attr("xlink:href","#icon")
                    .attr("x", x(x.domain()[0]))
                    .attr("y", function(){
                      if (parseInt(graphic.style("width")) < threshold_sm) {
                        return y(dvc.essential.yAxisBreak_sm_md_lg[0])
                      } else if (parseInt(graphic.style("width")) < threshold_md){
                        return y(dvc.essential.yAxisBreak_sm_md_lg[1])
                      } else {
                        return y(dvc.essential.yAxisBreak_sm_md_lg[2])
                      }
                    });
            }

            //create centre line if required
            if (dvc.optional.centre_line == true){
              svg.append("line")
                //.attr("id","centreline")
                .attr("stroke", "#CCC")
                .attr("stroke-width", 3)
                .attr('y1',y(dvc.optional.centre_line_value))
                .attr('y2',y(dvc.optional.centre_line_value))
                .attr('x1',0)
                .attr('x2',chart_width);
            } else if(yDomain[0] <0){
              svg.append("line")
                //.attr("id","centreline")
                .attr("stroke", "#CCC")
                .attr("stroke-width", 3)
                .attr('y1',y(0))
                .attr('y2',y(0))
                .attr('x1',0)
                .attr('x2',chart_width);
            }


            //create vertical line if required
            if (dvc.optional.vertical_line == true){

              dvc.optional.annotateLineX1_Y1_X2_Y2.forEach(function(d,i) {

              svg.append("line")
                .attr('x1',x(d3.timeParse(dvc.essential.dateFormat)(dvc.optional.annotateLineX1_Y1_X2_Y2[i][0][0])))
                .attr('x2',x(d3.timeParse(dvc.essential.dateFormat)(dvc.optional.annotateLineX1_Y1_X2_Y2[i][1][0])))
                .attr('y1',y(dvc.optional.annotateLineX1_Y1_X2_Y2[i][0][1]))
                .attr('y2',y(dvc.optional.annotateLineX1_Y1_X2_Y2[i][1][1]))
                .style('stroke', '#888')
                .style('stroke-width', 2);
                  //.style('stroke-dasharray', '5 5');   ,dash px,space px


              })
            }

            //create rectangle
            if (dvc.optional.annotateRect == true){

              dvc.optional.annotateRectX_Y.forEach(function(d,i) {

              svg.append("rect")
                .attr('x',x(d3.timeParse(dvc.essential.dateFormat)(dvc.optional.annotateRectX_Y[i][0][0]))  )
                .attr('y',y(dvc.optional.annotateRectX_Y[i][0][1]))
                .attr('height',y( dvc.optional.annotateRectX_Y[i][1][1] ) - y(dvc.optional.annotateRectX_Y[i][0][1])  )
                .attr('width',x(d3.timeParse(dvc.essential.dateFormat)(dvc.optional.annotateRectX_Y[i][1][0])) - x(d3.timeParse(dvc.essential.dateFormat)(dvc.optional.annotateRectX_Y[i][0][0])))
                .style('fill', dvc.optional.lineColor_opcty[i][0] )
                .style('stroke-width', 2)
                .style('opacity', dvc.optional.lineColor_opcty[i][1] );

              })
            }

            //create lines
              svg.append('g').selectAll('path')
                  .data(d3.entries(lines))
                  .enter()
                  .append('path')
                      //.attr('class', 'line')
                .style("stroke", function(d,i){ return dvc.essential.colour_palette[i]; })
                .style("fill", 'none')
                .style("stroke-width", 3.5)
                .style("stroke-linecap", 'round')
                .style("stroke-linejoin", 'round')
                      .attr('d', function(d) {
                          return line(d.value);
                      });



            // add markers
            if (parseInt(graphic.style("width")) > threshold_sm && dvc.optional.lineMarkers == true){

              for (var column in graphic_data[0]) {
                    if (column == 'date') continue;

                               svg.append("g")
                                .selectAll("circles")
                                .data(lines[column]) // raw data
                                .enter()
                                .append('circle')
                                .style('fill', function(d){ return dvc.essential.colour_palette[legendLabels.indexOf(column)]; })
                                .style('stroke', function(d){ return dvc.essential.colour_palette[legendLabels.indexOf(column)]; })
                                .style('stroke-width', 1)
                                .attr("cx", function(d){
                                              return x(d.date);
                                            })
                                .attr("cy", function(d){
                                              return y(d.amt);
                                            })
                                .attr("r", function(d){if(d[column]!=0){return 3}else{return 0}});
                              }

                            } // ends if

             // circle annotations
                 if(dvc.essential.circles==true){
                   dvc.essential.annotationCXCY.forEach(function(d,i){
                     svg.append("circle")
                       .attr("cx",x(d3.timeParse(dvc.essential.dateFormat)(dvc.essential.annotationCXCY[i][0])))
                       .attr("cy",y(dvc.essential.annotationCXCY[i][1]))
                       .attr("r",6)
                       .attr("fill",dvc.essential.annotationColour)

                     svg.append("text")
                     .attr("x",x(d3.timeParse(dvc.essential.dateFormat)(dvc.essential.annotationCXCY[i][0]))-20)
                     .attr("y",y(dvc.essential.annotationCXCY[i][1])-15)
                     .text(dvc.essential.annotationCXCY[i][0])
                   })
                 } // ends if

          writeAnnotation();

          //create link to source
           d3.select('#source')
             .text('Source: ' + dvc.essential.sourceText);

      function writeAnnotation(){

        if (parseInt(graphic.style("width")) < threshold_sm) {

          dvc.essential.annotationBullet.forEach(function(d,i) {

              d3.select("#keypoints").append("svg")
                .attr("width","15px")
                .attr("height","15px")
                .attr("class","circles")
                .append("circle")
                .attr("class", "annocirc" + (i))
                .attr("r", "2")
                .attr('cy',"9px")
                .attr("cx", "10px");

              d3.select("#keypoints")
                .append("p")
                .style("font-size","14px")
                .style("font-weight",400)
                .text(dvc.essential.annotationBullet[i]);

              })// end foreach

          }
          else {

          annotations = dvc.essential.annotationsChart;

          // For elements with time series
          for(i=0; i < annotations.length  ;i++) {
            annotations[i].xVal = new Date(annotations[i].xVal);
          }

           var swoopy = d3.swoopyDrag()
                  .x(function(d){ return x(d.xVal) })
                  .y(function(d){ return y(d.yVal) })
                  .draggable(dvc.essential.draggable)
                  .annotations(annotations);


          var swoopySel = svg.append('g').attr("class","annotations").call(swoopy); // Expected number, "translate()". error for each annotation

          svg.append('marker')
            .attr('id', 'arrow')
            .attr('viewBox', '-10 -10 20 20')
            .attr('markerWidth', 20)
            .attr('markerHeight', 20)
            .attr('orient', 'auto')
            .append('path')
            .attr('d', 'M-6.75,-6.75 L 0,0 L -6.75,6.75')
            .attr('fill','#808080');

          swoopySel.selectAll('path').attr('marker-end', 'url(#arrow)');


          d3.selectAll(".annotations path")
            .style("stroke","#808080")
            .attr("fill","none");

          swoopySel.selectAll('text')
            .attr('font-size','13px')
            .attr('font-size','13px')
              .attr("font-size",  "13px")
              .attr("font-weight", 500)
            .each(function(d,i){
              d3.select(this)
                .text('')                        //clear existing text
                .tspans(d3.wordwrap(d.text, dvc.essential.wordwrap[i])) //wrap after xx char
              });


          swoopySel.selectAll('text')
            .each(function(d,i){
              d3.select(this).selectAll('tspan')
              .attr("text-anchor",dvc.essential.annoAlign[i]);
              });
            } // end else ...

          return;

     }// end function writeAnnotation()

     // always create a legend on mobile. when not on mobile, only create a legend if not using direct line labeling.
     var onMobile = parseInt(graphic.style("width")) < dvc.optional.mobileBreakpoint;
     if (!dvc.essential.directLabeling || onMobile) {
      createLegend();
     }
     else {
       createLineLabels();
     }

     function createLegend(){


             legenditems = d3.select(chartDiv)
               .insert("div","#chart")
               .attr("id","legend");

             legendLabels.forEach(function(d, i) {

               legenditem = legenditems.append("div")
                 .attr("class","legenditem");


               legenditem.append("div").attr("class","legendline").style("width","20px").style("height","3.5px").style("background-color",dvc.essential.colour_palette[i]);
               legenditem.append("p").attr("class","legendtext").text(d);


             });

          }// end function createLegend()


           function createLineLabels(){
             for (var column in graphic_data[0]) {
               if (column == 'date') continue;
               svg.append("text")
                 // place the line labels to the right of the lines and add label adjustment from config
                 .attr("transform", function(d) {
                   var xcoord = x(graphic_data[graphic_data.length-1]["date"]) + dvc.essential.directLabelingAdjust[legendLabels.indexOf(column)]['x']
                   var ycoord = y(graphic_data[graphic_data.length-1][column]) + dvc.essential.directLabelingAdjust[legendLabels.indexOf(column)]['y'];
                   return "translate(" + xcoord + "," + ycoord + ")";
                 })
                 .attr("x", 10)
                 .attr("dy", ".35em")
                 .attr("class", "label")
                 .style("fill", dvc.essential.colour_palette_labels[legendLabels.indexOf(column)])
                 .text(column)
                 .call(wrap, margin.right)
             } // end for loop running through data columns
           } // end function createLineLabels()

           function wrap(text, width) {
             text.each(function() {
               var text = d3.select(this),
                   words = text.text().split(/\s+/).reverse(),
                   word,
                   line = [],
                   lineNumber = 0,
                   lineHeight = 1.1, // ems
                   y = text.attr("y") +5,
                   dy = 0,
                   tspan = text.text(null).append("tspan").attr("x", 5).attr("y", y).attr("dy", dy + "em");
               while (word = words.pop()) {
                 line.push(word);
                 tspan.text(line.join(" "));
                 if (tspan.node().getComputedTextLength() > width) {
                   line.pop();
                   tspan.text(line.join(" "));
                   line = [word];
                   tspan = text.append("tspan").attr("x", 5).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
                 }
               }
             });
           }

          // css fix
          d3.selectAll("path").attr("fill","none");

          d3.selectAll("text").attr("font-family","'Open Sans', sans-serif");

          d3.selectAll(".x text").attr("font-size","14px").attr("fill","#666");
          d3.selectAll(".y text").attr("font-size","14px").attr("fill","#666");

          d3.selectAll(".y line")
              .attr("stroke","#CCC")
              .attr("stroke-width","1px")
              .style("shape-rendering","crispEdges");

          d3.selectAll(".x line")
            .attr("stroke","#CCC")
            .attr("stroke-width","1px")
            .style("shape-rendering","crispEdges");


          // save SVG
          d3.select("#buttonid").on("click",function(){saveSvgAsPng(document.getElementById("chart"), "diagram.png")});

          //use pym to calculate chart dimensions
            if (pymChild) {
                pymChild.sendHeight();
            }

      }  // ends draw graphic



      //check whether browser can cope with svg
        if (Modernizr.svg) {

              let placeData = place.data[subDomains[i].Domain].subdomains[subDomains[i].Subdomain].total
              let englandData = england.data[subDomains[i].Domain].subdomains[subDomains[i].Subdomain].total
              let regionData = region.data[subDomains[i].Domain].subdomains[subDomains[i].Subdomain].total
              graphic_data = []
              Object.keys(placeData).forEach((item) => {
                var obj = {};
                obj['date'] = item;
                obj[place.name] = placeData[item].value;
                obj[region.name] = regionData[item].value;
                obj["England"] = englandData[item].value;
                graphic_data.push(obj);
              });

              graphic_data.forEach(function(d) {
                d.date = d3.timeParse("%Y")(d.date);
              });

              //use pym to create iframed chart dependent on specified variables
              pymChild = new pym.Child({ renderCallback: drawGraphic});


        } else {
           //use pym to create iframe containing fallback image (which is set as default)
           pymChild = new pym.Child();
          if (pymChild) {
                pymChild.sendHeight();
            }
        }
};
