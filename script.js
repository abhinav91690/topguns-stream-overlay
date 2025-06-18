// script.js
import {mock_1stInnings, mock_2ndInnings, mock_matchEnded, mock_toss} from './mockData.js';

const imageCache = {
    team1Logo: { url: null, image: null },
    team2Logo: { url: null, image: null },
};

function updateScore() {
    // **Dynamically construct API URL from query parameter**
    const urlParams = new URLSearchParams(window.location.search);
    const matchId = urlParams.get('matchId'); // Get matchId from query parameter
    const cId = urlParams.get('cId'); // Get clubId from query parameter
    const logo = urlParams.get('logo'); // Get logo from query parameter
    let clubId;

    if (!cId) {
        clubId='1089463'; // LPCL
    }
    else
    {
        clubId = cId; // Any Other League
    }

    const apiUrl = `https://cricclubs.com/liveScoreOverlayData.do?clubId=${clubId}&matchId=${matchId}`;

    const overlayImage = document.getElementById('overlay-image');

    if (!logo) {
        overlayImage.style.display = 'none';
    } else {
        const logoMap = {
            '1': './images/PulteHomes.png',
            '2': './images/PerryHomes.png',
        };
        overlayImage.src = logoMap[logo] || '';
    }

    if (!matchId) {
        console.error('matchId query parameter is missing in the URL.');
        document.getElementById('team-name').textContent = 'Missing matchId';
        return;
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
            // data = mock_1stInnings;
            /*
            const matchName = data.values.seriesName || 'Match Name';
            const runRate = data.values.runrate || '0.00';
            const partnership = data.values.currentPartnershipMap?.partnershipTotalRuns || '0';
            */

            const team1Logo = `https://cricclubs.com` + data.values.firstLogo || '';
            const team2Logo = `https://cricclubs.com` + data.values.secondLogo || '';

            if (imageCache.team1Logo.url !== team1Logo || !imageCache.team1Logo.image) {
                loadImage(team1Logo)
                    .then(img => {
                        imageCache.team1Logo = { url: team1Logo, image: img } ;
                        document.getElementById('batting-team-logo').src = img.src;
                    })
                    .catch(error => {
                        console.error('Error loading first logo:', error);
                    });
            }

            if (imageCache.team2Logo.url !== team2Logo || !imageCache.team2Logo.image) {
                loadImage(team2Logo)
                    .then(img => {
                        imageCache.team2Logo = { url: team2Logo, image: img } ;
                        document.getElementById('bowling-team-logo').src = img.src;
                    })
                    .catch(error => {
                        console.error('Error loading first logo:', error);
                    });
            }

            const batsman1Name = data.values.batsman1Name || 'Batsman 1 *';
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
            // const ballsArray = ["1wd", ".", "1", "2", "3", "4", "5", "6"]; //Sample array
            // const ballsArray = ["1wd", ".", "1", "2", "3", "4", "5", "6", "5nb", "2nb", "1lb", "1b", "W"]; //Sample array

            // Update HTML elements - Scoreboard data
            document.getElementById('batsman1-name').textContent =  `${batsman1Name} *`;
            document.getElementById('batsman1-runs-balls').textContent = `${batsman1Runs} (${batsman1Balls})`;
            document.getElementById('batsman2-name').textContent = batsman2Name;
            document.getElementById('batsman2-runs-balls').textContent = `${batsman2Runs} (${batsman2Balls})`;

            document.getElementById('bowler-name').textContent = bowlerName;
            document.getElementById('bowler-figures').textContent = `${bowlerWickets}-${bowlerRunsGiven} (${bowlerOvers})`;

            let teamName,teamScore,teamWickets,teamOvers;


            if(data.values.isSecondInningsStarted === "false")
            {
                // First Innings
                teamName = data.values.t1Name || 'Team 1';
                teamScore = data.values.t1Total || '0';
                teamWickets = data.values.t1Wickets || '0';
                teamOvers = data.values.t1Overs || '0.0';

                document.getElementById('team-name').textContent = teamName;
                document.getElementById('team-score').textContent = teamScore;
                document.getElementById('team-wickets').textContent = `/${teamWickets}`;
                document.getElementById('team-overs').textContent = `(${teamOvers})`;

                document.getElementById('secondInnings').style.display = 'none';
                document.getElementById('result').style.display = 'none';
            }
            else
            {
                // Second Innings

                teamName = data.values.t2Name || 'Team 2';
                teamScore = data.values.t2Total || '0';
                teamWickets = data.values.t2Wickets || '0';
                teamOvers = data.values.t2Overs || '0.0';

                document.getElementById('team-name').textContent = teamName;
                document.getElementById('team-score').textContent = teamScore;
                document.getElementById('team-wickets').textContent = `/${teamWickets}`;
                document.getElementById('team-overs').textContent = `(${teamOvers})`;

                const team1Name = data.values.t1Name || 'Team 1';
                const team1Score = data.values.t1Total || '0';
                const team1Wickets = data.values.t1Wickets || '0';
                const team1Overs = data.values.t1Overs || '0.0';

                document.getElementById('second-team-name').textContent = team1Name;
                document.getElementById('second-team-score').textContent = team1Score;
                document.getElementById('second-team-wickets').textContent = team1Wickets;
                document.getElementById('second-team-overs').textContent = `(${team1Overs})`;

                const scoreNeeded = data.values.showMsgForScoreNeeded || '-';
                document.getElementById('score-needed').innerHTML = `${scoreNeeded}`;

                if (data.values.isMatchEnded === "0")
                {
                    // Second Innings

                    document.getElementById('secondInnings').style.display = 'flex';
                    document.getElementById('result').style.display = 'none';
                }
                else
                {

                    // Match ended
                    const matchResult = data.values.result || 'Match Result';
                    document.getElementById('match-result').textContent = `${matchResult}`;
                    document.getElementById('score-needed').style.display = 'none';
                    // document.getElementById('batsman-info').style.display = 'none';
                    // document.getElementById('bowler-info').style.display = 'none';

                    document.getElementById('secondInnings').style.display = 'flex';
                    document.getElementById('result').style.display = 'flex';
                }
            }

            // Update Ball-by-ball indicators
            const ballContainer = document.getElementById('ball-by-ball');
            ballContainer.innerHTML = ''; // Clear existing indicators

            for (const element of ballsArray) {
                const ballOutcome = element;
                const ballIndicator = document.createElement('div');
                ballIndicator.classList.add('ball-indicator');
                ballIndicator.textContent = ballOutcome
                ballIndicator.classList.add(getBallStyleClass(ballOutcome));
                ballContainer.appendChild(ballIndicator);
            }

            const ballsRemaining = 6 - teamOvers.split('.')[1];
            if (ballsRemaining === 6 && ballsArray.length > 1 )
            {
                // Game ended with complete over example - matchId=1963
            }
            else
            {
            for (let i=0;i<ballsRemaining;i++) {
                const ballIndicator = document.createElement('div');
                ballIndicator.classList.add('ball-indicator');
                ballContainer.appendChild(ballIndicator);
            }
            }

        })
        .catch(error => {
            console.error('Error fetching score data:', error);
            document.getElementById('team-name').textContent = 'Error';
        });
    }


