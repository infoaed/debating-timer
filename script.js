const FULL_DASH_ARRAY = 283;
const WARNING_THRESHOLD = 30;
const ALERT_THRESHOLD = 15;

const COLOR_CODES = {
  info: {
    color: "green"
  },
  warning: {
    color: "orange",
    threshold: WARNING_THRESHOLD
  },
  alert: {
    color: "red",
    threshold: ALERT_THRESHOLD
  }
};

let timeLimit = 0;
let timePassed = 0;
let timeLeft = timeLimit;
let timerInterval = null;
let remainingPathColor = COLOR_CODES.info.color;
let party = true;
let forceParty = true;
let switchAfter = true;

let rounds = [{},{}];

document.getElementById("app").innerHTML = `
<div class="base-timer">
  <svg class="base-timer__svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <g class="base-timer__circle">
      <circle class="base-timer__path-elapsed" cx="50" cy="50" r="45"></circle>
      <path
        id="base-timer-path-remaining"
        stroke-dasharray="283"
        class="base-timer__path-remaining ${remainingPathColor}"
        d="
          M 50, 50
          m -45, 0
          a 45,45 0 1,0 90,0
          a 45,45 0 1,0 -90,0
        "
      ></path>
    </g>
  </svg>
  <span id="base-timer-label" class="base-timer__label">${formatTime(
    timeLeft
  )}</span>
</div>
`;

function paintParty() {
  element = document.getElementById(party ? "yes" : "no");  
  element.classList.add("active");
  element = document.getElementById(!party ? "yes" : "no");
  element.classList.remove("active");
}

function setParty(which) {
  party = which;
  paintParty();
  forceParty = true;
}

function log(text) {    
    element = document.getElementById(party ? "yestext" : "notext");

    if( element != null)
      element.innerHTML = text + "<br>" + element.innerHTML; 
}

function clearTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
  if(!forceParty && switchAfter) party = !party;
  paintParty();
}

function onTimesUp() {
  sample = document.getElementById("beep");
  //sample = document.getElementById("timeup-short");
  //sample = document.getElementById("timeup");
  sample.play();

  clearTimer();
}

function resetTimer() {
  if (timePassed!=0) {
    sample = document.getElementById("in");
    sample.play();
    timeLeft = 0;
    timePassed = 0;
    clearInterval(timerInterval);
    invertColor(null);

    log("\n---\n");
    party = !party; 
    log("\n---\n");
    
    rounds = [{},{}];
    party = true;
    forceParty = true;

    document.getElementById("base-timer-label").innerHTML = formatTime(timeLeft);
    setCircleDasharray();
    setRemainingPathColor(999);

    element = document.getElementById("playpause");
    element.classList.remove("play");
    element.classList.add("pause");
  }
}

function pauseTimerOnOff() {
  if(timeLeft > 0) {  
    if (timerInterval != null) {
      clearInterval(timerInterval);
      timerInterval = null;

      sample = document.getElementById("in");
      sample.play();

      element = document.getElementById("playpause");

      element.classList.remove("pause");
      element.classList.add("play");

      //document.getElementById("pause").innerHTML = "▶";

      //element.style.backgroundColor = 'rgb(79,58,60)';
      //element.style.color = 'orange';

      log("/.../");
      
    } else {

      sample = document.getElementById("out");
      sample.play();

      element = document.getElementById("playpause");

      element.classList.remove("play");
      element.classList.add("pause");

      //document.getElementById("pause").innerHTML = "⏸";

      //element.style.color = 'white';
      //element.style.backgroundColor = 'rgb(24, 14, 9)';
      
      //log("(jätkub)");

      contTimer();
    }
  }
}

