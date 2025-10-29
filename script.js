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
    
    // Load player names from local storage
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

// Made with Bob
