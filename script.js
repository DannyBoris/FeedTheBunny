(function () {
  //DOM ELEMENTS
  const MIN_DISPLAY_EL = selectEl("minutes-display");
  const SEC_DISPLAY_EL = selectEl("seconds-display");
  const SCORE_EL = selectEl("score-display");
  const TARGET_EL = selectEl("target");
  const ROUND_DISPLAY_EL = selectEl("round-time-display");
  const PAUSE_BTN = selectEl("pause-timer");

  //APP CONSTANTS
  const WINNING_SCORE = 10;
  const LIVING_TIME = 8 * 1000;
  const ENABLE_DRAG_TIME = 4 * 1000;
  const PLAYING_SPEED = 1000 / 1;
  const CURRENT_ID_KEY = "CURRENT_ID";
  const SPECIAL_ITEM = "special";
  const NORMAL_ITEM = "item";
  const PLAYING_TIME = {
    mins: 3,
    seconds: 0,
  };
  //APP VARS
  let successfulRound = false;
  let score = 0;
  let itemCounterTime = LIVING_TIME / 1000;
  //INTERVALS
  let gameInterval;
  let itemInterval;
  let currentRandomTimeout;
  let itemTimer;
  let specialItemTimeout;
  let specialItemDragTimeout;

  //Drag and drop hanlders
  function enableDrag(id) {
    let el = document.getElementById(id);
    el.classList.add("enable-drag");
    el.classList.remove("disable-drag");
    el.draggable = true;
  }

  function allowDrop(ev) {
    ev.preventDefault();
    console.log("drop");
  }

  function drag(ev) {
    let id = ev.target.id;
    localStorage.setItem(CURRENT_ID_KEY, id);
  }

  function drop(ev) {
    let currentId = localStorage.getItem(CURRENT_ID_KEY);
    successfulRound = true;
    ev.preventDefault();
    handleScoreOnDrop(currentId);
    removeEl(currentId);
  }

  function handleScoreOnDrop(currentId) {
    if (bothItemsOnField()) {
      if (currentId === NORMAL_ITEM) {
        handleFailedRound(4);
      } else {
        handleSuccessfulRound(2);
      }
    } else handleSuccessfulRound(currentId === NORMAL_ITEM ? 1 : 2);

    render();
  }
  function handleSuccessfulRound(points) {
    score += points;
    setTimeout(() => {
      TARGET_EL.classList.remove("success");
    }, 1000);
    TARGET_EL.classList.add("success");
  }
  //Check if both special and normal items are rendered
  function bothItemsOnField() {
    let specialItem = selectEl(SPECIAL_ITEM);
    let item = selectEl(NORMAL_ITEM);
    return Boolean(specialItem && item);
  }

  //Create a dom element
  function createEl(tag, id, className, src) {
    let el = document.createElement(tag);
    el.id = id;
    el.src = src;
    el.addEventListener("drag", (e) => drag(e));
    el.classList.add(className);
    el.draggable = false;
    let x = getRandomNumber(0, 500);
    let y = getRandomNumber(0, 500);
    el.style.top = `${x}px`;
    el.style.left = `${y}px`;
    document.body.append(el);

    setTimeout(() => {
      enableDrag(NORMAL_ITEM);
    }, ENABLE_DRAG_TIME);
  }

  //Pad timer with zeros
  function padZeros(n) {
    return n >= 10 ? n : "0" + n;
  }

  //Select element from dom
  function selectEl(id) {
    return document.getElementById(id);
  }
  //Remove element from dom

  function removeEl(id) {
    let el = document.getElementById(id);
    if (el) el.remove();
  }

  // Get random number between min and max numbers.
  function getRandomNumber(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  //Start the imer from the game
  function startTimer() {
    if (PLAYING_TIME.seconds === 0) {
      PLAYING_TIME.mins--;
      PLAYING_TIME.seconds = 60;
    }
    PLAYING_TIME.seconds--;
    itemCounterTime--;
  }
  //pauses the game
  function pauseGame() {
    clearInterval(gameInterval);
    clearInterval(itemInterval);
    clearInterval(itemTimer);

    clearTimeout(currentRandomTimeout);
    clearTimeout(specialItemTimeout);
    clearTimeout(specialItemDragTimeout);
    // how to reset an interval ??
    PAUSE_BTN.textContent = "Resume";
  }
  //Game over when times up or player won
  function gameOver() {
    const PLAYER_WON = score >= WINNING_SCORE;
    const TIME_UP = PLAYING_TIME.seconds === 0 && PLAYING_TIME.mins === 0;
    return TIME_UP || PLAYER_WON;
  }

  //Renders time and score
  function render() {
    MIN_DISPLAY_EL.textContent = padZeros(PLAYING_TIME.mins);
    SEC_DISPLAY_EL.textContent = padZeros(PLAYING_TIME.seconds);
    ROUND_DISPLAY_EL.innerHTML = itemCounterTime;
    SCORE_EL.textContent = score;
  }

  //Initlize the app
  function init() {
    TARGET_EL.addEventListener("dragover", (e) => allowDrop(e));
    TARGET_EL.addEventListener("drop", (e) => drop(e));
    PAUSE_BTN.addEventListener("click", () => pauseGame());
    createEl("img", NORMAL_ITEM, "disable-drag", "./carrot.png");
    generateRandomInterval();
    render();
  }

  function resetItemCountTime() {
    clearInterval(itemTimer);
    itemCounterTime = LIVING_TIME / 1000;
  }

  function stopGame() {
    //Clears all intervals
    pauseGame();
    let header = document.querySelector(".header");
    if (score === WINNING_SCORE) {
      header.innerHTML = "<h1>You won! Here's a fat happy bunny.</h1>";
      TARGET_EL.src = "./fat-bunny.jfif";
    } else {
      header.innerHTML =
        "<h1>You lost... Look what youv'e done to the bunny.</h1>";
      TARGET_EL.src = "./dead-bunny.jfif";
      TARGET_EL.style.width = "300px";
    }
  }
  function handleFailedRound(points) {
    score -= points;
    render();
    setTimeout(() => {
      TARGET_EL.classList.remove("fail");
    }, 1000);
    TARGET_EL.classList.add("fail");
  }

  function gameLoop() {
    init();
    gameInterval = setInterval(() => {
      startTimer();
      render();
      if (gameOver()) stopGame();
    }, PLAYING_SPEED);
    itemInterval = setInterval(() => {
      resetItemCountTime();

      if (!successfulRound) handleFailedRound(1);
      successfulRound = false;
      removeEl(NORMAL_ITEM);
      createEl("img", NORMAL_ITEM, "disable-drag", "./carrot.png");
    }, LIVING_TIME);
  }

  setInterval(() => {
    clearTimeout(currentRandomTimeout);
    generateRandomInterval();
  }, 30000);

  function generateRandomInterval() {
    let r = getRandomNumber(20, 30) * 1000;
    console.log(`Generating Super Carrot in: ${r / 1000} seconds.`);
    currentRandomTimeout = setTimeout(() => {
      createEl("img", SPECIAL_ITEM, "disable-drag", "./super-carrot.png");
      specialItemTimeout = setTimeout(() => {
        enableDrag(SPECIAL_ITEM);
      }, ENABLE_DRAG_TIME);
      specialItemDragTimeout = setTimeout(() => {
        removeEl(SPECIAL_ITEM);
      }, LIVING_TIME);
    }, r);
  }

  gameLoop();
})();
