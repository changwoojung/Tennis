document.addEventListener('DOMContentLoaded', function() {
    // Tab switching functionality
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked button and corresponding content
            button.classList.add('active');
            const tabId = button.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });
    
    // Load match data from local storage
    loadMatchData();
    
    // Load player names from local storage
    // Note: This is now redundant as player names are included in match data,
    // but keeping for backward compatibility
    loadPlayerNames();
    
    // Add event listeners for score inputs
    const scoreInputs = document.querySelectorAll('.score-input');
    scoreInputs.forEach(input => {
        input.addEventListener('input', updateResults);
    });
    
    // Add event listeners for team selections
    const teamSelects = document.querySelectorAll('.team-select');
    teamSelects.forEach(select => {
        select.addEventListener('change', updateResults);
    });
    
    // Add event listeners for player name inputs
    setupPlayerNameInputListeners();
    
    // Add new row buttons
    document.getElementById('add-doubles-row').addEventListener('click', () => {
        addNewRow('doubles-table');
    });
    
    document.getElementById('add-singles-row').addEventListener('click', () => {
        addNewRow('singles-table');
    });
    
    // Initial calculation
    updateResults();
    
    // Add event listener for update finals button
    const updateFinalsBtn = document.getElementById('update-finals');
    if (updateFinalsBtn) {
        updateFinalsBtn.addEventListener('click', updateFinalMatches);
    }
    
    // Initialize photo gallery
    initPhotoGallery();
});

// Function to update final matches based on current rankings
function updateFinalMatches() {
    // Calculate current rankings
    const results = calculateTeamResults();
    const { finalRanking } = updateRankings(results);
    
    // Make sure we have enough teams
    if (finalRanking.length < 4) {
        alert('Not enough teams to determine final matches.');
        return;
    }
    
    // Get the finals table rows
    const finalsRows = document.querySelectorAll('#finals-table tbody tr');
    if (finalsRows.length < 2) {
        alert('Finals table not properly set up.');
        return;
    }
    
    // Update 3rd vs 4th place match
    const thirdVsFourthRow = finalsRows[0];
    const teamA3v4 = thirdVsFourthRow.querySelector('.team-a');
    const teamB3v4 = thirdVsFourthRow.querySelector('.team-b');
    
    if (teamA3v4 && teamB3v4) {
        teamA3v4.value = finalRanking[2]; // 3rd place
        teamB3v4.value = finalRanking[3]; // 4th place
    }
    
    // Update 1st vs 2nd place match
    const firstVsSecondRow = finalsRows[1];
    const teamA1v2 = firstVsSecondRow.querySelector('.team-a');
    const teamB1v2 = firstVsSecondRow.querySelector('.team-b');
    
    if (teamA1v2 && teamB1v2) {
        teamA1v2.value = finalRanking[0]; // 1st place
        teamB1v2.value = finalRanking[1]; // 2nd place
    }
    
    // Update the matchup descriptions
    const matchupDesc3v4 = thirdVsFourthRow.querySelector('.matchup-description');
    const matchupDesc1v2 = firstVsSecondRow.querySelector('.matchup-description');
    
    if (matchupDesc3v4) {
        matchupDesc3v4.textContent = `3rd place (Team ${finalRanking[2]}) vs 4th place (Team ${finalRanking[3]})`;
    }
    
    if (matchupDesc1v2) {
        matchupDesc1v2.textContent = `1st place (Team ${finalRanking[0]}) vs 2nd place (Team ${finalRanking[1]})`;
    }
    
    // Enable the score inputs
    const scoreInputs = document.querySelectorAll('#finals-table .score-input');
    scoreInputs.forEach(input => {
        input.disabled = false;
    });
    
    // Add event listeners to the score inputs
    scoreInputs.forEach(input => {
        // Remove existing event listeners
        const newInput = input.cloneNode(true);
        input.parentNode.replaceChild(newInput, input);
        
        // Add new event listener
        newInput.addEventListener('input', () => {
            calculateWinners();
            updateFinalRankings();
        });
    });
}

