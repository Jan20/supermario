var startDate = new Date();
var startTime = startDate.getTime();
var timeElapsed = 0;
var timer;

function myTimer() {
	var dateNow = new Date();
	var timeNow = dateNow.getTime();
	timeElapsed += Math.floor((timeNow - startTime)/1000);
    document.getElementById("time").innerHTML = pad(timeElapsed);

    startTime = timeNow;

    timer = setTimeout( "myTimer ()", 1000 ); 
};

function resetTimer() {
	startDate = new Date();
	startTime = startDate.getTime();
	timeElapsed = 0;
}

function pad ( num ) {
	if (num < 10)
		return "0000" + num;
	else if (num < 100)
		return "000" + num;
	else if (num < 1000)
		return "00" + num;
	else if (num < 10000)
		return "0" + num;
	else
		return num;
};

function pauseGame() {
    var pauseMenu = document.getElementById("pause");
    pauseMenu.style.display = "block";
    clearTimeout(timer);
};

function continueGame() {
	var pauseMenu = document.getElementById("pause");
	pauseMenu.style.display = "none";
	startDate = new Date();
	startTime = startDate.getTime();
	myTimer();
	pauseMode = 0;
};

function gameOver() {
    var gg = document.getElementById("gg");
    gg.style.display = "block";
    gameOver = 1;
    document.addEventListener('keydown', function(evt) {
        if ((evt.keyCode == 13 || evt.keyCode == 32) && gameOver) {
            location.reload();
        }
    }, false);
}

function finishLevel() {
    var done = document.getElementById("done");
    done.style.display = "block";
    gameOver = 1;
    document.addEventListener('keydown', function(evt) {
        if ((evt.keyCode == 13 || evt.keyCode == 32) && gameOver) {
            location.reload();
        }
    }, false);
}