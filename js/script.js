// script.js
import { mock_1stInnings, mock_2ndInnings, mock_matchEnded, mock_toss, mock_noTeamImage } from './mockData.js';
import { sampleReplayData } from './replayData.js';
import { CONFIG } from './config.js';
import { DOM } from './dom.js';
import { getQueryParams } from './utils.js';
import { applyTheme, updateLogo } from './theme.js';
import { fetchScoreData } from './api.js';
import { updateTeamLogos, updateScoreboard } from './ui.js';

let replayIndex = 0;

async function updateScore() {
    const params = getQueryParams();
    applyTheme(params.theme);
    updateLogo(params.logo);

    if (params.mode === 'replay') {
        const data = sampleReplayData[replayIndex];
        updateScoreboard(data);
        replayIndex = (replayIndex + 1) % sampleReplayData.length;
        return;
    }

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
                case '5':
                    data = mock_noTeamImage;
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