// Function to update final rankings based on final match results
function updateFinalRankings() {
    // Get the finals table rows
    const finalsRows = document.querySelectorAll('#finals-table tbody tr');
    if (finalsRows.length < 2) {
        return;
    }
    
    // Get the winners of the final matches
    const thirdVsFourthRow = finalsRows[0];
    const firstVsSecondRow = finalsRows[1];
    
    const winner3v4 = thirdVsFourthRow.querySelector('.winner-cell').textContent;
    const winner1v2 = firstVsSecondRow.querySelector('.winner-cell').textContent;
    
    // If we don't have winners yet, return
    if (!winner3v4 || !winner1v2) {
        return;
    }
    
    // Get the teams
    const teamA3v4 = thirdVsFourthRow.querySelector('.team-a').value;
    const teamB3v4 = thirdVsFourthRow.querySelector('.team-b').value;
    const teamA1v2 = firstVsSecondRow.querySelector('.team-a').value;
    const teamB1v2 = firstVsSecondRow.querySelector('.team-b').value;
    
    // Determine final rankings
    let champion, runnerUp, third, fourth;
    
    if (winner1v2 === `Team ${teamA1v2}`) {
        champion = teamA1v2;
        runnerUp = teamB1v2;
    } else if (winner1v2 === `Team ${teamB1v2}`) {
        champion = teamB1v2;
        runnerUp = teamA1v2;
    }
    
    if (winner3v4 === `Team ${teamA3v4}`) {
        third = teamA3v4;
        fourth = teamB3v4;
    } else if (winner3v4 === `Team ${teamB3v4}`) {
        third = teamB3v4;
        fourth = teamA3v4;
    }
    
    // Update the final ranking list
    const finalRankingList = document.getElementById('final-ranking');
    if (finalRankingList && champion && runnerUp && third && fourth) {
        finalRankingList.innerHTML = '';
        
        const teams = [champion, runnerUp, third, fourth];
        teams.forEach((team, index) => {
            const li = document.createElement('li');
            li.textContent = `Team ${team}`;
            if (index === 0) {
                li.textContent += ' (Champion)';
                li.style.fontWeight = 'bold';
                li.style.color = 'gold';
            } else if (index === 1) {
                li.textContent += ' (Runner-up)';
                li.style.fontWeight = 'bold';
                li.style.color = 'silver';
            }
            finalRankingList.appendChild(li);
        });
    }
}

// Function to add a new match row
function addNewRow(tableId) {
    const tbody = document.querySelector(`#${tableId} tbody`);
    const newRow = document.createElement('tr');
    
    // Create time cell
    const timeCell = document.createElement('td');
    timeCell.innerHTML = '<input type="text" placeholder="Time">';
    newRow.appendChild(timeCell);
    
    // Create court cell
    const courtCell = document.createElement('td');
    courtCell.innerHTML = '<input type="text" placeholder="Court">';
    newRow.appendChild(courtCell);
    
    // If this is a singles match, add the matchup description cell
    if (tableId === 'singles-table') {
        const matchupCell = document.createElement('td');
        matchupCell.className = 'matchup-description';
        matchupCell.textContent = 'Custom matchup';
        newRow.appendChild(matchupCell);
    }
    
    // Create team A cell
    const teamACell = document.createElement('td');
    teamACell.innerHTML = `
        <select class="team-select team-a">
            <option value="1">Team 1</option>
            <option value="2">Team 2</option>
            <option value="3">Team 3</option>
            <option value="4">Team 4</option>
            <option value="5">Team 5</option>
        </select>
    `;
    newRow.appendChild(teamACell);
    
    // If singles match, add player A name input
    if (tableId === 'singles-table') {
        const playerACell = document.createElement('td');
        playerACell.innerHTML = '<input type="text" class="player-input" placeholder="Player name">';
        newRow.appendChild(playerACell);
    }
    
    // Create team B cell
    const teamBCell = document.createElement('td');
    teamBCell.innerHTML = `
        <select class="team-select team-b">
            <option value="1">Team 1</option>
            <option value="2">Team 2</option>
            <option value="3">Team 3</option>
            <option value="4">Team 4</option>
            <option value="5">Team 5</option>
        </select>
    `;
    newRow.appendChild(teamBCell);
    
    // If singles match, add player B name input
    if (tableId === 'singles-table') {
        const playerBCell = document.createElement('td');
        playerBCell.innerHTML = '<input type="text" class="player-input" placeholder="Player name">';
        newRow.appendChild(playerBCell);
    }
    
    // Create score cell
    const scoreCell = document.createElement('td');
    scoreCell.innerHTML = '<input type="text" class="score-input" placeholder="e.g. 6:0">';
    newRow.appendChild(scoreCell);
    
    // Create winner cell
    const winnerCell = document.createElement('td');
    winnerCell.className = 'winner-cell';
    newRow.appendChild(winnerCell);
    
    // Add the new row to the table
    tbody.appendChild(newRow);
    
    // Add event listeners to the new elements
    const newScoreInput = scoreCell.querySelector('.score-input');
    newScoreInput.addEventListener('input', updateResults);
    
    const newTeamSelects = newRow.querySelectorAll('.team-select');
    newTeamSelects.forEach(select => {
        select.addEventListener('change', updateResults);
    });
    
    // Add event listeners to player name inputs if this is a singles match
    if (tableId === 'singles-table') {
        setupPlayerNameInputListeners();
    }
    
    // Update results after adding a new row
    updateResults();
}

