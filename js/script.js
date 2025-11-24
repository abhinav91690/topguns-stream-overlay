// script.js
import { mock_1stInnings, mock_2ndInnings, mock_matchEnded, mock_toss } from './mockData.js';

const CONFIG = {
    REFRESH_RATE: 5000,
    DEFAULT_CLUB_ID: '1089463', // LPCL
    LOGO_MAP: {
        '1': '../assets/images/PulteHomes.png',
        '2': '../assets/images/PerryHomes.png',
    }
};

const DOM = {
    overlayImage: document.getElementById('overlay-image'),
    battingTeamLogo: document.getElementById('batting-team-logo'),
    bowlingTeamLogo: document.getElementById('bowling-team-logo'),
    batsman1Name: document.getElementById('batsman1-name'),
    batsman1RunsBalls: document.getElementById('batsman1-runs-balls'),
    batsman2Name: document.getElementById('batsman2-name'),
    batsman2RunsBalls: document.getElementById('batsman2-runs-balls'),
    bowlerName: document.getElementById('bowler-name'),
    bowlerFigures: document.getElementById('bowler-figures'),
    bowlerWicketsRuns: document.getElementById('bowler-wickets-runs'),
    bowlerOvers: document.getElementById('bowler-overs'),
    teamName: document.getElementById('team-name'),
    teamScore: document.getElementById('team-score'),
    teamWickets: document.getElementById('team-wickets'),
    teamOvers: document.getElementById('team-overs'),
    secondInnings: document.getElementById('secondInnings'),
    result: document.getElementById('result'),
    matchResult: document.getElementById('match-result'),
    secondTeamName: document.getElementById('second-team-name'),
    secondTeamScore: document.getElementById('second-team-score'),
    secondTeamWickets: document.getElementById('second-team-wickets'),
    secondTeamOvers: document.getElementById('second-team-overs'),
    scoreNeeded: document.getElementById('score-needed'),
    ballContainer: document.getElementById('ball-by-ball'),
    batsmanInfo: document.getElementById('batsman-info'),
    bowlerInfo: document.getElementById('bowler-info'),
};

const imageCache = {
    team1Logo: { url: null, image: null },
    team2Logo: { url: null, image: null },
};

function getQueryParams() {
    const urlParams = new URLSearchParams(window.location.search);
    return {
        matchId: urlParams.get('matchId'),
        clubId: urlParams.get('cId') || CONFIG.DEFAULT_CLUB_ID,
        logo: urlParams.get('logo'),
        debug: urlParams.get('debug'), // Returns string value or null
        theme: urlParams.get('theme')
    };
}

function applyTheme(theme) {
    const themeLink = document.getElementById('theme-stylesheet');
    if (theme === 'classic') {
        themeLink.href = 'css/theme-classic.css';
    } else {
        themeLink.href = 'css/theme-modern.css';
    }
}

function updateLogo(logoParam) {
    if (!logoParam) {
        DOM.overlayImage.style.display = 'none';
    } else {
        DOM.overlayImage.src = CONFIG.LOGO_MAP[logoParam] || '';
        DOM.overlayImage.style.display = 'block';
    }
}

async function loadImage(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
        img.src = url;
    });
}

async function updateTeamLogos(data) {
    const team1LogoUrl = `https://cricclubs.com${data.values.firstLogo || ''}`;
    const team2LogoUrl = `https://cricclubs.com${data.values.secondLogo || ''}`;

    if (imageCache.team1Logo.url !== team1LogoUrl || !imageCache.team1Logo.image) {
        try {
            const img = await loadImage(team1LogoUrl);
            imageCache.team1Logo = { url: team1LogoUrl, image: img };
            DOM.battingTeamLogo.src = img.src;
        } catch (error) {
            console.error('Error loading first logo:', error);
        }
    }

    if (imageCache.team2Logo.url !== team2LogoUrl || !imageCache.team2Logo.image) {
        try {
            const img = await loadImage(team2LogoUrl);
            imageCache.team2Logo = { url: team2LogoUrl, image: img };
            DOM.bowlingTeamLogo.src = img.src;
        } catch (error) {
            console.error('Error loading second logo:', error);
        }
    }
}

function getBallStyleClass(ballOutcome) {
    const outcome = ballOutcome.toLowerCase();
    if (outcome === 'w') return 'wicket';
    if (outcome === 'wd' || outcome.endsWith('wd')) return 'wide';
    if (outcome === 'nb' || outcome.endsWith('nb')) return 'no-ball';
    if (outcome === '1lb' || outcome.endsWith('lb')) return 'leg-bye';
    if (outcome === '1b' || outcome.endsWith('b')) return 'bye';
    if (outcome === '.') return 'dot';
    if (['1', '2', '3', '4', '5', '6'].includes(outcome)) return `run-${outcome}`;
    return 'ball-default';
}

let lastBallState = { balls: '', overs: '' };

