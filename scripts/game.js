// grab the question element to change its text accordingly
const question = document.querySelector('#question');
// grab all answer (option/choice) elements to change their texts accordingly
const choices = Array.from(document.querySelectorAll('.choice-text'));
// grab the progressbar text element
const progressText = document.querySelector('#progressText');
// grab the progressbar element
const progressBarFull = document.querySelector('#progressBarFull');
// grab the score text element (removed because it's hidden throughout the duration of the game)
//const scoreText = document.querySelector('#score');

// grab the NEXT and PREVIOUS buttons
const navigationNext = document.getElementById("next");
const navigationPrevious = document.getElementById("previous");
// grab the numbers for track navigatoin
const q1 = document.querySelector("#q1");
const q2 = document.querySelector("#q2");
const q3 = document.querySelector("#q3");
const q4 = document.querySelector("#q4");
// grab the button for seeing the end results (total score)
const results = document.querySelector('#navigation-results-btn');

// grab the alert box for displaying warnings to the user
const alertBox = document.querySelector(".alert");

// at the start of the game, the alertBox has not yet been revealed and isn't in progress
var inProgress = false;

// contains the amount of available options for a given question
let optC = [];
// contains the selected option for a given question
let optS = [];

let timer;

// for showing the alertBox triggered by trying to choose an answer on a question that already has an answer
function showAlertBox() {
    if(inProgress) return; // if the alertBox is already present, don't show another
    if(!inProgress) inProgress = true; // if it isn't, note that it is already present
    alertBox.classList.remove("hide"); // remove it from hidden status
    alertBox.classList.add("show"); // and reveal it to the user
    if(alertBox.classList.contains("hidden")) { // also if it's got the hidden class then remove that
        alertBox.classList.remove("hidden");
    }
    timer = setTimeout(function() { // the alertBox will be hidden after 3s have passed
        hideAlertBox();
    }, 3000);
};

// for hiding the alertBox triggered by trying to choose an answer on a question that already has an answer
function hideAlertBox() {
    if(!inProgress) return; // if the alertBox is still in progress then don't hide it yet
    if(inProgress) inProgress = false; // if the alertBox isn't in progress hide it
    alertBox.classList.remove("show");
    alertBox.classList.add("hide");
    alertBox.classList.add("hidden");
};

// holds the currentQuestion
let currentQuestion = {};

// whether or not the currentQuestion is acceptingAnswers
let acceptingAnswers = true;

// total score
let score = 0;

// the index of the currentQuestion
let questionCounter = 0;

// which questions have not yet been chosen
let availableQuestions = [];

// holds all questions and possible answers
// currently answers are empty, answers are hard-coded
let questions = [ {
        question: 'Pitanje 1', // question text
        choice1: '', // option text (empty)
        choice2: '',
        choice3: '',
        choice4: '',
        choice5: '',
        choice6: '',
        choice7: '',
        choice8: '',
        answer: 1, // correct answer for question 1 is 1
    }, {
        question: 'Pitanje 2',
        choice1: '',
        choice2: '',
        choice3: '',
        choice4: '',
        choice5: '',
        choice6: '',
        choice7: '',
        choice8: '',
        answer: 2,
    }, {
        question: 'Pitanje 3',
        choice1: '',
        choice2: '',
        choice3: '',
        choice4: '',
        choice5: '',
        choice6: '',
        choice7: '',
        choice8: '',
        answer: 1,
    }, {
        question: 'Pitanje 4',
        choice1: '',
        choice2: '',
        choice3: '',
        choice4: '',
        choice5: '',
        choice6: '',
        choice7: '',
        choice8: '',
        answer: 2,
}];

// score multiplier is 25 for 25% since we only have 4 questions
const SCORE_POINTS = 25;
// maximum amount of questoins is 4
const MAX_QUESTIONS = 4;

// stores questions that have been used
var temp = [];

function enableNavigation() {

    if(questionCounter < 4) {
        console.log("     [questionCounter = " + questionCounter + "] -> Enabling navigationNext");
        console.log("     [questionCounter = " + questionCounter + "] -> Disabling results");
        navigationNext.style.display = "flex";
        results.style.display = "none";
    } else {
        console.log("     [questionCounter = " + questionCounter + "] -> Disabling navigationNext");
        console.log("     [questionCounter = " + questionCounter + "] -> Enabling results");
        navigationNext.style.display = "none";
        results.style.display = "flex";
    }

    if(questionCounter > 1) {
        console.log("     [questionCounter = " + questionCounter + "] -> Enabling navigationPrevious");
        navigationPrevious.style.display = "flex";
    } else {
        console.log("     [questionCounter = " + questionCounter + "] -> Disabling navigationPrevious");
        navigationPrevious.style.display = "none";
    }

}

