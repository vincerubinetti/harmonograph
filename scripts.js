// when page starts
window.onload = function () {
  // set up canvas and drawing objects
  Canvas = document.getElementById("main_canvas");
  Brush = Canvas.getContext("2d");

  // set the dimensions of drawing area
  Canvas.width = 800;
  Canvas.height = 800;

  // centers the canvas view around origin (0,0)
  Brush.setTransform(1, 0, 0, 1, Canvas.width / 2, Canvas.height / 2);

  // for each HTML input control, run UpdateValues() on it when it is changed
  var controls = document.querySelectorAll("input");
  for (var control of controls) control.oninput = UpdateValues;

  // array that will hold all points of the Graph
  Points = [];

  // default values, global vars capitalized
  XFrequency = 1;
  YFrequency = 1.5;
  XPhase = 0;
  YPhase = 0;
  XAmplitude = 300;
  YAmplitude = 200;
  XDamping = 0.015;
  YDamping = 0.03;
  FromCycle = 0;
  ToCycle = 20;
  PointsPerCycle = 100;

  // set controls and draw graph based on default values
  UpdateAllControls();
  UpdateGraph();

  // object to time animation
  AnimationTimer = null;
};

// when a input control in the HTML is changed, this function is run to update the corresponding variable to the value
function UpdateValues() {
  // get the new number value of the HTML element that was just changed
  var value = Number(this.value);

  // if the new/changed value isn't a number (eg, when starting to type a negative number and only the '-' is in so far), dont change anything and exit
  if (value === NaN) return;

  // update slider control if numberbox was changed, and vice versa
  if (this.dataset.partner)
    document.getElementById(this.dataset.partner).value = value;

  switch (this.id) {
    // eg, if the X freq slider or number box was changed, assign "value" to XFrequency
    case "x_frequency":
    case "x_frequency_t":
      XFrequency = value;
      break;
    case "y_frequency":
    case "y_frequency_t":
      YFrequency = value;
      break;
    case "x_phase":
    case "x_phase_t":
      XPhase = value;
      break;
    case "y_phase":
    case "y_phase_t":
      YPhase = value;
      break;
    case "x_amplitude":
    case "x_amplitude_t":
      XAmplitude = value;
      break;
    case "y_amplitude":
    case "y_amplitude_t":
      YAmplitude = value;
      break;
    case "x_damping":
    case "x_damping_t":
      XDamping = value;
      break;
    case "y_damping":
    case "y_damping_t":
      YDamping = value;
      break;
    case "from_cycle":
    case "from_cycle_t":
      FromCycle = value;
      break;
    case "to_cycle":
    case "to_cycle_t":
      ToCycle = value;
      break;
    case "points_per_cycle":
    case "points_per_cycle_t":
      PointsPerCycle = value;
      break;
  }

  UpdateGraph(); // redo graph based on new parameter values
}

// update the HTML input controls based on the current parameter values stored in variables
function UpdateAllControls() {
  document.getElementById("x_frequency").value = XFrequency;
  document.getElementById("x_frequency_t").value = XFrequency;
  document.getElementById("y_frequency").value = YFrequency;
  document.getElementById("y_frequency_t").value = YFrequency;
  document.getElementById("x_phase").value = XPhase;
  document.getElementById("x_phase_t").value = XPhase;
  document.getElementById("y_phase").value = YPhase;
  document.getElementById("y_phase_t").value = YPhase;
  document.getElementById("x_amplitude").value = XAmplitude;
  document.getElementById("x_amplitude_t").value = XAmplitude;
  document.getElementById("y_amplitude").value = YAmplitude;
  document.getElementById("y_amplitude_t").value = YAmplitude;
  document.getElementById("x_damping").value = XDamping;
  document.getElementById("x_damping_t").value = XDamping;
  document.getElementById("y_damping").value = YDamping;
  document.getElementById("y_damping_t").value = YDamping;
  document.getElementById("from_cycle").value = FromCycle;
  document.getElementById("from_cycle_t").value = FromCycle;
  document.getElementById("to_cycle").value = ToCycle;
  document.getElementById("to_cycle_t").value = ToCycle;
  document.getElementById("points_per_cycle").value = PointsPerCycle;
  document.getElementById("points_per_cycle_t").value = PointsPerCycle;
}

// recalculate then redraw graph
function UpdateGraph() {
  CalculateGraph();
  DrawGraph();
}

// calculate all points on the graph based on equations
function CalculateGraph() {
  // clear existing points, start from scratch
  Points = [];

  var point = Math.floor(FromCycle * PointsPerCycle); // starting cycle
  var cycle, x, y;

  while (((cycle = point / PointsPerCycle), cycle <= ToCycle)) {
    // keep stepping forward until current cycle (calculated from current point) reaches the max to be drawn
    // calculate x and y of the point
    // equation is in basic form of sin(phase+time*frequency)*amplitude
    // amplitude is continually decreased by damping as time (cycles) goes on. eg, if damping is 0.1, then amplitude reduces by 10% every cycle
    x =
      Sine(XPhase + cycle * XFrequency) *
      XAmplitude *
      Power(1 - XDamping, cycle);
    y =
      Sine(YPhase + cycle * YFrequency) *
      YAmplitude *
      Power(1 - YDamping, cycle);

    Points.push({ x: x, y: y }); // add x and y to Points[] array
    point++; // step one point forward
  }
}

// wipes canvas clean
function ClearCanvas() {
  Brush.save();
  Brush.setTransform(1, 0, 0, 1, 0, 0);
  Brush.globalAlpha = 1;
  Brush.fillStyle = "white"; // background color
  Brush.fillRect(0, 0, Canvas.width, Canvas.height);
  Brush.restore();
}

// draw Points[] array to HTML canvas to be visible
function DrawGraph() {
  ClearCanvas();

  if (Points.length === 0) return;

  Brush.lineJoin = "round"; // avoids jagged edges/corners when graph curves sharply
  Brush.lineWidth = 2; // line thickness
  Brush.strokeStyle = "#000000"; // line color

  Brush.beginPath(); // start drawing curve
  Brush.moveTo(Points[0].x, Points[0].y); // start at first point

  for (var point of Points) // go through all points in Points[] array
    Brush.lineTo(point.x, point.y); // draw line to next point

  Brush.stroke(); // fill the whole line
}

// helper function to animate changes in parameters. run StartAnimation(fps) to start and StopAnimation() to stop
function AnimateParameters() {
  // animate whatever global variable parameters you want to here
  ToCycle += 0.05;
}

// starts the animate. runs AnimateParameters() and updates graph every fps/1000 seconds.
function StartAnimation(fps) {
  fps = fps || 60;
  AnimationTimer = window.setInterval(function () {
    AnimateParameters();
    UpdateAllControls();
    UpdateGraph();
  }, 1000 / fps);
}

// stops running AnimateParameters()
function StopAnimation() {
  window.clearInterval(AnimationTimer);
  AnimationTimer = null;
}

// turn animation on and off
function ToggleAnimation() {
  if (AnimationTimer !== null) {
    StopAnimation();
    document.getElementById("toggle_animation").innerHTML = "Start Animation";
  } else {
    StartAnimation();
    document.getElementById("toggle_animation").innerHTML = "Stop Animation";
  }
}

// sine function except input is in terms of "cycles", where function starts repeating at cycle = 1 (instead of at 2*pi radians or 360 degrees)
function Sine(cycle) {
  return Math.sin(cycle * 2 * Math.PI);
}

// exponent function
function Power(base, exponent) {
  return Math.pow(base, exponent);
}