// Function to update all results based on current inputs
function updateResults() {
    // Calculate winners for each match
    calculateWinners();
    
    // Calculate points and game differentials
    const results = calculateTeamResults();
    
    // Update summary table
    updateSummaryTable(results);
    
    // Update rankings
    const { doublesRanking, finalRanking } = updateRankings(results);
    
    // Update singles match schedule based on doubles rankings
    updateSinglesSchedule(doublesRanking);
    
    // Enable the update finals button if we have enough data
    const updateFinalsBtn = document.getElementById('update-finals');
    if (updateFinalsBtn) {
        updateFinalsBtn.disabled = !hasEnoughDataForFinals(results);
    }
    
    // Save match data to localStorage
    saveMatchData();
}

// Function to save match data to localStorage
function saveMatchData() {
    // Save doubles matches
    const doublesData = getTableData('doubles-table');
    
    // Save singles matches
    const singlesData = getTableData('singles-table');
    
    // Save finals matches
    const finalsData = getTableData('finals-table');
    
    // Combine all data
    const matchData = {
        doubles: doublesData,
        singles: singlesData,
        finals: finalsData,
        timestamp: new Date().toISOString()
    };
    
    // Save to localStorage
    try {
        localStorage.setItem('tennisMatchData', JSON.stringify(matchData));
        console.log('Match data saved successfully');
    } catch (e) {
        console.error('Error saving match data to localStorage:', e);
    }
}

// Function to extract data from a table
function getTableData(tableId) {
    const tableData = [];
    const rows = document.querySelectorAll(`#${tableId} tbody tr`);
    
    rows.forEach(row => {
        const rowData = {};
        
        // Get time
        const timeCell = row.querySelector('td:first-child');
        if (timeCell) {
            const timeInput = timeCell.querySelector('input');
            rowData.time = timeInput ? timeInput.value : timeCell.textContent.trim();
        }
        
        // Get court
        const courtCell = row.querySelector('td:nth-child(2)');
        if (courtCell) {
            const courtInput = courtCell.querySelector('input');
            rowData.court = courtInput ? courtInput.value : courtCell.textContent.trim();
        }
        
        // Get matchup description if it exists
        const matchupCell = row.querySelector('.matchup-description');
        if (matchupCell) {
            rowData.matchup = matchupCell.textContent.trim();
        }
        
        // Get team selections
        const teamASelect = row.querySelector('.team-a');
        const teamBSelect = row.querySelector('.team-b');
        if (teamASelect) rowData.teamA = teamASelect.value;
        if (teamBSelect) rowData.teamB = teamBSelect.value;
        
        // Get player names if they exist
        const playerInputs = row.querySelectorAll('.player-input');
        if (playerInputs.length >= 1) rowData.playerA = playerInputs[0].value;
        if (playerInputs.length >= 2) rowData.playerB = playerInputs[1].value;
        
        // Get score
        const scoreInput = row.querySelector('.score-input');
        if (scoreInput) rowData.score = scoreInput.value;
        
        // Get winner
        const winnerCell = row.querySelector('.winner-cell');
        if (winnerCell) rowData.winner = winnerCell.textContent.trim();
        
        tableData.push(rowData);
    });
    
    return tableData;
}