// code for next question button
navigationNext.addEventListener('click', e => {
    // navigationPrevious.style.display = "flex";
    // if on the last question, hide next and reveal show results in its place
    // if(questionCounter >= 3) {
    //     navigationNext.style.display = "none";
    //     results.style.display = "flex";
    // }
    if(optC[questionCounter]) getNewQuestion(optC[questionCounter + 1]);
    else getNewQuestion();
});

// code for previous question button
navigationPrevious.addEventListener('click', e => {
    // unselect all questions
    choices.forEach(choice => {
        choice.parentElement.classList.remove('selected');
    });
    getPrevQuestion();
    // if previous was pressed, then next should be displayed
    // navigationNext.style.display = "flex";
});

// code for making navigation track's options become orange
function select(q) {
    console.log("  IN PROGRESS: Setting " + q + " from the navigation track as selected...")
    switch(q) {
        case 1:
            if(!q1.classList.contains('selected-q'));
                q1.classList.add('selected-q');
            break;
        case 2:
            if(!q2.classList.contains('selected-q'));
                q2.classList.add('selected-q');
            break;
        case 3:
            if(!q3.classList.contains('selected-q'));
                q3.classList.add('selected-q');
            break;
        case 4:
            if(!q4.classList.contains('selected-q'));
                q4.classList.add('selected-q');
            break;
        default:
            console.log("  ERROR: Can't recognize navigation track element with id " + q + "!");
            return;
            break;
    }
    console.log("  FINISHED: Updated class list of navigation track element with id " + q + ".");
}

// code for button to show results
results.addEventListener('click', e => {
    localStorage.setItem('mostRecentScore', score);
    return window.location.assign('./end.html');
});

results.addEventListener('onmouseover', e => {
    checkAnswerCount();
});

// set default values for all items when game starts
startGame = () => {

    enableNavigation();
    // each button on the progressBar should take up 25% of the bar's total space
    progressBarFull.style.width = "24.5%";

    // we start at question 1 (index 0)
    questionCounter = 0;
    // the starting score is 0
    score = 0;

    // store all the questions from questions[] in availableQuestions[]
    availableQuestions = [...questions];

    // // there is no previous question at the start of the game
    // navigationPrevious.style.display = "none";
    // // there are no relevant results to show at the start of the game
    // results.style.display = "none";

    /*
    console.log("navtrack >>>> " + navigationTrack)
    for(let i = 0; i < navigationTrack.length; i++) {
        console.log("track: " + navigationTrack[i])
    }*/

    // q1.classList.add('selected-q');
    // q2.classList.add('selected-q');
    // q3.classList.add('selected-q');
    // q4.classList.add('selected-q');

    // get the questions
    // for(let i = 0; i < 4; i++) getNewQuestion();
    // for(let i = 0; i < 4; i++) getPrevQuestion();
    getNewQuestion();

}