function getBallStyleClass(ballOutcome) {
    ballOutcome = ballOutcome.toLowerCase(); // Still convert to lowercase for easier comparison

    if (ballOutcome === 'w') {
        return 'wicket'; // Wicket (W, wicket, out)
    } else if (ballOutcome === 'wd' || ballOutcome.endsWith('wd')) { // Wide (wd, ends with wd)
        return 'wide';
    } else if (ballOutcome === 'nb' || ballOutcome.endsWith('nb')) { // No Ball (nb, ends with nb)
        return 'no-ball';
    } else if (ballOutcome === '1lb' || ballOutcome.endsWith('lb')) { // Leg Bye (1lb, ends with lb)
        return 'leg-bye';
    } else if (ballOutcome === '1b' || ballOutcome.endsWith('b')) { // Bye (nb, ends with nb, no-ball)
        return 'bye';
    } else if (ballOutcome === '.') {
        return 'dot'; // Dot (.) or dot
    } else if (['1', '2', '3', '4', '5', '6'].includes(ballOutcome)) { // Runs (numbers "1" to "6" directly)
        return `run-${ballOutcome}`;
    }
    return 'ball-default'; // Default for any unhandled outcomes
}

function loadImage(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
        img.src = url;
    });
}

updateScore(); // Initial call
setInterval(updateScore, 5000); // Update every 5 seconds