// Function to load match data from localStorage
function loadMatchData() {
    try {
        const savedData = localStorage.getItem('tennisMatchData');
        if (!savedData) {
            console.log('No saved match data found');
            return;
        }
        
        const matchData = JSON.parse(savedData);
        console.log('Loading match data from:', matchData.timestamp);
        
        // Load doubles matches
        if (matchData.doubles) {
            populateTableData('doubles-table', matchData.doubles);
        }
        
        // Load singles matches
        if (matchData.singles) {
            populateTableData('singles-table', matchData.singles);
        }
        
        // Load finals matches
        if (matchData.finals) {
            populateTableData('finals-table', matchData.finals);
        }
        
        // Update results after loading data
        updateResults();
        
        console.log('Match data loaded successfully');
    } catch (e) {
        console.error('Error loading match data from localStorage:', e);
    }
}

// Function to populate a table with saved data
function populateTableData(tableId, tableData) {
    const rows = document.querySelectorAll(`#${tableId} tbody tr`);
    
    // Make sure we have enough rows
    while (rows.length < tableData.length) {
        if (tableId === 'doubles-table') {
            addNewRow('doubles-table');
        } else if (tableId === 'singles-table') {
            addNewRow('singles-table');
        } else {
            // For finals, we don't add new rows
            break;
        }
    }
    
    // Get updated rows after possibly adding new ones
    const updatedRows = document.querySelectorAll(`#${tableId} tbody tr`);
    
    // Populate data
    tableData.forEach((rowData, index) => {
        if (index >= updatedRows.length) return;
        
        const row = updatedRows[index];
        
        // Set time
        if (rowData.time) {
            const timeCell = row.querySelector('td:first-child');
            const timeInput = timeCell.querySelector('input');
            if (timeInput) {
                timeInput.value = rowData.time;
            }
        }
        
        // Set court
        if (rowData.court) {
            const courtCell = row.querySelector('td:nth-child(2)');
            const courtInput = courtCell.querySelector('input');
            if (courtInput) {
                courtInput.value = rowData.court;
            }
        }
        
        // Set team selections
        if (rowData.teamA) {
            const teamASelect = row.querySelector('.team-a');
            if (teamASelect) teamASelect.value = rowData.teamA;
        }
        
        if (rowData.teamB) {
            const teamBSelect = row.querySelector('.team-b');
            if (teamBSelect) teamBSelect.value = rowData.teamB;
        }
        
        // Set player names
        if (rowData.playerA) {
            const playerInputs = row.querySelectorAll('.player-input');
            if (playerInputs.length >= 1) playerInputs[0].value = rowData.playerA;
        }
        
        if (rowData.playerB) {
            const playerInputs = row.querySelectorAll('.player-input');
            if (playerInputs.length >= 2) playerInputs[1].value = rowData.playerB;
        }
        
        // Set score
        if (rowData.score) {
            const scoreInput = row.querySelector('.score-input');
            if (scoreInput) scoreInput.value = rowData.score;
        }
    });
}

// Check if we have enough data to determine final matches
function hasEnoughDataForFinals(results) {
    // Check if we have at least some doubles and singles scores
    const doublesRows = document.querySelectorAll('#doubles-table tbody tr');
    const singlesRows = document.querySelectorAll('#singles-table tbody tr');
    
    let hasDoublesScores = false;
    let hasSinglesScores = false;
    
    doublesRows.forEach(row => {
        const scoreInput = row.querySelector('.score-input');
        if (scoreInput && scoreInput.value.trim()) {
            hasDoublesScores = true;
        }
    });
    
    singlesRows.forEach(row => {
        const scoreInput = row.querySelector('.score-input');
        if (scoreInput && scoreInput.value.trim()) {
            hasSinglesScores = true;
        }
    });
    
    return hasDoublesScores && hasSinglesScores;
}

// Function to calculate winners for each match
function calculateWinners() {
    const scoreInputs = document.querySelectorAll('.score-input');
    
    scoreInputs.forEach(input => {
        const score = input.value.trim();
        if (!score) {
            // Clear winner if no score
            const winnerCell = input.closest('tr').querySelector('.winner-cell');
            winnerCell.textContent = '';
            return;
        }
        
        // Parse score (format: A:B)
        const scoreParts = score.split(':');
        if (scoreParts.length !== 2) {
            return;
        }
        
        const scoreA = parseInt(scoreParts[0]);
        const scoreB = parseInt(scoreParts[1]);
        
        if (isNaN(scoreA) || isNaN(scoreB)) {
            return;
        }
        
        // Determine winner
        const row = input.closest('tr');
        const teamA = row.querySelector('.team-a').value;
        const teamB = row.querySelector('.team-b').value;
        const winnerCell = row.querySelector('.winner-cell');
        
        if (scoreA > scoreB) {
            winnerCell.textContent = `Team ${teamA}`;
        } else if (scoreB > scoreA) {
            winnerCell.textContent = `Team ${teamB}`;
        } else {
            winnerCell.textContent = 'Tie';
        }
    });
}

