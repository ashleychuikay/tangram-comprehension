// Tangram comprehension task

// to start at beginning
showSlide("instructions");


// disables all scrolling functionality to fix a slide in place on the ipad
document.ontouchmove = function(event){
    event.preventDefault();
};

// ---------------- PARAMETERS ------------------

var numTrials = 10;

//amount of white space between trials
var normalpause = 1500;

//pause after picture chosen
var timeafterClick = 1000;

// ---------------- HELPER ------------------

// show slide function
function showSlide(id) {
  $(".slide").hide(); //jquery - all elements with class of slide - hide
  $("#"+id).show(); //jquery - element with given id - show
}


//array shuffle function
shuffle = function (o) { //v1.0
    for (var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
}

getCurrentDate = function() {
	var currentDate = new Date();
	var day = currentDate.getDate();
	var month = currentDate.getMonth() + 1;
	var year = currentDate.getFullYear();
	return (month + "/" + day + "/" + year);
}

getCurrentTime = function() {
	var currentTime = new Date();
	var hours = currentTime.getHours();
	var minutes = currentTime.getMinutes();
	var seconds = currentTime.getSeconds();

	if (minutes < 10) minutes = "0" + minutes;
	if(seconds < 10) seconds = "0" + seconds;
	return (hours + ":" + minutes + ":" + seconds);
}

//for trials
var wordList = [];
var allImages = [];
var trialAudio = [];
var personList = [];


function readData() {

	console.log(subid)
	// Read in random stimuli

	// var xhr = new XMLHttpRequest(),
	//     method = "GET",
	//     url = "https://cdn.jsdelivr.net/gh/ashleychuikay/tangram-comprehension@master/output/random_stims.csv";

	// xhr.open(method, url, true);

	// xhr.onreadystatechange = function () {
	//   if(xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {

	//     trials = $.csv.toArrays(xhr.responseText);
	//     console.log(trials)

	//     testtrial = trials[1]
	//     console.log(testtrial)

	//    experiment.start(trials)

	//   };
	// };
	// xhr.send();
	
	allTrials = new Array;
	// Read and select stimuli using D3
	var trials = d3.csv("https://cdn.jsdelivr.net/gh/ashleychuikay/tangram-comprehension@master/output/random_stims.csv").then(function(csv) {
			trials = csv.filter(function(row) {
				return row["subject"] == subid
			});

		console.log(trials);
		for (i=0; i<trials.length; i++) {
			newTrial = Object.values(trials[i]);
			allTrials.push(newTrial);
		};
		
	console.log(allTrials);
	shuffle(allTrials);
	experiment.start(allTrials);
	});
};


// MAIN EXPERIMENT
var experiment = {

	subid: "",
		//inputed at beginning of experiment
	age: "",
		//inputed at beginning of experiment
	trialnum: 0,
		//trial number
	order: 1,
		//whether child received list 1 or list 2
	word: "",
		//word that child is queried on
	pic1: "",
		//the name of the picture on the left
	pic2: "",
		//the name of the picture on the right
	person: "",
		//the identity of original speaker
	side: "",
		//whether the child picked the left (L) or the right (R) picture
	chosenpic: "",
		//the name of the picture the child picked
	response: "",
		//whether the response was the correct response (Y) or the incorrect response (N)
	date: getCurrentDate(),
		//the date of the experiment
	timestamp: getCurrentTime(),
		//the time that the trial was completed at 
	reactiontime: 0,
		//time between start of trial and response 


	// Check subject id

	checkInput: function() {

		// subject ID
			if(document.getElementById("subjectID").value.length < 1) {
			$("#checkMessage").html('<font color="red">You must input a subject ID</font>');
			return;
		};

		subid = document.getElementById("subjectID").value;

		readData(subid);
	},

	start: function() {

		//construct wordList for correct answers
		for(i=0; i<allTrials.length; i++){
			subTrial = allTrials[i].slice();
			var word = subTrial[0];
			wordList.push(word)
		};

		console.log(wordList)


		//load images according to trial order
		for(i=0; i<allTrials.length; i++) {
			subImages = allTrials[i].slice();
			items = subImages.splice(6,2);
				
			shuffle(items);
			for(j=0; j<=1; j++) {
				allImages.push(items[j]);
			}	
		};

		// load audio for each trial
		for(i=0; i<allTrials.length; i++){
			subAudio = allTrials[i].slice();
			audio = new WebAudioAPISound("audio/" + subAudio.splice(3,1));
			trialAudio.push(audio);
		};

		// load sounds for feedback after each trial
		nextSound = new WebAudioAPISound("audio/next");

		experiment.study(0);

	},

	//the end of the experiment
    end: function () {
    	setTimeout(function () {
    		$("#stage").fadeOut();
    	}, normalpause);
    	showSlide("finish");
    },

    //concatenates all experimental variables into a string which represents one "row" of data in the eventual csv, to live in the server
	processOneRow: function() {
		var dataforRound = experiment.subid; 
		dataforRound += "," + experiment.age + "," + experiment.trialnum + "," + experiment.word;
		dataforRound += "," + experiment.pic1 + "," + experiment.pic2 + "," + experiment.person;
		dataforRound += "," + experiment.side + "," + experiment.chosenpic + "," + experiment.response;
		dataforRound += "," + experiment.date + "," + experiment.timestamp + "," + experiment.reactiontime + "\n";
		console.log(dataforRound);
		$.post("https://callab.uchicago.edu/experiments/tangram-comprehension/gamecode/tangramcomprehensionsave.php", {postresult_string : dataforRound});	
	},

	//Comprehension game
  	study: function(counter) {

		$("#instructions").hide();

		// Create the object table for matcher (tr=table row; td= table data)

		var objects_html = "";
	    
	   	//HTML for the first object on the left
		leftname = "images/" + allImages[0] + ".jpg";
		objects_html += '<table align = "center" cellpadding="25"><tr></tr><tr><td align="center"><img class="pic" src="' + leftname +  '"alt="' + leftname + '" id= "leftPic"/></td>';


		//HTML for the first object on the right
		rightname = "images/" + allImages[1] + ".jpg";
	   	objects_html += '<td align="center"><img class="pic" src="' + rightname +  '"alt="' + rightname + '" id= "rightPic"/></td>';
		
  		objects_html += '</tr></table>';
    	$("#objects").html(objects_html);
		$("#stage").fadeIn();
		trialAudio[counter].play();

		clickDisabled = true;
		setTimeout(function() {
			clickDisabled = false;
			console.log("click disabled");
		},  1500);
		

		var startTime = (new Date()).getTime();		

		$('.pic').on('click touchstart', function(event) {

	    	if (clickDisabled) return;
	    	
	    	//disable subsequent clicks once the participant has made their choice
			clickDisabled = true; 

	    	experiment.trialnum = counter;
	    	experiment.word = wordList[0];
	    	experiment.pic1 = allImages[0];
	    	experiment.pic2 = allImages[1];
	    	experiment.person = allTrials[experiment.trialnum][1];


			//time the participant clicked picture - the time the trial began
	    	experiment.reactiontime = (new Date()).getTime() - startTime;

	    	//Add color to selected picture
	    	var picID = $(event.currentTarget).attr('id');

	    	switch(picID) {
	    		case "leftPic":
	    			console.log("left")
	    			experiment.side = "L";
	    			experiment.chosenpic = allImages[0];
	    			$("#leftPic").attr("src", "images/"+ allImages[0] +"_color.jpg")
	    			$("#rightPic").attr("src", "images/"+ allImages[1] +".jpg")
	    			break;

	    		default: // "rightPic"
	    			console.log("right")
	    			experiment.side = "R";
	    			experiment.chosenpic = allImages[1];
	    			$("#rightPic").attr("src", "images/"+ allImages[1] +"_color.jpg")
	    			$("#leftPic").attr("src", "images/"+ allImages[0] +".jpg")
	    	};
		
	    	console.log(picID);

	    	//remove the pictures from the image array that have been used, and the word from the wordList that has been used
			allImages.splice(0, 2);
			wordList.splice(0, 1);

			//If the child picked the picture that matched with the word, then they were correct. If they did not, they were not correct.
			if (experiment.chosenpic === experiment.word) {
				experiment.response = "Y";
			} else {
				experiment.response = "N";
			};

			//Play sound at end of trial
		    setTimeout(function() {nextSound.play();}, 100);

		    console.log(experiment.chosenpic);

			//Process the data to be saved
			experiment.processOneRow();

			setTimeout(function() {
				$(".pic").delay().fadeOut(1500);
				document.getElementById("blank").click();
				counter++
				console.log(counter)
				if (counter === numTrials) {
					setTimeout(function() {experiment.end()}, 1000)
					return;
				} else {
					setTimeout(function() {
						experiment.study(counter);
					}, 1500);
				}
			}, 1000);

		});
	},
}