// code triggered when the NEXT button is pressed
// will generate the next question
getNewQuestion = (optionCount) => {

    console.log(">> >> available questions: " + availableQuestions);

    /*
    for(let i = 0; i < 4; i++) {
        if(optS[i - 1] != undefined) {
            navigationTrack[i - 2].classList.add('selected');
            navigationTrack[i - 2].classList.remove('btn-track');
        }
    }*/

    if(availableQuestions.length === 0 || questionCounter > MAX_QUESTIONS) {
        if(answerCount >= 4) results.style.display = "flex";
        return;
    }

    const c = questionCounter + 1;
    let count = questionCounter;

    // code to reset choices when next question is selected:
    choices.forEach(choice => {
        // sets the activated choice to the current index before removing its class, if it's been selected, for getOldQuestion later on
        //if(choice.parentElement.classList.contains('selected')) optS[questionCounter] = choice;
        choice.parentElement.classList.remove('selected');
    });

    // we're currently a question up since we went next
    questionCounter++;
    enableNavigation();

// option count management: --------------
    
    let testrun = null;

    // verify if we already have an optionCount for this question
    if(optionCount == testrun) {

        // if this question hasn't been viewed before, generate a random option count
        optionCount = Math.floor(Math.random() * 6) + 3;

        // specific console information
        console.log(`question ${questionCounter} has not been accessed before, so a new optionCount has been generated: ${optionCount}`);

        // store the newly generated optionCount
        optC[questionCounter] = optionCount;

        // specific console information
    } else console.log(`for question ${questionCounter} there is an existing optionCount from last time that is being used: ${optionCount}`); //optionCount = Math.floor(Math.random() * 6) + 3;

// ----------------- =+= -----------------

// selection management: -----------------
    
    // store the current amount of options for later reference if 
    optC[questionCounter] = optionCount; 
    
    // if optS[questionCounter] isn't undefined and some glitch hasn't happened with questionCounter then display the previously selected answer
    if(questionCounter >= 0 && optS[questionCounter]) optS[questionCounter].parentElement.classList.add('selected');
    
    // additional console logging information:
    if(!optS[questionCounter]) console.log("the current question doesn't have a previously loaded choice");
    else console.log("the current question has a previously logged choice. it's been selected! ;)");

// ----------------- =+= -----------------

    for(let i = 0; i <= 8; i++) {
        if(i === 8) {
            document.getElementById('o8').style.display = "flex";
        } if(i === 7) {
            document.getElementById("o7").style.display = "flex";
        } if(i === 6) {
            document.getElementById("o6").style.display = "flex";
        } if(i === 5) {
            document.getElementById("o5").style.display = "flex";
        } if(i === 4) {
            document.getElementById("o4").style.display = "flex";
        } if(i === 3) {
            document.getElementById("o3").style.display = "flex";
        } if(i === 2) {
            document.getElementById("o2").style.display = "flex";
        } if(i === 1) {
            document.getElementById("o1").style.display = "flex";
        }
    }

    // according to random generated optionCount, hide extra choices from view
    for(let i = 8; i > optionCount; i--) {
        if(i === 8) {
            document.getElementById("o8").style.display = "none";
        } if(i === 7) {
            document.getElementById("o7").style.display = "none";
        } if(i === 6) {
            document.getElementById("o6").style.display = "none";
        } if(i === 5) {
            document.getElementById("o5").style.display = "none";
        } if(i === 4) {
            document.getElementById("o4").style.display = "none";
        } if(i === 3) {
            document.getElementById("o3").style.display = "none";
        }
    }

    progressText.innerText = `Question ${questionCounter} of ${MAX_QUESTIONS}`;
    // progressBarFull.style.width = `${(questionCounter/MAX_QUESTIONS) * 100}%`;

    const questionsIndex = 0;
    //currentQuestion = availableQuestions[questionsIndex];
    currentQuestion = questions[questionCounter - 1];
    question.innerText = currentQuestion.question;

    choices.forEach(choice => {
        const number = choice.dataset['number'];
        choice.innerText = currentQuestion['choice' + number];
    });

    //availableQuestions.splice(questionsIndex, 1);
    // instead of slice, store the question for later and add it back in getPrevQuestion();
    temp[questionCounter-1] = availableQuestions.shift();

    acceptingAnswers = true;

}

// code triggered when the PREVIOUS button is pressed
// will go to the previous question
getPrevQuestion = () => {

    // deselect all selected choices
    choices.forEach(choice => {
        choice.parentElement.classList.remove('selected');
    })

    // add back previous question
    availableQuestions.unshift(temp.pop());

    // hide the previous button if at the start of the quiz
    // if(availableQuestions.length > 3) {
    //     navigationPrevious.style.display = "none";
    // }

    // pressing previous means the user went a question backwards
    questionCounter--;
    enableNavigation();

    // hide the previous button if at the start of the quiz
    // if(questionCounter <= 1) {
    //     navigationPrevious.style.display = "none";
    // }

    let chsn = false;

    // finally, get and display the old question
    if(optS[questionCounter] !== undefined) chsn = true;
    getOldQuestion(optC[questionCounter], chsn) //else getNewQuestion();

}