function startTimer(element) {
  timePassed = 0;
  timeLeft = timeLimit = element.dataset.interval;
  
  if(timerInterval != null) clearTimer();
  paintParty();
  
  let max = 1;
  let name = element.dataset.name;
  if(element.dataset.max) max = element.dataset.max;
  
  switchAfter = element.dataset.switch;

  if (name in rounds[+party]) rounds[+party][name]++;
  else rounds[+party][name] = 1;

  log(formatTime(timeLeft) + ` (${name}` + (rounds[+party][name] == 1 && name != 'T' && name != 'X' ? ')' : `×${rounds[+party][name]})`));
    
  invertColor(element);
  forceParty = false;

  lmn = document.getElementById("playpause");
  lmn.classList.remove("play");
  lmn.classList.add("pause");

  sample = document.getElementById("start");
  sample.play();
  
  runTimer();
}

function contTimer() {
  timePassed = timePassed += 1;
  timeLeft = timeLimit - timePassed;
  document.getElementById("base-timer-label").innerHTML = formatTime(timeLeft);
  setCircleDasharray();
  setRemainingPathColor(timeLeft);


  if (timeLeft === 0) {
    onTimesUp();
  }
    
  timerInterval = setInterval(() => {
    timePassed = timePassed += 1;
    timeLeft = timeLimit - timePassed;
    document.getElementById("base-timer-label").innerHTML = formatTime(
      timeLeft
    );
    setCircleDasharray();
    setRemainingPathColor(timeLeft);

    if (timeLeft === 0) {
      onTimesUp();
    }
  }, 1000);
}

function runTimer() {
  document.getElementById("base-timer-label").innerHTML = formatTime(timeLeft);
  setCircleDasharray();
  setRemainingPathColor(timeLeft);
    
  timerInterval = setInterval(() => {
    timePassed = timePassed += 1;
    timeLeft = timeLimit - timePassed;
    document.getElementById("base-timer-label").innerHTML = formatTime(
      timeLeft
    );
    setCircleDasharray();
    setRemainingPathColor(timeLeft);

    if (timeLeft === 0) {
      onTimesUp();
    }
  }, 1000);
}

function formatTime(time) {
  const minutes = Math.floor(time / 60);
  let seconds = time % 60;

  if (seconds < 10) {
    seconds = `0${seconds}`;
  }

  return `${minutes}:${seconds}`;
}


function invertColor(element) {
  var els = document.getElementsByClassName('button');
  for (var i = 0; i < els.length; i++) {
    els[i].style.backgroundColor = 'rgb(24, 14, 9)';
    els[i].style.color = 'white';
  }

  if(element != null) {
    element.style.backgroundColor = 'white';
    element.style.color = 'rgb(24, 14, 9)';
  }
}

function setRemainingPathColor(timeLeft) {
  const { alert, warning, info } = COLOR_CODES;


  if (timeLeft > warning.threshold) {
    document
      .getElementById("base-timer-path-remaining")
      .classList.remove(warning.color);
    document
      .getElementById("base-timer-path-remaining")
      .classList.remove(alert.color);
    document
      .getElementById("base-timer-path-remaining")
      .classList.add(info.color);
  } else if (timeLeft <= alert.threshold) {
    document
      .getElementById("base-timer-path-remaining")
      .classList.remove(warning.color);
    document
      .getElementById("base-timer-path-remaining")
      .classList.add(alert.color);
  } else if (timeLeft <= warning.threshold) {
    document
      .getElementById("base-timer-path-remaining")
      .classList.remove(info.color);
    document
      .getElementById("base-timer-path-remaining")
      .classList.add(warning.color);
  }

  if (timeLeft <= 4 &&  timeLeft > 0) {
      sample = document.getElementById("beep");
      sample.play();
  }

  if (timeLeft == 15) {
      sample = document.getElementById("warning");
      sample.play();
  }
  
}

function calculateTimeFraction() {
  const rawTimeFraction = timeLeft / timeLimit;
  return rawTimeFraction - (1 / timeLimit) * (1 - rawTimeFraction);
}

function setCircleDasharray() {
  const circleDasharray = `${(
    calculateTimeFraction() * FULL_DASH_ARRAY
  ).toFixed(0)} 283`;
  document
    .getElementById("base-timer-path-remaining")
    .setAttribute("stroke-dasharray", circleDasharray);
}
