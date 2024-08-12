document.addEventListener("DOMContentLoaded", function() {
    const startScreen = document.getElementById("start-screen");
    const gameContainer = document.querySelector(".game-container");
    const modePvp = document.getElementById("mode-pvp");
    const modeAi = document.getElementById("mode-ai");
    const modeTimed = document.getElementById("mode-timed");
    const aiDifficultySelection = document.getElementById("ai-difficulty-selection");
    const timedModeSelection = document.getElementById("timed-mode-selection");
    const difficultyButtons = document.querySelectorAll(".difficulty-btn");
    const timeLimitButtons = document.querySelectorAll(".time-limit-btn");
    const opponentButtons = document.querySelectorAll("#timed-pvp, #timed-ai");
    const startButton = document.createElement("button");
    startButton.textContent = "Start Game";
    startButton.id = "start-button";
    startButton.style.display = "none";
    startButton.style.margin = "20px auto 0";
    startScreen.appendChild(startButton);
    const menuButton = document.getElementById("menu-button"); 
    const restartButton = document.getElementById("restart-button"); 

    let selectedMode = "";
    let selectedDifficulty = "";
    let selectedTimeLimit = 0;
    let selectedOpponent = "";
    let currentPlayer = "red"; // Red always starts
    let selectedPieceSquare = null;
    let timerInterval;
    let isAiTurn = false;

    const board = document.getElementById("checkers-board");

    // Load sounds
    const kingMeSound = new Audio("King-me.wav");
    const winnerSound = new Audio("Winner.wav");
    const loserSound = new Audio("You-lose.wav");
    const captureSound = new Audio("piece-capture.wav");

    // Winner container elements
    const winnerContainer = document.getElementById("winner-container");
    const winnerMessage = document.getElementById("winner-message");
    const winnerRestartButton = document.getElementById("restart-button");
    const backToStartButton = document.getElementById("back-to-start-button");

    // Loser container elements
    const loserContainer = document.getElementById("loser-container");
    const loserMessage = document.getElementById("loser-message");
    const loserRestartButton = document.getElementById("loser-restart-button");
    const backToStartButtonLoser = document.getElementById("back-to-start-button-loser");

    // Confetti canvas for winner
    const confettiCanvas = document.getElementById("confetti-canvas");
    const confettiCtx = confettiCanvas.getContext('2d');
    let confettiParticles = [];

    // Event listeners for start, restart, and menu buttons
    modePvp.addEventListener("click", function() {
        startGame("pvp");
    });

    modeAi.addEventListener("click", function() {
        resetSelections();
        aiDifficultySelection.style.display = "block";
        selectedMode = "ai";
        updateStartButtonVisibility();
    });

    modeTimed.addEventListener("click", function() {
        resetSelections();
        timedModeSelection.style.display = "block";
        selectedMode = "timed";
        updateStartButtonVisibility();
    });

    timeLimitButtons.forEach(button => {
        button.addEventListener("click", function() {
            toggleButton(button, timeLimitButtons);
            selectedTimeLimit = parseInt(button.getAttribute("data-time"));
            updateStartButtonVisibility();
        });
    });

    opponentButtons.forEach(button => {
        button.addEventListener("click", function() {
            toggleButton(button, opponentButtons);
            selectedOpponent = button.id === "timed-pvp" ? "pvp" : "ai";
            if (selectedOpponent === "ai") {
                aiDifficultySelection.style.display = "block";
            } else {
                aiDifficultySelection.style.display = "none";
            }
            updateStartButtonVisibility();
        });
    });

    difficultyButtons.forEach(button => {
        button.addEventListener("click", function() {
            toggleButton(button, difficultyButtons);
            selectedDifficulty = button.getAttribute("data-difficulty");
            updateStartButtonVisibility();
        });
    });

    startButton.addEventListener("click", function() {
        startGame(selectedMode + (selectedOpponent ? "-" + selectedOpponent : ""));
    });

    menuButton.addEventListener("click", function() {
        resetSelections();
        startScreen.style.display = "block";
        gameContainer.style.display = "none";
    });

    restartButton.addEventListener("click", function() {
        resetGame();  // Call a function to reset the game properly
    });

    // Event listeners for winner and loser containers
    winnerRestartButton.addEventListener("click", function() {
        winnerContainer.style.display = "none";
        resetGame();  // Call the same resetGame function
    });

    backToStartButton.addEventListener("click", function() {
        winnerContainer.style.display = "none";
        resetSelections();
        startScreen.style.display = "block";
        gameContainer.style.display = "none";
    });

    loserRestartButton.addEventListener("click", function() {
        loserContainer.style.display = "none";
        resetGame();  // Call the same resetGame function
    });

    backToStartButtonLoser.addEventListener("click", function() {
        loserContainer.style.display = "none";
        resetSelections();
        startScreen.style.display = "block";
        gameContainer.style.display = "none";
    });

    // Reset selections and hide all sub-options
    function resetSelections() {
        aiDifficultySelection.style.display = "none";
        timedModeSelection.style.display = "none";
        deselectButtons(difficultyButtons);
        deselectButtons(timeLimitButtons);
        deselectButtons(opponentButtons);
        selectedTimeLimit = 0;
        selectedOpponent = "";
        selectedDifficulty = "";
        updateStartButtonVisibility();
        currentPlayer = "red"; // Reset to red's turn
        isAiTurn = false;
    }

    // Deselect all buttons in a group
    function deselectButtons(buttons) {
        buttons.forEach(button => {
            button.classList.remove("selected");
        });
    }

    // Toggle button selection
    function toggleButton(button, buttonGroup) {
        buttonGroup.forEach(btn => btn.classList.remove("selected"));
        button.classList.add("selected");
    }

    // Show or hide the Start button based on selected options
    function updateStartButtonVisibility() {
        if (selectedMode === "timed" && selectedTimeLimit > 0 && selectedOpponent) {
            if (selectedOpponent === "ai" && selectedDifficulty) {
                startButton.style.display = "block";
            } else if (selectedOpponent === "pvp") {
                startButton.style.display = "block";
            } else {
                startButton.style.display = "none";
            }
        } else if (selectedMode === "ai" && selectedDifficulty) {
            startButton.style.display = "block";
        } else {
            startButton.style.display = "none";
        }
    }

    // Function to start the game
    function startGame(mode) {
        startScreen.style.display = "none";
        gameContainer.style.display = "block";

        clearInterval(timerInterval); // Stop any ongoing timer
        createBoard(); // Reset the board

        currentPlayer = "red"; // Ensure Red always starts
        isAiTurn = false;

        if (mode && mode.startsWith("timed")) {
            startTimer(selectedTimeLimit);
        }

        if (mode.includes("ai") && currentPlayer === "red") {
            setTimeout(() => {
                if (!isAiTurn) {
                    isAiTurn = true;
                    aiMove(selectedDifficulty);
                    isAiTurn = false;
                }
            }, 2000); // Add a slight delay for AI move if Red is AI
        }

        updateTurnIndicator();
    }

    function createBoard() {
        board.innerHTML = ""; // Clear any existing content

        for (let row = 0; row < 8; row++) {
            const tr = document.createElement("tr");

            for (let col = 0; col < 8; col++) {
                const td = document.createElement("td");
                const isDarkSquare = (row + col) % 2 !== 0;
                td.className = isDarkSquare ? "dark-square" : "light-square";

                // Place initial pieces on the dark squares
                if (isDarkSquare && (row < 3 || row > 4)) {
                    const piece = document.createElement("div");
                    piece.className = "piece";
                    piece.classList.add(row < 3 ? "piece-red" : "piece-black");
                    td.appendChild(piece);
                }

                td.addEventListener("click", handleSquareClick);
                tr.appendChild(td);
            }

            board.appendChild(tr);
        }
    }

    function handleSquareClick(event) {
        const square = event.target.closest("td");
        const piece = square.querySelector(".piece");

        // Only allow clicking on squares that have a piece of the current player
        if (piece && piece.classList.contains(`piece-${currentPlayer}`)) {
            highlightValidMoves(square);
        } else if (square.classList.contains("highlight")) {
            movePiece(selectedPieceSquare, square);
        }
    }

    function highlightValidMoves(square) {
        // Remove previous highlights
        document.querySelectorAll(".highlight").forEach(sq => sq.classList.remove("highlight"));

        selectedPieceSquare = square;

        // Highlight valid moves including jumps
        const [row, col] = [square.parentNode.rowIndex, square.cellIndex];
        const isKing = square.querySelector(".piece").classList.contains("king");
        const directions = getValidDirections(isKing);

        directions.forEach(([dx, dy]) => {
            const newRow = row + dx;
            const newCol = col + dy;

            if (isWithinBounds(newRow, newCol)) {
                const targetSquare = board.rows[newRow].cells[newCol];
                const middleSquare = board.rows[row + dx / 2]?.cells[col + dy / 2];
                const opponentPiece = middleSquare?.querySelector(`.piece-${currentPlayer === "red" ? "black" : "red"}`);

                // Highlight normal moves or jump over opponent
                if (!targetSquare.querySelector(".piece") && (Math.abs(dx) === 1 || (Math.abs(dx) === 2 && opponentPiece))) {
                    targetSquare.classList.add("highlight");
                }
            }
        });
    }

    function getValidDirections(isKing) {
        const forward = currentPlayer === "red" ? 1 : -1;
        const directions = [
            [forward, -1], [forward, 1], // Forward directions
            [forward * 2, -2], [forward * 2, 2] // Forward jumps
        ];
        if (isKing) {
            directions.push([-forward, -1], [-forward, 1], [-forward * 2, -2], [-forward * 2, 2]); // Backward directions for kings
        }
        return directions;
    }

    function movePiece(fromSquare, toSquare, isAi = false) {
        const piece = fromSquare.querySelector(".piece");
        toSquare.appendChild(piece);

        const [fromRow, fromCol] = [fromSquare.parentNode.rowIndex, fromSquare.cellIndex];
        const [toRow, toCol] = [toSquare.parentNode.rowIndex, toSquare.cellIndex];

        // Highlight AI move if it's the AI's turn
        if (isAi) {
            highlightAIMove(toSquare);
        }

        // Check if a jump was made
        if (Math.abs(fromRow - toRow) === 2) {
            const middleSquare = board.rows[(fromRow + toRow) / 2].cells[(fromCol + toCol) / 2];
            const capturedPiece = middleSquare.querySelector(".piece");
            if (capturedPiece) {
                middleSquare.removeChild(capturedPiece);
                captureSound.play(); // Play the capture sound when a piece is captured
            }

            // If AI, immediately check for another jump and perform it if possible
            if (isAi) {
                const jumpPossible = canContinueJump(toSquare);
                if (jumpPossible) {
                    const validMoves = Array.from(document.querySelectorAll(".highlight"));
                    if (validMoves.length > 0) {
                        setTimeout(() => movePiece(toSquare, validMoves[0], true), 500);
                        return;
                    }
                }
            } else {
                // Check for additional jumps for player
                if (canContinueJump(toSquare)) {
                    selectedPieceSquare = toSquare;
                    highlightValidMovesForJump(toSquare);
                    return; // Allow the player to continue jumping only if another jump is possible
                }
            }
        }

        // Promote to king if reaching the last row and if the piece is not already a king
        if ((currentPlayer === "red" && toRow === 7) || (currentPlayer === "black" && toRow === 0)) {
            if (!piece.classList.contains("king")) {
                piece.classList.add("king");
                kingMeSound.play(); // Play the sound when a piece becomes a king
            }
        }

        clearInterval(timerInterval); // Stop the timer when a move is made

        // Clear highlights and switch turn
        document.querySelectorAll(".highlight").forEach(sq => sq.classList.remove("highlight"));
        currentPlayer = currentPlayer === "red" ? "black" : "red";
        updateTurnIndicator();

        checkForWin(); // Check for a win or loss after each move

        if (selectedMode === "timed" || selectedMode === "timed-pvp" || selectedMode === "timed-ai") {
            startTimer(selectedTimeLimit); // Start timer for next player
        }

        // If playing against AI, force AI to make a move after the user moves
        if ((selectedMode === "ai" || selectedMode === "timed-ai") && currentPlayer === "red" && !isAiTurn) {
            setTimeout(() => {
                isAiTurn = true;
                aiMove(selectedDifficulty);
                isAiTurn = false;
            }, 2000); // Add a slight delay for AI move
        }
    }

    function highlightAIMove(square) {
        square.classList.add("ai-move-highlight");
        setTimeout(() => {
            square.classList.remove("ai-move-highlight");
        }, 3000);
    }

    function canContinueJump(square) {
        const [row, col] = [square.parentNode.rowIndex, square.cellIndex];
        const isKing = square.querySelector(".piece").classList.contains("king");
        const directions = getValidDirections(isKing);

        for (let [dx, dy] of directions) {
            const newRow = row + dx;
            const newCol = col + dy;

            if (isWithinBounds(newRow, newCol)) {
                const targetSquare = board.rows[newRow].cells[newCol];
                const middleSquare = board.rows[row + dx / 2]?.cells[col + dy / 2];
                const opponentPiece = middleSquare?.querySelector(`.piece-${currentPlayer === "red" ? "black" : "red"}`);

                if (!targetSquare.querySelector(".piece") && opponentPiece) {
                    targetSquare.classList.add("highlight");
                    return true;
                }
            }
        }
        return false;
    }

    function highlightValidMovesForJump(square) {
        document.querySelectorAll(".highlight").forEach(sq => sq.classList.remove("highlight"));

        const [row, col] = [square.parentNode.rowIndex, square.cellIndex];
        const isKing = square.querySelector(".piece").classList.contains("king");
        const directions = getValidDirections(isKing);

        directions.forEach(([dx, dy]) => {
            const newRow = row + dx;
            const newCol = col + dy;

            if (isWithinBounds(newRow, newCol)) {
                const targetSquare = board.rows[newRow].cells[newCol];
                const middleSquare = board.rows[row + dx / 2]?.cells[col + dy / 2];
                const opponentPiece = middleSquare?.querySelector(`.piece-${currentPlayer === "red" ? "black" : "red"}`);

                if (!targetSquare.querySelector(".piece") && opponentPiece) {
                    targetSquare.classList.add("highlight");
                }
            }
        });
    }

    function aiMove(difficulty) {
        let bestMove = null;

        if (difficulty === 'easy') {
            bestMove = getRandomMove(); 
        } else if (difficulty === 'medium') {
            bestMove = getBestMoveWithSimpleStrategy();
        } else if (difficulty === 'hard') {
            bestMove = getBestMoveWithMinimax(3);
        } else if (difficulty === 'extreme') {
            bestMove = getBestMoveWithMinimaxAndPruning(5);
        }

        if (bestMove) {
            movePiece(bestMove.from, bestMove.to, true);
        } else {
            const randomMove = getRandomMove();
            if (randomMove) {
                movePiece(randomMove.from, randomMove.to, true);
            }
        }
    }

    function getRandomMove() {
        const allRedPieces = Array.from(document.querySelectorAll(".piece-red"));
        const validMoves = [];

        allRedPieces.forEach(piece => {
            const square = piece.parentElement;
            const moves = getValidMoves(square);
            validMoves.push(...moves);
        });

        return validMoves.length > 0 ? validMoves[Math.floor(Math.random() * validMoves.length)] : null;
    }

    function getBestMoveWithSimpleStrategy() {
        const allRedPieces = Array.from(document.querySelectorAll(".piece-red"));
        let bestMove = null;
        let bestScore = -Infinity;

        allRedPieces.forEach(piece => {
            const square = piece.parentElement;
            const moves = getValidMoves(square);

            moves.forEach(move => {
                const score = evaluateSimpleMove(move);
                if (score > bestScore) {
                    bestScore = score;
                    bestMove = move;
                }
            });
        });

        return bestMove;
    }

    function evaluateSimpleMove(move) {
        const { from, to } = move;
        const [toRow, toCol] = [to.parentNode.rowIndex, to.cellIndex];

        let score = 0;
        if (Math.abs(from.parentNode.rowIndex - toRow) === 2) {
            score += 5;
        }
        if (toRow === 7) {
            score += 10;
        }

        return score;
    }

    function getBestMoveWithMinimax(depth) {
        let bestMove = null;
        let bestScore = -Infinity;

        const allRedPieces = Array.from(document.querySelectorAll(".piece-red"));

        allRedPieces.forEach(piece => {
            const square = piece.parentElement;
            const moves = getValidMoves(square);

            moves.forEach(move => {
                const score = minimax(move, depth, false);
                if (score > bestScore) {
                    bestScore = score;
                    bestMove = move;
                }
            });
        });

        return bestMove;
    }

    function minimax(move, depth, isMaximizingPlayer) {
        if (depth === 0) {
            return evaluateBoard();
        }

        const allMoves = isMaximizingPlayer ? getAllRedMoves() : getAllBlackMoves();
        let bestScore = isMaximizingPlayer ? -Infinity : Infinity;

        allMoves.forEach(nextMove => {
            const score = minimax(nextMove, depth - 1, !isMaximizingPlayer);
            bestScore = isMaximizingPlayer ? Math.max(bestScore, score) : Math.min(bestScore, score);
        });

        return bestScore;
    }

    function getBestMoveWithMinimaxAndPruning(depth) {
        let bestMove = null;
        let bestScore = -Infinity;

        const allRedPieces = Array.from(document.querySelectorAll(".piece-red"));

        allRedPieces.forEach(piece => {
            const square = piece.parentElement;
            const moves = getValidMoves(square);

            moves.forEach(move => {
                const score = minimaxWithPruning(move, depth, -Infinity, Infinity, false);
                if (score > bestScore) {
                    bestScore = score;
                    bestMove = move;
                }
            });
        });

        return bestMove;
    }

    function minimaxWithPruning(move, depth, alpha, beta, isMaximizingPlayer) {
        if (depth === 0) {
            return evaluateBoard();
        }

        const allMoves = isMaximizingPlayer ? getAllRedMoves() : getAllBlackMoves();

        if (isMaximizingPlayer) {
            let maxEval = -Infinity;
            for (let nextMove of allMoves) {
                const eval = minimaxWithPruning(nextMove, depth - 1, alpha, beta, false);
                maxEval = Math.max(maxEval, eval);
                alpha = Math.max(alpha, eval);
                if (beta <= alpha) break;
            }
            return maxEval;
        } else {
            let minEval = Infinity;
            for (let nextMove of allMoves) {
                const eval = minimaxWithPruning(nextMove, depth - 1, alpha, beta, true);
                minEval = Math.min(minEval, eval);
                beta = Math.min(beta, eval);
                if (beta <= alpha) break;
            }
            return minEval;
        }
    }

    function evaluateBoard() {
        let score = 0;
        document.querySelectorAll(".piece-red").forEach(piece => {
            score += piece.classList.contains("king") ? 10 : 5;
        });
        document.querySelectorAll(".piece-black").forEach(piece => {
            score -= piece.classList.contains("king") ? 10 : 5;
        });

        return score;
    }

    function getValidMoves(square) {
        const validMoves = [];
        const directions = getValidDirections(square.querySelector('.piece').classList.contains('king'));

        const [row, col] = [square.parentNode.rowIndex, square.cellIndex];
        directions.forEach(([dx, dy]) => {
            const newRow = row + dx;
            const newCol = col + dy;

            if (isWithinBounds(newRow, newCol)) {
                const targetSquare = board.rows[newRow].cells[newCol];
                const middleSquare = board.rows[row + dx / 2]?.cells[col + dy / 2];
                const opponentPiece = middleSquare?.querySelector(`.piece-${currentPlayer === "red" ? "black" : "red"}`);

                if (!targetSquare.querySelector(".piece") && targetSquare.classList.contains("dark-square")) {
                    if (Math.abs(dx) === 1 || (Math.abs(dx) === 2 && opponentPiece)) {
                        validMoves.push({ from: square, to: targetSquare });
                    }
                }
            }
        });

        return validMoves;
    }

    function getAllRedMoves() {
        const allRedPieces = Array.from(document.querySelectorAll(".piece-red"));
        let allMoves = [];

        allRedPieces.forEach(piece => {
            const square = piece.parentElement;
            allMoves = [...allMoves, ...getValidMoves(square)];
        });

        return allMoves;
    }

    function getAllBlackMoves() {
        const allBlackPieces = Array.from(document.querySelectorAll(".piece-black"));
        let allMoves = [];

        allBlackPieces.forEach(piece => {
            const square = piece.parentElement;
            allMoves = [...allMoves, ...getValidMoves(square)];
        });

        return allMoves;
    }

    function isWithinBounds(row, col) {
        return row >= 0 && row < 8 && col >= 0 && col < 8;
    }

    function updateTurnIndicator() {
        const playerTurnElement = document.getElementById("player-turn");
        playerTurnElement.textContent = `${currentPlayer.charAt(0).toUpperCase() + currentPlayer.slice(1)}'s Turn`;
    }

    function startTimer(timeLimit) {
        let timeRemaining = timeLimit;
        const playerTurnElement = document.getElementById("player-turn");

        timerInterval = setInterval(() => {
            timeRemaining--;
            playerTurnElement.textContent = `${currentPlayer.charAt(0).toUpperCase() + currentPlayer.slice(1)}'s Turn (${timeRemaining}s)`;

            if (timeRemaining <= 0) {
                clearInterval(timerInterval);
                alert(`${currentPlayer.charAt(0).toUpperCase() + currentPlayer.slice(1)} ran out of time!`);
                currentPlayer = currentPlayer === "red" ? "black" : "red";
                updateTurnIndicator();
                startTimer(selectedTimeLimit);

                if ((selectedMode === "ai" || selectedMode === "timed-ai") && currentPlayer === "red") {
                    setTimeout(() => aiMove(selectedDifficulty), 1000);
                }
            }
        }, 1000);
    }

    function checkForWin() {
        const allRedPieces = document.querySelectorAll(".piece-red").length;
        const allBlackPieces = document.querySelectorAll(".piece-black").length;

        if (allRedPieces === 0) {
            winnerSound.play(); // Play the winner sound
            showWinner("Black Wins!");
        } else if (allBlackPieces === 0) {
            loserSound.play(); // Play the loser sound
            showLoser();
        }
    }

    function showWinner(message) {
        winnerMessage.textContent = message;
        winnerContainer.style.display = "flex";
        startConfetti();
    }

    function showLoser() {
        loserContainer.style.display = "flex";
    }

    function startConfetti() {
        confettiParticles = createConfettiParticles(100);
        requestAnimationFrame(animateConfetti);
    }

    function createConfettiParticles(count) {
        let particles = [];
        for (let i = 0; i < count; i++) {
            particles.push({
                x: Math.random() * confettiCanvas.width,
                y: Math.random() * confettiCanvas.height,
                r: Math.random() * 4 + 1,
                d: Math.random() * 2 + 1,
                color: `hsl(${Math.random() * 360}, 100%, 50%)`,
                tilt: Math.random() * 10,
                tiltAngle: Math.random() * Math.PI * 2,
                tiltAngleIncrement: Math.random() * 0.07 + 0.05,
            });
        }
        return particles;
    }

    function animateConfetti() {
        confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

        confettiParticles.forEach(particle => {
            particle.tiltAngle += particle.tiltAngleIncrement;
            particle.y += Math.cos(particle.tiltAngle) + particle.d;
            particle.x += Math.sin(particle.tiltAngle) * 2;

            if (particle.y > confettiCanvas.height) {
                particle.y = 0;
                particle.x = Math.random() * confettiCanvas.width;
            }

            confettiCtx.beginPath();
            confettiCtx.arc(particle.x, particle.y, particle.r, 0, Math.PI * 2, false);
            confettiCtx.fillStyle = particle.color;
            confettiCtx.fill();
        });

        requestAnimationFrame(animateConfetti);
    }

    // Ensure the canvas size matches the window size
    window.addEventListener('resize', function() {
        confettiCanvas.width = window.innerWidth;
        confettiCanvas.height = window.innerHeight;
    });

    // Initial canvas setup
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;

    // Function to reset the game without reloading the page
    function resetGame() {
        // Clear the board and reset game variables
        board.innerHTML = ""; 
        selectedPieceSquare = null;
        currentPlayer = "red";
        isAiTurn = false;

        // Clear highlights
        document.querySelectorAll(".highlight").forEach(sq => sq.classList.remove("highlight"));

        // Reset any other game state variables or elements as necessary
        winnerContainer.style.display = "none";
        loserContainer.style.display = "none";

        // Recreate the board and restart the game
        createBoard();

        if (selectedMode && selectedMode.startsWith("timed")) {
            startTimer(selectedTimeLimit);
        }

        updateTurnIndicator();
    }
});
