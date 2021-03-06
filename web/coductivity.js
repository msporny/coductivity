(function($) 
{
   // create root coductivity object if needed
   window.coductivity = window.coductivity || {};
   
   // local alias for use by applications
   var coductivity = window.coductivity;

   /**
    * Plots all of the committers on record.
    */
   coductivity.plotAll = function()
   {
      $("#graphs").append("<h1>All Productivity</h1><div id=\"all\"></div>");
      coductivity.plot("all");

      for(var key in data)
      {
         if(key != "all")
         {
            $("#graphs").append("<h1>" + key + "</h1>" +
               "<div id=\"" + key + "\"></div>");
            coductivity.plot(key);
         }
      }
   }

   /**
    * Plots a particular committer 
    */
   coductivity.plot = function(committer)
   {
      /* Scales and sizing. */
      var cdata = data[committer]
      var w = 1024,
          h1 = 500,
          h2 = 30,
          x = pv.Scale.linear(start, end).range(0, w),
          y = pv.Scale.linear(0, 
             pv.max(cdata, function(d) { return d.y; })).range(0, h2);

      /* Interaction state. Focus scales will have domain set on-render. */
      var i = {x:200, dx:100},
          fx = pv.Scale.linear().range(0, w),
          fy = pv.Scale.linear().range(0, h1);

      /* Root panel. */
      console.log("Plotting", committer);
      var vis = new pv.Panel()
          .canvas(committer)
          .width(w)
          .height(h1 + 20 + h2)
          .bottom(20)
          .left(50)
          .right(20)
          .top(5);

      /* Focus panel (zoomed in). */
      var focus = vis.add(pv.Panel)
          .def("init", function() {
              var d1 = x.invert(i.x),
                  d2 = x.invert(i.x + i.dx),
                  dd = cdata.slice(
                      Math.max(0, pv.search.index(cdata, d1, function(d) { return d.x; }) - 1),
                      pv.search.index(cdata, d2, function(d) { return d.x; }) + 1);
              fx.domain(d1, d2);
              fy.domain(y.domain());
              return dd;
            })
          .top(0)
          .height(h1);

      /* X-axis ticks. */
      focus.add(pv.Rule)
          .data(function() { return fx.ticks(); })
          .left(fx)
          .strokeStyle("#eee")
        .anchor("bottom").add(pv.Label)
          .text(fx.tickFormat);

      /* Y-axis ticks. */
      focus.add(pv.Rule)
          .data(function() { return fy.ticks(10); })
          .bottom(fy)
          .strokeStyle(function(d) { return d ? "#aaa" : "#000"; })
        .anchor("left").add(pv.Label)
          .text(fy.tickFormat);

      /* Focus area chart. */
      focus.add(pv.Panel)
          .overflow("hidden")
        .add(pv.Area)
          .data(function() { return focus.init(); })
          .left(function(d) { return fx(d.x); })
          .bottom(1)
          .height(function(d) { return fy(d.y); })
          .fillStyle("lightsteelblue")
        .anchor("top").add(pv.Line)
          .fillStyle(null)
          .strokeStyle("steelblue")
          .lineWidth(2);

      /* Context panel (zoomed out). */
      var context = vis.add(pv.Panel)
          .bottom(0)
          .height(h2);

      /* X-axis ticks. */
      context.add(pv.Rule)
          .data(x.ticks())
          .left(x)
          .strokeStyle("#eee")
        .anchor("bottom").add(pv.Label)
          .text(x.tickFormat);

      /* Y-axis ticks. */
      context.add(pv.Rule)
          .bottom(0);

      /* Context area chart. */
      context.add(pv.Area)
          .data(cdata)
          .left(function(d) { return x(d.x); })
          .bottom(1)
          .height(function(d) { return y(d.y); })
          .fillStyle("lightsteelblue")
        .anchor("top").add(pv.Line)
          .strokeStyle("steelblue")
          .lineWidth(2);

      /* The selectable, draggable focus region. */
      context.add(pv.Panel)
          .data([i])
          .cursor("crosshair")
          .events("all")
          .event("mousedown", pv.Behavior.select())
          .event("select", focus)
        .add(pv.Bar)
          .left(function(d) { return d.x; })
          .width(function(d) { return d.dx; })
          .fillStyle("rgba(255, 128, 128, .4)")
          .cursor("move")
          .event("mousedown", pv.Behavior.drag())
          .event("drag", focus);

      vis.render();
   };
   
})(jQuery);

