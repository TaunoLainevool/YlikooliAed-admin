document.addEventListener('DOMContentLoaded', function() {
    loadScores();
    loadStats();
});

async function loadScores() {
    const loadingIndicator = document.getElementById('loadingIndicator');
    const scoresTable = document.getElementById('scoresTable');
    
    try {
        loadingIndicator.style.display = 'block';
        scoresTable.style.display = 'none';
        
        const response = await fetch(`/api/scores?limit=20`);
        const data = await response.json();
        
        if (data.success) {
            displayScores(data.scores);
        } else {
            throw new Error(data.error || 'Failed to load scores');
        }
    } catch (error) {
        console.error('Error loading scores:', error);
        showMessage('Error loading scores. Please try again.', 'error');
    } finally {
        loadingIndicator.style.display = 'none';
        scoresTable.style.display = 'table';
    }
}

async function loadStats() {
    try {
        const response = await fetch(`/api/stats?`);
        const data = await response.json();
        
        if (data.success) {
            const stats = data.scores[0];
            document.getElementById('totalGames').textContent = stats.total_games || 0;
            document.getElementById('highestScore').textContent = stats.highest_score || 0;
            document.getElementById('averageScore').textContent = stats.average_score || 0;
            document.getElementById('uniquePlayers').textContent = stats.unique_players || 0;
        }
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

function displayScores(scores) {
    const tbody = document.getElementById('scoresBody');
    tbody.innerHTML = '';
    
    if (scores.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: #666; padding: 40px;">No scores available for this game mode.</td></tr>';
        return;
    }
    
    scores.forEach((score, index) => {
        const row = document.createElement('tr');
        const rank = index + 1;
        
        let rankClass = 'rank';
        if (rank === 1) rankClass += ' gold';
        else if (rank === 2) rankClass += ' silver';
        else if (rank === 3) rankClass += ' bronze';
        
        const date = new Date(score.created_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        row.innerHTML = `
            <td><span class="${rankClass}">#${rank}</span></td>
            <td>${escapeHtml(score.player_name)}</td>
            <td><span class="score">${score.score.toLocaleString()}</span></td>
            <td>${date}</td>
        `;
        
        tbody.appendChild(row);
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

setInterval(function() {
    loadScores();
    loadStats();
}, 30000);