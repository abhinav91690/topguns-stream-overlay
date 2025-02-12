// script.js
function updateScore() {
    // **Dynamically construct API URL from query parameter**
    const urlParams = new URLSearchParams(window.location.search);
    const matchId = urlParams.get('matchId'); // Get matchId from query parameter
    const clubId = '1089463'; // Hardcoded clubId (from your example)
    const apiUrl = `https://cricclubs.com/liveScoreOverlayData.do?clubId=${clubId}&matchId=${matchId}`;

    if (!matchId) {
        console.error('matchId query parameter is missing in the URL.');
        // Display an error message on the overlay if matchId is missing
        document.getElementById('team1-score').textContent = 'Missing matchId';
        document.getElementById('team2-score').textContent = 'Missing matchId';
        document.getElementById('current-overs').textContent = 'Missing matchId';
        return; // Stop further execution if matchId is missing
    }


    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            // ... (Data extraction and HTML updating - same as before) ...
            const team1Name = data.values.t1Name || 'Team 1';
            const team2Name = data.values.t2Name || 'Team 2';
            const team1Score = data.values.t1Total || '0';
            const team1Wickets = data.values.t1Wickets || '0';
            const team1Overs = data.values.t1Overs || '0.0';
            const team2Score = data.values.t2Total || '0';
            const team2Wickets = data.values.t2Wickets || '0';
            const team2Overs = data.values.t2Overs || '0.0';


            const matchName = data.values.seriesName || 'Match Name';
            const runRate = data.values.runrate || '0.00';
            const partnership = data.values.currentPartnershipMap?.partnershipTotalRuns || '0';

            const batsman1Name = data.values.batsman1Name || 'Batsman 1';
            const batsman1Runs = data.values.batsman1Runs || '0';
            const batsman1Balls = data.values.batsman1Balls || '0';
            const batsman2Name = data.values.batsman2Name || 'Batsman 2';
            const batsman2Runs = data.values.batsman2Runs || '0';
            const batsman2Balls = data.values.batsman2Balls || '0';

            const bowlerName = data.values.bowlerName || 'Bowler Name';
            const bowlerWickets = data.values.bowlerWickets || '0';
            const bowlerRunsGiven = data.values.bowlerRuns || '0';
            const bowlerOvers = data.values.bowlerOvers || '0.0';

            const ballsArray = data.balls || [];
            // const ballsArray = ["1wd", "0", "1", "2", "3", "4", "5", "6", "5nb", "2nb", "1lb", "2", "1b", "1", "W"]; //Sample array

            // Update HTML elements - Scoreboard data
            document.getElementById('team1-name').textContent = team1Name;
            document.getElementById('team1-score').textContent = team1Score;
            document.getElementById('team1-wickets').textContent = team1Wickets;
            document.getElementById('team1-overs-display').textContent = `(${team1Overs})`;
            document.getElementById('team2-name').textContent = team2Name;
            document.getElementById('team2-score').textContent = team2Score;
            document.getElementById('team2-wickets').textContent = team2Wickets;
            document.getElementById('team2-overs-display').textContent = `(${team2Overs})`;

            document.getElementById('batsman1-name').textContent = batsman1Name;
            document.getElementById('batsman1-runs-balls').textContent = `(${batsman1Runs} off ${batsman1Balls})`;
            document.getElementById('batsman2-name').textContent = batsman2Name;
            document.getElementById('batsman2-runs-balls').textContent = `(${batsman2Runs} off ${batsman2Balls})`;

            document.getElementById('bowler-name').textContent = bowlerName;
            document.getElementById('bowler-figures').textContent = `${bowlerWickets}/${bowlerRunsGiven} (${bowlerOvers})`;


            // Update Ball-by-ball indicators
            const ballContainer = document.getElementById('ball-by-ball');
            ballContainer.innerHTML = ''; // Clear existing indicators

            for (let i = 0; i < ballsArray.length; i++) { // Display max 6 balls
                const ballOutcome = ballsArray[i];
                const ballIndicator = document.createElement('div');
                ballIndicator.classList.add('ball-indicator');
                ballIndicator.textContent = ballOutcome
                ballIndicator.classList.add(getBallStyleClass(ballOutcome)); // Add style class
                ballContainer.appendChild(ballIndicator);
            }


        })
        .catch(error => {
            console.error('Error fetching score data:', error);
            // Basic error display
            document.getElementById('team1-score').textContent = 'Error';
            document.getElementById('team2-score').textContent = 'Error';
            document.getElementById('current-overs').textContent = 'Error';
        });
    }


    function getBallStyleClass(ballOutcome) {
        ballOutcome = ballOutcome.toLowerCase(); // Still convert to lowercase for easier comparison

        if (ballOutcome === 'w') {
            return 'wicket'; // Wicket (W, wicket, out)
        } else if (ballOutcome === 'wd' || ballOutcome.endsWith('wd')) { // Wide (wd, ends with wd, wide)
            return 'wide';
        } else if (ballOutcome === 'nb' || ballOutcome.endsWith('nb')) { // No Ball (nb, ends with nb, no-ball)
            return 'no-ball';
        } else if (ballOutcome === '1lb' || ballOutcome.endsWith('lb')) { // No Ball (nb, ends with nb, no-ball)
            return 'leg-bye';
        } else if (ballOutcome === '.') {
            return 'dot'; // Dot (.) or dot
        } else if (['1', '2', '3', '4', '5', '6'].includes(ballOutcome)) { // Runs (numbers "1" to "6" directly)
            return `run-${ballOutcome}`;
        }
        return 'ball-default'; // Default for any unhandled outcomes
    }

    updateScore(); // Initial call
    setInterval(updateScore, 5000); // Update every 5 seconds