function updateBallByBall(ballsArray, teamOvers) {
    const currentBallsJson = JSON.stringify(ballsArray);
    if (currentBallsJson === lastBallState.balls && teamOvers === lastBallState.overs) {
        return;
    }
    lastBallState = { balls: currentBallsJson, overs: teamOvers };

    DOM.ballContainer.innerHTML = '';

    ballsArray.forEach(ballOutcome => {
        const ballIndicator = document.createElement('div');
        ballIndicator.className = `ball-indicator ${getBallStyleClass(ballOutcome)}`;
        ballIndicator.textContent = ballOutcome;
        DOM.ballContainer.appendChild(ballIndicator);
    });

    const ballsRemaining = 6 - (teamOvers.split('.')[1] || 0);
    if (ballsRemaining < 6 || ballsArray.length <= 1) {
        for (let i = 0; i < ballsRemaining; i++) {
            const ballIndicator = document.createElement('div');
            ballIndicator.classList.add('ball-indicator');
            DOM.ballContainer.appendChild(ballIndicator);
        }
    }
}

function updateScoreboard(data) {
    // Batsman Info
    DOM.batsman1Name.textContent = `${data.values.batsman1Name || 'Batsman 1'} *`;
    DOM.batsman1RunsBalls.textContent = `${data.values.batsman1Runs || '0'} (${data.values.batsman1Balls || '0'})`;
    DOM.batsman2Name.textContent = data.values.batsman2Name || 'Batsman 2';
    DOM.batsman2RunsBalls.textContent = `${data.values.batsman2Runs || '0'} (${data.values.batsman2Balls || '0'})`;

    // Bowler Info
    DOM.bowlerName.textContent = data.values.bowlerName || 'Bowler Name';
    DOM.bowlerWicketsRuns.textContent = `${data.values.bowlerWickets || '0'}-${data.values.bowlerRuns || '0'}`;
    DOM.bowlerOvers.textContent = `${data.values.bowlerOvers || '0.0'}`;

    // Innings Info
    if (data.values.isSecondInningsStarted === "false") {
        // First Innings
        DOM.teamName.textContent = data.values.t1Name || 'Team 1';
        DOM.teamScore.textContent = data.values.t1Total || '0';
        DOM.teamWickets.textContent = `/ ${data.values.t1Wickets || '0'}`;
        DOM.teamOvers.textContent = `${data.values.t1Overs || '0.0'}`;

        DOM.secondInnings.style.display = 'none';
        DOM.result.style.display = 'none';
    } else {
        // Second Innings
        DOM.teamName.textContent = data.values.t2Name || 'Team 2';
        DOM.teamScore.textContent = data.values.t2Total || '0';
        DOM.teamWickets.textContent = `/ ${data.values.t2Wickets || '0'}`;
        DOM.teamOvers.textContent = `${data.values.t2Overs || '0.0'}`;

        DOM.secondTeamName.textContent = data.values.t1Name || 'Team 1';
        DOM.secondTeamScore.textContent = data.values.t1Total || '0';
        DOM.secondTeamWickets.textContent = data.values.t1Wickets || '0';
        DOM.secondTeamOvers.textContent = `${data.values.t1Overs || '0.0'}`;

        DOM.scoreNeeded.innerHTML = data.values.showMsgForScoreNeeded || '-';

        if (data.values.isMatchEnded === "0") {
            DOM.secondInnings.style.display = 'flex';
            DOM.result.style.display = 'none';
            DOM.scoreNeeded.style.display = 'block';
        } else {
            DOM.matchResult.textContent = data.values.result || 'Match Result';
            DOM.scoreNeeded.style.display = 'none';
            DOM.secondInnings.style.display = 'flex';
            DOM.result.style.display = 'flex';
        }
    }

    updateBallByBall(data.balls || [], data.values.t1Overs || '0.0'); // Note: t1Overs might need to be dynamic based on innings
}

async function fetchScoreData(apiUrl) {
    const response = await fetch(apiUrl);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
}

async function updateScore() {
    const params = getQueryParams();
    applyTheme(params.theme);
    updateLogo(params.logo);

    if (!params.matchId && !params.debug) {
        console.error('matchId query parameter is missing in the URL.');
        DOM.teamName.textContent = 'Missing matchId';
        return;
    }

    try {
        let data;
        if (params.debug) {
            // Mock Data Logic
            switch (params.debug) {
                case '2':
                    data = mock_2ndInnings;
                    break;
                case '3':
                    data = mock_matchEnded;
                    break;
                case '4':
                    data = mock_toss;
                    break;
                case '1':
                case 'true':
                default:
                    data = mock_1stInnings;
                    break;
            }
            console.log(`Using mock data: ${params.debug}`);
        } else {
            const apiUrl = `https://cricclubs.com/liveScoreOverlayData.do?clubId=${params.clubId}&matchId=${params.matchId}`;
            data = await fetchScoreData(apiUrl);
        }

        await updateTeamLogos(data);
        updateScoreboard(data);

    } catch (error) {
        console.error('Error fetching score data:', error);
        DOM.teamName.textContent = 'Error';
    }
}

// Initial call
updateScore();
// Update loop
setInterval(updateScore, CONFIG.REFRESH_RATE);
