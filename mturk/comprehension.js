// Tangram comprehension task

// to start at beginning
showSlide("instructions");


// disables all scrolling functionality to fix a slide in place on the ipad
document.ontouchmove = function(event){
    event.preventDefault();
};

// ---------------- PARAMETERS ------------------

const numTrials = 10;

//amount of white space between trials
const normalpause = 1500;

//pause after picture chosen
const timeafterClick = 1000;
const nextSound = new WebAudioAPISound("audio/next");

// ---------------- HELPER ------------------

// show slide function
function showSlide(id) {
  $(".slide").hide(); //jquery - all elements with class of slide - hide
  $("#"+id).show(); //jquery - element with given id - show
}

//array shuffle function
function shuffle (o) { //v1.0
  for (var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
  return o;
}

function getCurrentDate () {
  var currentDate = new Date();
  var day = currentDate.getDate();
  var month = currentDate.getMonth() + 1;
  var year = currentDate.getFullYear();
  return (month + "/" + day + "/" + year);
}

function getCurrentTime () {
  var currentTime = new Date();
  var hours = currentTime.getHours();
  var minutes = currentTime.getMinutes();
  var seconds = currentTime.getSeconds();

  if (minutes < 10) minutes = "0" + minutes;
  if(seconds < 10) seconds = "0" + seconds;
  return (hours + ":" + minutes + ":" + seconds);
}

// function readData() {

//   console.log(subid)
//   // Read in random stimuli

//   // var xhr = new XMLHttpRequest(),
//   //     method = "GET",
//   //     url = "https://cdn.jsdelivr.net/gh/ashleychuikay/tangram-comprehension@master/output/random_stims.csv";

//   // xhr.open(method, url, true);

//   // xhr.onreadystatechange = function () {
//   //   if(xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {

//   //     trials = $.csv.toArrays(xhr.responseText);
//   //     console.log(trials)

//   //     testtrial = trials[1]
//   //     console.log(testtrial)

//   //    experiment.start(trials)

//   //   };
//   // };
//   // xhr.send();
  
//   allTrials = new Array;
//   // Read and select stimuli using D3
//   var trials = d3.csv("https://cdn.jsdelivr.net/gh/ashleychuikay/tangram-comprehension@master/output/random_stims.csv").then(function(csv) {
//     trials = csv.filter(function(row) {
//       return row["subject"] == subid
//     });

//     console.log(trials);
//     for (i=0; i<trials.length; i++) {
//       newTrial = Object.values(trials[i]);
//       allTrials.push(newTrial);
//     };
    
//     console.log(allTrials);
//     shuffle(allTrials);
//     experiment.start(allTrials);
//   });
// };


// MAIN EXPERIMENT
class Experiment {
  constructor() {
    // initialize socket to talk to server
    this.subid = "";
    //inputed at beginning of experiment
    this.age = "";
    //inputed at beginning of experiment
    this.trialnum = 0;
    //trial number
    this.order = 1;
    //whether child received list 1 or list 2
    this.target = "";
    //word that child is queried on
    this.leftpic = "";
    //the name of the picture on the left
    this.rightpic = "";
    //the name of the picture on the right
    this.person = "";
    //the identity of original speaker
    this.side = "";
    //whether the child picked the left (L) or the right (R) picture
    this.chosenpic = "";
    //the name of the picture the child picked
    this.response = "";
    //whether the response was the correct response (Y) or the incorrect response (N)
    this.date = getCurrentDate();
    //the date of the experiment
    this.timestamp = getCurrentTime();

    //the time that the trial was completed at 
    this.reactiontime = 0;
  }

  // Check subject id

  start() {
    // initialize connection to server
    this.socket = io.connect();
    
    // begin first trial as soon as we hear back from the server
    this.socket.on('onConnected', function(mongoData) {
      this.subid = mongoData['id'];
      this.trials = mongoData['trials'];
      this.study(0);
    });
  };

  //the end of the experiment
  end () {
    setTimeout(function () {
      $("#stage").fadeOut();
    }, normalpause);
    showSlide("finish");
  };

  //concatenates all experimental variables into a string which
  //represents one "row" of data in the eventual csv, to live in the
  //server
  processOneRow () {
    var dataforRound = this.subid; 
    dataforRound += "," + this.age + "," + this.trialnum + "," + this.target;
    dataforRound += "," + this.leftpic + "," + this.rightpic + "," + this.person;
    dataforRound += "," + this.side + "," + this.chosenpic + "," + this.response;
    dataforRound += "," + this.date + "," + this.timestamp + "," + this.reactiontime + "\n";
    console.log(dataforRound);
    $.post("https://callab.uchicago.edu/experiments/tangram-comprehension/tangramcomprehensionsave.php",
	   {postresult_string : dataforRound});	
  };

  //Comprehension game
  study(counter) {
    var currTrial = this.trials[counter];
    this.trialnum = counter;
    this.startTime = (new Date()).getTime();
    this.target = currTrial['target'];
    this.leftpic = currTrial['leftpic'];
    this.rightpic = currTrial['rightpic'];
    this.person = currTrial['person'];
	  
    $("#blank").click();
    $("#instructions").hide();

    // Create the object table for matcher (tr=table row; td= table data)
    var objects_html = "";
    
    //HTML for the objects on the left & right
    var leftname = "images/" + currTrial['leftpic'] + ".jpg";
    var rightname = "images/" + currTrial['rightpic'] + ".jpg";
    $("#objects").html('\
      <table align = "center" cellpadding="25"> \
        <tr></tr>\
        <tr>\
          <td align="center">\
            <img class="pic" src="' + leftname +  '"alt="' + leftname + '" id= "leftPic"/>\
          </td>\
          <td align="center">\
            <img class="pic" src="' + rightname +  '"alt="' + rightname + '" id= "rightPic"/>\
          </td>\
        </tr>\
      </table>'
    );

    // Play audio
    setTimeout(function () {
      $("#stage").fadeIn();
      setTimeout(function() {
	var audio = new WebAudioAPISound("audio/" + currTrial['audio']);
	audio.play();
      }, 200);    		
    }, 200);

    // Only allow to click after 1.5s
    this.clickDisabled = true;
    setTimeout(function() {
      this.clickDisabled = false;
    }.bind(this),  1500);
    
    $('.pic').on('click touchstart', this.handleClick.bind(this));
  }

  handleClick(event) {
    // don't count click if disabled
    // but disable subsequent clicks once the participant has made their choice
    if (this.clickDisabled)
      return;
    else 
      this.clickDisabled = true; 

    // time the participant clicked picture - the time the trial began
    this.reactiontime = (new Date()).getTime() - this.startTime;

    // Add color to selected picture
    var picID = $(event.currentTarget).attr('id');
    if(picID == "leftPic") {
      this.side = "L";
      this.chosenpic = this.leftpic;
      $("#leftPic").attr("src", "images/"+ this.leftpic +"_color.jpg");
      $("#rightPic").attr("src", "images/"+ this.rightpic +".jpg");
    } else if(picID == "rightPic") {
      this.side = "R";
      this.chosenpic = this.rightpic;
      $("#rightPic").attr("src", "images/"+ this.rightpic +"_color.jpg");
      $("#leftPic").attr("src", "images/"+ this.leftpic +".jpg");
    } else {
      console.error('unknown picID:', picID);
    };
    
    console.log(picID);

    // If the child picked the picture that matched with the target,
    // then they were correct. If they did not, they were not
    // correct.
    if (this.chosenpic === this.target) {
      this.response = "Y";
    } else {
      this.response = "N";
    };

    // Play sound at end of trial
    setTimeout(function() {
      nextSound.play();
    }, 100);

    //Process the data to be saved
    this.processOneRow();

    setTimeout(function() {
      $(".pic").delay().fadeOut(1500);
      document.getElementById("blank").click();
      setTimeout(function() {
	if (this.trialnum + 1 === numTrials) {
	  this.end();
	} else {
	  this.study(this.trialnum + 1);
	}
      }.bind(this), 1000);
    }.bind(this), 1000);
  }
}
