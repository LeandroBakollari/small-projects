const choices = {
    1: { name: "rock", label: "Rock", beats: 3 },
    2: { name: "paper", label: "Paper", beats: 1 },
    3: { name: "scissors", label: "Scissors", beats: 2 },
};

const players = {
    pl1: {
        name: "Player 1",
        score: document.getElementById("pl1s"),
        hand: document.getElementById("p1-hand"),
        status: document.getElementById("result1"),
        controls: document.querySelectorAll('[data-player="pl1"]'),
    },
    pl2: {
        name: "Player 2",
        score: document.getElementById("pl2s"),
        hand: document.getElementById("p2-hand"),
        status: document.getElementById("result2"),
        controls: document.querySelectorAll('[data-player="pl2"]'),
    },
};

const result = document.getElementById("result");
const resetButton = document.getElementById("reset");
const controls = document.querySelectorAll("[data-choice]");
const keyboardControls = {
    a: { player: "pl1", choice: 1 },
    s: { player: "pl1", choice: 2 },
    d: { player: "pl1", choice: 3 },
    1: { player: "pl2", choice: 1 },
    2: { player: "pl2", choice: 2 },
    3: { player: "pl2", choice: 3 },
};

let scores = { pl1: 0, pl2: 0 };
let moves = { pl1: null, pl2: null };
let roundLocked = false;
let activeAnimation = null;

controls.forEach((button) => {
    button.addEventListener("click", () => {
        sendValue(Number(button.dataset.choice), button.dataset.player);
    });
});

resetButton.addEventListener("click", reset);

document.addEventListener("keydown", (event) => {
    if (event.repeat) return;

    const action = keyboardControls[event.key.toLowerCase()];
    if (action) {
        sendValue(action.choice, action.player);
    }
});

function reset() {
    cancelAnimation();

    scores = { pl1: 0, pl2: 0 };
    moves = { pl1: null, pl2: null };
    roundLocked = false;

    players.pl1.score.textContent = "0";
    players.pl2.score.textContent = "0";
    players.pl1.status.textContent = "";
    players.pl2.status.textContent = "";
    result.textContent = "Choose your moves";

    showHand("pl1", 1);
    showHand("pl2", 1);
    setAllControls(false);
}

function sendValue(value, playerId) {
    if (roundLocked || !players[playerId] || !choices[value] || moves[playerId]) return;

    moves[playerId] = value;
    players[playerId].status.textContent = "Ready";
    setPlayerControls(playerId, true);

    const waitingPlayer = Object.keys(moves).find((id) => moves[id] === null);
    result.textContent = waitingPlayer ? `${players[waitingPlayer].name} chooses next` : "Battle!";

    if (moves.pl1 !== null && moves.pl2 !== null) {
        playRound();
    }
}

async function playRound() {
    roundLocked = true;
    setAllControls(true);

    const completed = await animateBattle(moves.pl1, moves.pl2);
    if (!completed) return;

    const winner = checkWinner(moves.pl1, moves.pl2);
    showRoundResult(winner);

    players.pl1.status.textContent = choices[moves.pl1].label;
    players.pl2.status.textContent = choices[moves.pl2].label;
    moves = { pl1: null, pl2: null };
    roundLocked = false;
    setAllControls(false);
}

function checkWinner(playerOneChoice, playerTwoChoice) {
    if (playerOneChoice === playerTwoChoice) return null;

    return choices[playerOneChoice].beats === playerTwoChoice ? "pl1" : "pl2";
}

function showRoundResult(winner) {
    if (!winner) {
        result.textContent = "It's a tie!";
        return;
    }

    scores[winner] += 1;
    players[winner].score.textContent = scores[winner];
    result.textContent = `${players[winner].name} wins!`;
}

function animateBattle(playerOneChoice, playerTwoChoice) {
    cancelAnimation();
    showHand("pl1", 1);
    showHand("pl2", 1);

    return new Promise((resolve) => {
        let count = 0;
        const timer = setInterval(() => {
            const shouldLift = count % 2 === 0;
            players.pl1.hand.classList.toggle("up", shouldLift);
            players.pl2.hand.classList.toggle("up", shouldLift);
            count += 1;

            if (count === 6) {
                clearInterval(timer);
                activeAnimation = null;
                players.pl1.hand.classList.remove("up");
                players.pl2.hand.classList.remove("up");
                showHand("pl1", playerOneChoice);
                showHand("pl2", playerTwoChoice);
                resolve(true);
            }
        }, 300);

        activeAnimation = { timer, resolve };
    });
}

function cancelAnimation() {
    if (!activeAnimation) return;

    clearInterval(activeAnimation.timer);
    activeAnimation.resolve(false);
    activeAnimation = null;
    players.pl1.hand.classList.remove("up");
    players.pl2.hand.classList.remove("up");
}

function showHand(playerId, choice) {
    const hand = players[playerId].hand;
    const selected = choices[choice];

    hand.src = `images/${selected.name}.png`;
    hand.alt = `${players[playerId].name} hand showing ${selected.label.toLowerCase()}`;
}

function setPlayerControls(playerId, disabled) {
    players[playerId].controls.forEach((button) => {
        button.disabled = disabled;
    });
}

function setAllControls(disabled) {
    controls.forEach((button) => {
        button.disabled = disabled;
    });
}