getOldQuestion = (optionCount, chosen) => {

    // additional console information
    console.log("questioncounter: " + questionCounter);

    // select a previously selected answer
    if(questionCounter >= 0 && optS[questionCounter]) optS[questionCounter].parentElement.classList.add('selected');
    
    // the folowin 36 lines of code should probably be in a function since they're used multiple times
    // code to display all questions - I think I can use forEach for this?
    for(let i = 0; i <= 8; i++) {
        if(i === 8) {
            document.getElementById("o8").style.display = "flex";
        } if(i === 7) {
            document.getElementById("o7").style.display = "flex";
        } if(i === 6) {
            document.getElementById("o6").style.display = "flex";
        } if(i === 5) {
            document.getElementById("o5").style.display = "flex";
        } if(i === 4) {
            document.getElementById("o4").style.display = "flex";
        } if(i === 3) {
            document.getElementById("o3").style.display = "flex";
        } if(i === 2) {
            document.getElementById("o2").style.display = "flex";
        } if(i === 1) {
            document.getElementById("o1").style.display = "flex";
        }
    }

    // code to hide questions that were randomly decided not to be available - I think I can use forEach for this?
    for(let i = 8; i > optionCount; i--) {
        if(i === 8) {
            document.getElementById("o8").style.display = "none";
        } if(i === 7) {
            document.getElementById("o7").style.display = "none";
        } if(i === 6) {
            document.getElementById("o6").style.display = "none";
        } if(i === 5) {
            document.getElementById("o5").style.display = "none";
        } if(i === 4) {
            document.getElementById("o4").style.display = "none";
        } if(i === 3) {
            document.getElementById("o3").style.display = "none";
        }
    }

    // setting the progress bar
    progressText.innerText = `Question ${questionCounter} of ${MAX_QUESTIONS}`;
    // progressBarFull.style.width = `${(questionCounter / MAX_QUESTIONS) * 100}%`;
    
    // setting question information
    const questionsIndex = 0;
    currentQuestion = questions[questionCounter - 1];
    question.innerText = currentQuestion.question;
    
    // setting option text to have number prefix
    choices.forEach(choice => {
        const number = choice.dataset['number'];
        choice.innerText = currentQuestion['choice' + number];
    })

    //availableQuestions.splice(questionsIndex, 1);
    // not splicing it so that we can use it later instead for previous and next joint functionality
    temp[questionCounter] = availableQuestions[questionCounter];

    // determine whether the question is accepting answers or not
    if(chosen === false) acceptingAnswers = true;
    else acceptingAnswers = true;

}

let answerCount = 0;

// adds listeners to each choice option instead of doing it individually
choices.forEach(choice => {

    // looking for click event
    choice.addEventListener('click', e => {

        // if we're not accepting answers anymore report that to the user and quit evaluation
        if(!acceptingAnswers || answerCount >= 4 || optS[questionCounter]) {
            showAlertBox();
            return;
        }
        
        select(questionCounter);
        
        // if it got past the first loop then we're not accepting answers anymore
        acceptingAnswers = false;

        // an answer has been selected; grab that choice
        const selectedChoice = e.target;
        // get the position of the answer
        const selectedAnswer = selectedChoice.dataset['number'];

        // determine which class to apply - if you remove the line "classToApply = 'selected'", then the answer will be displayed as correct or incorrect
        let classToApply = selectedAnswer == currentQuestion.answer ? 'correct' : 'incorrect';
        console.log(classToApply);

        // if the answer has been determind to be correct then update the score
        if(classToApply === 'correct') incrementScore(SCORE_POINTS);

        // the user has officially answered one more question
        answerCount++;

        // instead of applying the correct or incorrect classes, simply apply selected - the user will see their results at the end of the quiz
        classToApply = 'selected';
        selectedChoice.parentElement.classList.add(classToApply);


        // add the answer that was just selected to the array of selected options (optS)
        optS[questionCounter] = selectedChoice;

        // enable the results button only if enough answers have been provided
        if(answerCount >= 4) results.disabled = false;
        return;

    })

})

// update current score
incrementScore = num => {
    score += num;
    //scoreText.innerText = score; // used when score is displayed on HUD throughout the game
}

// enable the results button
function checkAnswerCount() {
    results.disabled = true;
}

// update position to the one chosen on the number track
function update(q) {
    // additional console information
    console.log("triggered update with id " + q);
    // move forth by a certain amount, use its option count if it has been previously accessed
    for(let i = questionCounter; i < q; i++) {
        getNewQuestion(optC[i + 1]);
    }
    // move back by a certain amount
    for(let i = questionCounter; i > q; i--) {
        getPrevQuestion();
    }
}

startGame();