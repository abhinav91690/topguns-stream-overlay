import { DOM } from './dom.js';
import { loadImage, getBallStyleClass } from './utils.js';

const imageCache = {
    team1Logo: { url: null, image: null },
    team2Logo: { url: null, image: null },
};

let lastBallState = { balls: '', overs: '' };

export async function updateTeamLogos(data) {
    const getFullUrl = (path) => {
        if (!path) return '';
        if (path.startsWith('http://') || path.startsWith('https://')) {
            return path;
        }
        return `https://cricclubs.com${path}`;
    };

    const team1LogoUrl = getFullUrl(data.values.firstLogo);
    const team2LogoUrl = getFullUrl(data.values.secondLogo);

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

export function updateBallByBall(ballsArray, teamOvers) {
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

export function updateScoreboard(data) {
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

    const currentOvers = data.values.isSecondInningsStarted === "true"
        ? data.values.t2Overs
        : data.values.t1Overs;
    updateBallByBall(data.balls || [], currentOvers || '0.0');
}