// Function to calculate team results (points and game differentials)
function calculateTeamResults() {
    // Initialize results object
    const results = {
        1: { doublesPoints: 0, singlesPoints: 0, doublesGamesWon: 0, doublesGamesLost: 0, singlesGamesWon: 0, singlesGamesLost: 0 },
        2: { doublesPoints: 0, singlesPoints: 0, doublesGamesWon: 0, doublesGamesLost: 0, singlesGamesWon: 0, singlesGamesLost: 0 },
        3: { doublesPoints: 0, singlesPoints: 0, doublesGamesWon: 0, doublesGamesLost: 0, singlesGamesWon: 0, singlesGamesLost: 0 },
        4: { doublesPoints: 0, singlesPoints: 0, doublesGamesWon: 0, doublesGamesLost: 0, singlesGamesWon: 0, singlesGamesLost: 0 },
        5: { doublesPoints: 0, singlesPoints: 0, doublesGamesWon: 0, doublesGamesLost: 0, singlesGamesWon: 0, singlesGamesLost: 0 }
    };
    
    // Process doubles matches
    const doublesRows = document.querySelectorAll('#doubles-table tbody tr');
    doublesRows.forEach(row => {
        processMatchRow(row, results, 'doubles');
    });
    
    // Process singles matches
    const singlesRows = document.querySelectorAll('#singles-table tbody tr');
    singlesRows.forEach(row => {
        processMatchRow(row, results, 'singles');
    });
    
    // Calculate totals and differentials
    for (let team in results) {
        const r = results[team];
        r.totalPoints = r.doublesPoints + r.singlesPoints;
        r.doublesDiff = r.doublesGamesWon - r.doublesGamesLost;
        r.singlesDiff = r.singlesGamesWon - r.singlesGamesLost;
        r.totalDiff = r.doublesDiff + r.singlesDiff;
    }
    
    return results;
}

// Function to process a match row and update results
function processMatchRow(row, results, matchType) {
    const scoreInput = row.querySelector('.score-input');
    const score = scoreInput?.value.trim();
    
    if (!score) {
        return;
    }
    
    // Parse score (format: A:B)
    const scoreParts = score.split(':');
    if (scoreParts.length !== 2) {
        return;
    }
    
    const scoreA = parseInt(scoreParts[0]);
    const scoreB = parseInt(scoreParts[1]);
    
    if (isNaN(scoreA) || isNaN(scoreB)) {
        return;
    }
    
    // Get teams
    const teamA = row.querySelector('.team-a').value;
    const teamB = row.querySelector('.team-b').value;
    
    // Update games won/lost
    if (matchType === 'doubles') {
        results[teamA].doublesGamesWon += scoreA;
        results[teamA].doublesGamesLost += scoreB;
        results[teamB].doublesGamesWon += scoreB;
        results[teamB].doublesGamesLost += scoreA;
        
        // Update points (2 points for a win)
        if (scoreA > scoreB) {
            results[teamA].doublesPoints += 2;
        } else if (scoreB > scoreA) {
            results[teamB].doublesPoints += 2;
        } else {
            // Tie (1 point each)
            results[teamA].doublesPoints += 1;
            results[teamB].doublesPoints += 1;
        }
    } else { // singles
        results[teamA].singlesGamesWon += scoreA;
        results[teamA].singlesGamesLost += scoreB;
        results[teamB].singlesGamesWon += scoreB;
        results[teamB].singlesGamesLost += scoreA;
        
        // Update points (1 point for a win)
        if (scoreA > scoreB) {
            results[teamA].singlesPoints += 1;
        } else if (scoreB > scoreA) {
            results[teamB].singlesPoints += 1;
        } else {
            // Tie (0.5 points each)
            results[teamA].singlesPoints += 0.5;
            results[teamB].singlesPoints += 0.5;
        }
    }
}

