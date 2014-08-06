App = Ember.Application.create();

App.ApplicationRoute = Ember.Route.extend({
  model: function(){
    // Ember.A() just a way to define an Ember
    return Ember.A([
      Ember.Object.create({'letter':'Manual', 'num':1 }),
      Ember.Object.create({'letter':'Automating', 'num':1, 'color':'red' }),
      Ember.Object.create({'letter':'Coverage', 'num':1,'color':'yellow' }),      
      Ember.Object.create({'letter':'Round', 'num':1}),
      Ember.Object.create({'letter':'Year', 'num':1 }),
      Ember.Object.create({'letter':'Round"', 'num':1}),
      Ember.Object.create({'letter':'Year"', 'num':1 }),      
    ]);
  }
});

App.ApplicationController = Ember.ArrayController.extend({
  savingHoursPerRound:function(){
    return this.get("mHours")-this.get("aHours");
  }.property("mHours", "aHours"),  

  csavingHoursPerRound:function(){
    return (this.get("mHours")-this.get("aHours"))*this.get("coverage");
  }.property("mHours", "aHours", "coverage"),    

  savingHoursPerYear:function(){
    return this.get("rounds")*this.get("savingHoursPerRound");
  }.property("rounds","savingHoursPerRound"),    

    csavingHoursPerYear:function(){
    return this.get("rounds")*this.get("savingHoursPerRound")*this.get("coverage");
  }.property("rounds","savingHoursPerRound",'coverage'),    

  updateChartObserver: function(){
    data = this.get('model');
    console.log(this.get("savingHours"));
    console.log(this.get("Do updateChartObserver"));
    data[0].set("num", this.get("mHours"));
    data[1].set("num", this.get("aHours"));
    data[2].set("num", this.get("coverage"));
    data[3].set("num", this.get("savingHoursPerRound"));
    data[4].set("num", this.get("savingHoursPerYear"));
    data[5].set("num", this.get("savingHoursPerRound")*this.get("coverage"));
    data[6].set("num", this.get("savingHoursPerYear")*this.get("coverage"));    
  }.on('didInsertElement').observes('mHours','aHours','coverage' ,'rounds'),

  actions: {
    addData: function(){
      console.log(this.get("mHours"));
      // data = this.get('model');
      d = Ember.Object.create({ 'letter':'X', 'num':3702 }) ;
      // d.incrementProperty('num', 300);
      this.get('model').push(d);
      console.log(this.get('model'));
      // console.log(data[0]);
      // console.log(data[1]);
      // data[0].set("num", this.get("mHours"))
      // this.set('data.@each', true);
    }.observes("mHours"),
    removeObject: function(letter){
     this.get('content').removeObject(letter);
    },
    
    changeNumbers: function(){
      this.get('content').forEach(function(item){
        if (item.get('num') % 2 == 1){
        item.decrementProperty('num', 200);
        } else {
          item.incrementProperty('num', 100);
        }
      });
    }
  }
});


App.BarChartComponent = Ember.Component.extend({
  tagName: 'svg',
  attributeBindings: 'width height'.w(),

  draw: function(){
    tip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-10, 0])
    .html(function(d) { return '<span>'+ d.letter + ':' + d.num + 'Hours</span> ' ; });
    var margin = {top: 100, right: 20, bottom: 30, left: 40};
    // var width = 1200 ;
    // var width = 1200 - margin.left - margin.right;
    var width = this.get('width') - margin.left - margin.right;
    var height = this.get('height') - margin.top - margin.bottom;
    // var height = 1500 - margin.top - margin.bottom;
    var data = this.get('data');
    var svg = d3.select(this.get('element')).call(tip);
    var p = [20, 50, 30, 1];
    var x = d3.scale.ordinal().rangeRoundBands([0, width - p[1] - p[3]], 0.6);
    var y = d3.scale.linear().range([height, 0]);
    var xAxis = d3.svg.axis().scale(x).orient('bottom');
    var yAxis = d3.svg.axis().scale(y).orient('left');


    x.domain(data.map(function(d) { return d.letter; }));
    // y0=d3.max(data, function(d) { return d.num; })
    y.domain([0, d3.max(data, function(d) { return d.num; })]);
    // y.domain([-y0,y0]).nice();
    svg = svg.append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
      .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Hours");

    svg.call(tip)
    svg.selectAll(".bar")
        .data(data)
      .enter()
        .append("rect")
        .attr("class", "bar")
        .style("fill", function(d) { return d.color; })
        .attr("x", function(d) { return x(d.letter); })
        .attr("width", x.rangeBand())
        .attr("y", function(d) { return y(d.num); })
        // .attr("height", function(d) { return height - y(d.num); })

        .attr("height", function(d) { return (height - y(d.num)); })
        .on('mouseover', tip.show)
        // .on("mousemove", function(){return tooltip.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px");})
        // .on("mousemove", function(){return tooltip.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px");})
        .on('mouseout', tip.hide)

        // .attr('class', function(d) { return d.letter; })
        /********* add class name on bar **********/
    /* Initialize tooltip */
    /* Invoke the tip in the context of your visualization */

  }.on('didInsertElement'),
  
  redraw: function(){    
    var svg = d3.select(this.get('element'));
    svg.selectAll('*').remove();
    this.draw();
  }.observes("data.@each.num")
});
