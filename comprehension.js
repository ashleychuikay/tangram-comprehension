// Tangram comprehension task

// Do all the following "on touch"?
// Check subject id

checkInput: function() {

	// subject ID
		if(document.getElementById("subjectID").value.length < 1) {
		$("#checkMessage").html('<font color="red">You must input a subject ID</font>');
		return;
	};

	var subid = document.getElementById("subjectID").value;
	console.log(subid)

	startExperiment(subid)
};



// Read in random stimuli

// var xhr = new XMLHttpRequest(),
//     method = "GET",
//     url = "https://cdn.jsdelivr.net/gh/ashleychuikay/tangram-comprehension@master/output/random_stims.csv";

// xhr.open(method, url, true);

// xhr.onreadystatechange = function () {
//   if(xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {

//     trials = $.csv.toArrays(xhr.responseText);
    
//     allTrials = new Array;

//     for(i=1; i<trials.length; i++) {
//     	if(trials[i][9] == subid){
//     		allTrials.push(trials[i]);
//     	} else {
//     		return;
//     	}
//     };

//    shuffle(allTrials)
//    console.log(allTrials)
//    startExperiment(allTrials)

//   };
// };
// xhr.send();


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


function startExperiment() {

	// Read and select stimuli using D3

	trials = d3.csv("https://cdn.jsdelivr.net/gh/ashleychuikay/tangram-comprehension@master/output/random_stims.csv", numconvert, function(csv) {
		csv = csv.filter(function(row) {
			return row[subject] == subid
		})
	})

	function numconvert(d){
		d.occurence = +d.occurence
		d.subid = +d.subid
		d.trial = +d.trial
		d.subject = +d.subject
	}

	allTrials = new Array;

	    for(i=1; i<trials.length; i++) {
	    	if(trials[i][9] == subid){
	    		allTrials.push(trials[i]);
	    	} else {
	    		return;
	    	}
	    };

	 shuffle(allTrials)
	 console.log(allTrials)


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
		audio = new WebAudioAPISound('"' + subAudio.splice(3,1) + '"');
		trialAudio.push(audio);
	};

	// load sounds for feedback after each trial
	nextSound = new WebAudioAPISound("next");

	
	// to start at beginning
	showSlide("instructions");
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

	
	//Slide before study begins
	preStudy: function() {
			showSlide('prestudy')
	},

	//the end of the experiment
    end: function () {
    	setTimeout(function () {
    		$("#matcherstage").fadeOut();
    	showSlide("finish");
    },

    //concatenates all experimental variables into a string which represents one "row" of data in the eventual csv, to live in the server
	processOneRow: function () {
		var dataforRound = experiment.subid; 
		dataforRound += "," + experiment.age + "," + experiment.trialnum + "," + experiment.word;
		dataforRound += "," + experiment.pic1 + "," + experiment.pic2; + "," + experiment.person;
		dataforRound += "," + experiment.side + "," + experiment.chosenpic + "," + experiment.response;
		dataforRound += "," + experiment.date + "," + experiment.timestamp + "," + experiment.reactiontime + "\n";
		console.log(dataforRound)
		$.post("https://callab.uchicago.edu/experiments/tangram-comprehension/gamecode/tangramcomprehensionsave.php", {postresult_string : dataforRound});	
	},

	//Comprehension game
  	matcherStudy: function(counter) {

		$("#prestudy").hide();

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
	    

	    var startTime = (new Date()).getTime();

		clickDisabled = true;
		setTimeout(function() {
			clickDisabled = false;
				// $('#objects').fadeTo(250, 1)
		},  1500);

		trialAudio[counter].play()
		

		$('.pic').on('click touchstart', function(event) {

			// counter = globalGame.trialnum;

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

	    	// Edit!! allTrials is the arrays of blocks
	    	// experiment.parentchild = allTrials[experiment.trialnum][2];

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
			matcherImages.splice(0, 2);
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

			console.log(matcherImages);

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
						experiment.matcherStudy(counter);
					}, 1500);
				}
			}, 1000);

		});
	}