// Function to update the summary table
function updateSummaryTable(results) {
    const summaryRows = document.querySelectorAll('#summary-table tbody tr');
    
    summaryRows.forEach((row, index) => {
        const teamNum = index + 1;
        const teamResults = results[teamNum];
        
        // Update cells
        row.querySelector('.doubles-points').textContent = teamResults.doublesPoints;
        row.querySelector('.singles-points').textContent = teamResults.singlesPoints;
        row.querySelector('.total-points').textContent = teamResults.totalPoints;
        row.querySelector('.doubles-diff').textContent = teamResults.doublesDiff;
        row.querySelector('.singles-diff').textContent = teamResults.singlesDiff;
        row.querySelector('.final-diff').textContent = teamResults.totalDiff;
    });
}

// Function to update rankings
function updateRankings(results) {
    // Create arrays for ranking
    const teams = [1, 2, 3, 4, 5];
    
    // Sort teams by doubles ranking criteria
    const doublesRanking = [...teams].sort((a, b) => {
        // First by points
        if (results[b].doublesPoints !== results[a].doublesPoints) {
            return results[b].doublesPoints - results[a].doublesPoints;
        }
        // Then by game differential
        return results[b].doublesDiff - results[a].doublesDiff;
    });
    
    // Sort teams by final ranking criteria
    const finalRanking = [...teams].sort((a, b) => {
        // First by total points
        if (results[b].totalPoints !== results[a].totalPoints) {
            return results[b].totalPoints - results[a].totalPoints;
        }
        // Then by total game differential
        return results[b].totalDiff - results[a].totalDiff;
    });
    
    // Update doubles ranking in summary table
    summaryRows = document.querySelectorAll('#summary-table tbody tr');
    doublesRanking.forEach((team, index) => {
        const rank = index + 1;
        const row = summaryRows[team - 1];
        row.querySelector('.doubles-rank').textContent = rank;
    });
    
    // Update final ranking in summary table
    finalRanking.forEach((team, index) => {
        const rank = index + 1;
        const row = summaryRows[team - 1];
        row.querySelector('.final-rank').textContent = rank;
    });
    
    // Update doubles ranking list
    const doublesRankingList = document.getElementById('doubles-ranking');
    doublesRankingList.innerHTML = '';
    doublesRanking.forEach(team => {
        const li = document.createElement('li');
        li.textContent = `Team ${team}`;
        doublesRankingList.appendChild(li);
    });
    
    // Update final ranking list
    const finalRankingList = document.getElementById('final-ranking');
    finalRankingList.innerHTML = '';
    finalRanking.forEach(team => {
        const li = document.createElement('li');
        li.textContent = `Team ${team}`;
        finalRankingList.appendChild(li);
    });
    
    // Return rankings for use in other functions
    return { doublesRanking, finalRanking };
}

// Function to update singles match schedule based on doubles rankings
function updateSinglesSchedule(doublesRanking) {
    // Get singles table rows
    const singlesRows = document.querySelectorAll('#singles-table tbody tr');
    
    // Make sure we have enough rows and rankings
    if (singlesRows.length < 5 || doublesRanking.length < 5) {
        return;
    }
    
    // Define the matchups based on doubles rankings
    // 1st vs 2nd, 3rd vs 4th, 4th vs 5th, 5th vs 1st, 2nd vs 3rd
    const matchups = [
        { row: 0, teamA: 0, teamB: 1 }, // 1st place vs 2nd place
        { row: 1, teamA: 2, teamB: 3 }, // 3rd place vs 4th place
        { row: 2, teamA: 1, teamB: 2 }, // 2nd place vs 3rd place
        { row: 3, teamA: 3, teamB: 4 }, // 4th place vs 5th place
        { row: 4, teamA: 4, teamB: 0 }  // 5th place vs 1st place
    ];
    
    // Update each singles match row with the appropriate teams
    matchups.forEach(matchup => {
        if (matchup.row < singlesRows.length) {
            const row = singlesRows[matchup.row];
            const teamASelect = row.querySelector('.team-a');
            const teamBSelect = row.querySelector('.team-b');
            
            // Set the team selections based on doubles rankings
            if (teamASelect && teamBSelect) {
                const teamA = doublesRanking[matchup.teamA];
                const teamB = doublesRanking[matchup.teamB];
                
                // Update the description cell to show the matchup
                const descriptionCell = document.createElement('td');
                descriptionCell.className = 'matchup-description';
                descriptionCell.textContent = `${getRankName(matchup.teamA)} vs ${getRankName(matchup.teamB)}`;
                
                // Check if description cell already exists, if not add it
                const existingDescription = row.querySelector('.matchup-description');
                if (existingDescription) {
                    existingDescription.textContent = descriptionCell.textContent;
                } else {
                    // Add after the court cell
                    const courtCell = row.querySelector('td:nth-child(2)');
                    if (courtCell) {
                        courtCell.insertAdjacentElement('afterend', descriptionCell);
                    }
                }
                
                // Set the selected teams
                teamASelect.value = teamA;
                teamBSelect.value = teamB;
            }
        }
    });
    
    // Save player names after updating the schedule to preserve any existing names
    savePlayerNames();
}

// Helper function to get rank name
function getRankName(index) {
    const ranks = ['1st place', '2nd place', '3rd place', '4th place', '5th place'];
    return ranks[index] || `${index + 1}th place`;
}

// Function to save player names to local storage
function savePlayerNames() {
    const singlesRows = document.querySelectorAll('#singles-table tbody tr');
    const playerData = [];
    
    singlesRows.forEach((row, index) => {
        // Get all player inputs in the row
        const playerInputs = row.querySelectorAll('.player-input');
        
        // Make sure we have exactly 2 player inputs (A and B)
        if (playerInputs.length === 2) {
            playerData.push({
                rowIndex: index,
                playerA: playerInputs[0].value,
                playerB: playerInputs[1].value,
                // Also save team selections to maintain context
                teamA: row.querySelector('.team-a')?.value || '',
                teamB: row.querySelector('.team-b')?.value || ''
            });
        }
    });
    
    // Save to local storage
    localStorage.setItem('tennisPlayerNames', JSON.stringify(playerData));
    console.log('Player names saved:', playerData);
}

// Function to load player names from local storage
function loadPlayerNames() {
    const savedData = localStorage.getItem('tennisPlayerNames');
    
    if (savedData) {
        try {
            const playerData = JSON.parse(savedData);
            console.log('Loading player data:', playerData);
            
            const singlesRows = document.querySelectorAll('#singles-table tbody tr');
            console.log(`Found ${singlesRows.length} singles rows to populate`);
            
            playerData.forEach(data => {
                if (data.rowIndex < singlesRows.length) {
                    const row = singlesRows[data.rowIndex];
                    const playerInputs = row.querySelectorAll('.player-input');
                    
                    // Make sure we have exactly 2 player inputs (A and B)
                    if (playerInputs.length === 2) {
                        // Set player A name
                        if (data.playerA) {
                            playerInputs[0].value = data.playerA;
                            console.log(`Set player A name in row ${data.rowIndex} to "${data.playerA}"`);
                        }
                        
                        // Set player B name
                        if (data.playerB) {
                            playerInputs[1].value = data.playerB;
                            console.log(`Set player B name in row ${data.rowIndex} to "${data.playerB}"`);
                        }
                        
                        // Optionally restore team selections if they were saved
                        if (data.teamA && row.querySelector('.team-a')) {
                            row.querySelector('.team-a').value = data.teamA;
                        }
                        
                        if (data.teamB && row.querySelector('.team-b')) {
                            row.querySelector('.team-b').value = data.teamB;
                        }
                    } else {
                        console.warn(`Expected 2 player inputs in row ${data.rowIndex}, found ${playerInputs.length}`);
                    }
                } else {
                    console.warn(`Row index ${data.rowIndex} is out of bounds (max: ${singlesRows.length - 1})`);
                }
            });
            
            // Set up event listeners for the loaded player inputs
            setupPlayerNameInputListeners();
        } catch (error) {
            console.error('Error loading player names from local storage:', error);
        }
    } else {
        console.log('No saved player names found in local storage');
    }
}

// Function to set up event listeners for player name inputs
function setupPlayerNameInputListeners() {
    const playerInputs = document.querySelectorAll('.player-input');
    playerInputs.forEach(input => {
        // Remove existing event listeners to avoid duplicates
        const newInput = input.cloneNode(true);
        input.parentNode.replaceChild(newInput, input);
        
        // Add new event listener
        newInput.addEventListener('input', savePlayerNames);
    });
    console.log(`Set up listeners for ${playerInputs.length} player name inputs`);
}

// Photo Gallery Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize photo gallery
    initPhotoGallery();
});

function initPhotoGallery() {
    // Get DOM elements
    const photoUpload = document.getElementById('photo-upload');
    const thumbnailsContainer = document.getElementById('thumbnails-container');
    const fullsizeContainer = document.getElementById('fullsize-photo-container');
    const photoDisplay = document.getElementById('photo-display');
    const prevButton = document.getElementById('prev-photo');
    const nextButton = document.getElementById('next-photo');
    const closeButton = document.getElementById('close-photo');
    
    // Photo storage array
    let photos = [];
    let currentPhotoIndex = 0;
    
    // Load photos from localStorage if available
    loadPhotosFromStorage();
    
    // Event listener for file upload
    photoUpload.addEventListener('change', handlePhotoUpload);
    
    // Event listeners for navigation
    prevButton.addEventListener('click', showPreviousPhoto);
    nextButton.addEventListener('click', showNextPhoto);
    closeButton.addEventListener('click', closeFullsizePhoto);
    
    // Close on ESC key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeFullsizePhoto();
        } else if (e.key === 'ArrowLeft') {
            showPreviousPhoto();
        } else if (e.key === 'ArrowRight') {
            showNextPhoto();
        }
    });
    
    // Handle photo upload
    function handlePhotoUpload(event) {
        const files = event.target.files;
        
        if (files && files.length > 0) {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                
                // Check if file is an image
                if (!file.type.match('image.*')) {
                    continue;
                }
                
                const reader = new FileReader();
                
                reader.onload = function(e) {
                    const photoData = e.target.result;
                    
                    // Add to photos array
                    photos.push(photoData);
                    
                    // Create thumbnail
                    createThumbnail(photoData, photos.length - 1);
                    
                    // Save to localStorage
                    savePhotosToStorage();
                };
                
                reader.readAsDataURL(file);
            }
        }
    }
    
    // Create thumbnail element
    function createThumbnail(photoData, index) {
        const thumbnail = document.createElement('img');
        thumbnail.src = photoData;
        thumbnail.className = 'thumbnail';
        thumbnail.dataset.index = index;
        
        thumbnail.addEventListener('click', function() {
            showFullsizePhoto(index);
        });
        
        thumbnailsContainer.appendChild(thumbnail);
    }
    
    // Show fullsize photo
    function showFullsizePhoto(index) {
        if (index < 0 || index >= photos.length) {
            return;
        }
        
        currentPhotoIndex = index;
        
        // Clear previous photo
        photoDisplay.innerHTML = '';
        
        // Create image element
        const img = document.createElement('img');
        img.src = photos[index];
        
        // Add to display
        photoDisplay.appendChild(img);
        
        // Show fullsize container
        fullsizeContainer.classList.add('active');
    }
    
    // Show previous photo
    function showPreviousPhoto() {
        if (photos.length === 0) return;
        
        let newIndex = currentPhotoIndex - 1;
        if (newIndex < 0) {
            newIndex = photos.length - 1;
        }
        
        showFullsizePhoto(newIndex);
    }
    
    // Show next photo
    function showNextPhoto() {
        if (photos.length === 0) return;
        
        let newIndex = currentPhotoIndex + 1;
        if (newIndex >= photos.length) {
            newIndex = 0;
        }
        
        showFullsizePhoto(newIndex);
    }
    
    // Close fullsize photo
    function closeFullsizePhoto() {
        fullsizeContainer.classList.remove('active');
    }
    
    // Save photos to localStorage
    function savePhotosToStorage() {
        try {
            localStorage.setItem('tennisPhotos', JSON.stringify(photos));
        } catch (e) {
            console.error('Error saving photos to localStorage:', e);
            // If localStorage is full, we might need to clear some space
            if (e.name === 'QuotaExceededError') {
                alert('Storage is full. Some photos may not be saved.');
            }
        }
    }
    
    // Load photos from localStorage
    function loadPhotosFromStorage() {
        try {
            const savedPhotos = localStorage.getItem('tennisPhotos');
            if (savedPhotos) {
                photos = JSON.parse(savedPhotos);
                
                // Create thumbnails for all saved photos
                photos.forEach((photoData, index) => {
                    createThumbnail(photoData, index);
                });
            }
        } catch (e) {
            console.error('Error loading photos from localStorage:', e);
        }
    }
}

// Made with Bob
