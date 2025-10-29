# Tennis Match Tracker

A web-based application for tracking tennis matches, calculating scores, and determining rankings, inspired by the Excel-based tracking system.

## Features

- Track both doubles and singles tennis matches
- Enter match scores in a simple format (e.g., "6:0")
- Automatic calculation of:
  - Match winners
  - Team points (2 points for doubles win, 1 point for singles win)
  - Game differentials (games won minus games lost)
  - Team rankings based on points and differentials
- Mobile-friendly interface
- Tab-based navigation between doubles matches, singles matches, and summary

## How to Use

1. Open `index.html` in a web browser
2. Enter match information:
   - For doubles matches, use the "Doubles" tab
   - Singles matches will be automatically scheduled based on doubles rankings
3. For each match:
   - Select the teams playing
   - Enter the score in the format "A:B" (e.g., "6:0")
4. View the automatically calculated results in the "Summary" tab

## Singles Match Scheduling

Singles matches are automatically scheduled based on the doubles rankings:
- 1st place vs 2nd place
- 3rd place vs 4th place
- 2nd place vs 3rd place
- 4th place vs 5th place
- 5th place vs 1st place

This ensures that the singles match schedule follows the same pattern as in the Excel file.

## Team Information

The application includes a team information table at the bottom of the page showing the players in each team:

| Team   | Player 1 | Player 2 |
|--------|----------|----------|
| Team 1 | 정재원   | 김희준   |
| Team 2 | 함경훈   | 이성세   |
| Team 3 | 정창우   | 이진규   |
| Team 4 | 이일준   | 이대형   |
| Team 5 | 이강환   | 여정운   |

A team photo (IMG_6317.JPG) is also displayed below the team information table.

## Final Matches

After the doubles and singles matches are completed, the application supports final playoff matches:

1. 3rd place vs 4th place match
2. 1st place vs 2nd place (championship match)

These matches determine the final rankings. To use this feature:

1. Complete the doubles and singles matches
2. Go to the "Finals" tab
3. Click "Update Final Matches Based on Current Rankings"
4. Enter the scores for the final matches
5. The final rankings will be updated based on the results of these matches

The champion and runner-up will be highlighted in the final rankings list.

## Player Names in Singles Matches

The application allows you to enter player names for singles matches:

1. Each singles match has input fields for Player A and Player B names
2. Player names are automatically saved to the browser's local storage
3. When you refresh the page or return later, player names will be restored
4. This ensures you don't lose player information between sessions

## Sharing the Web Application

There are several ways to share this web application with others:

### Option 1: Google Drive (Recommended for non-technical users)

1. Create a ZIP file containing all the project files:
   - index.html
   - styles.css
   - script.js
   - test.html
   - README.md
   - IMG_6317.JPG (team photo)

2. Upload the ZIP file to Google Drive

3. Share the ZIP file with others. They can:
   - Download the ZIP file
   - Extract all files to a folder on their computer
   - Open index.html in a web browser

### Option 2: GitHub Pages (For developers)

1. Create a GitHub repository
2. Upload all project files to the repository
3. Enable GitHub Pages in the repository settings
4. Share the GitHub Pages URL with others

### Option 3: Web Hosting Service

1. Sign up for a web hosting service (e.g., Netlify, Vercel, or any traditional web host)
2. Upload all project files to the hosting service
3. Share the provided URL with others

### Important Notes

- Make sure to include the team photo (IMG_6317.JPG) when sharing
- All files must be kept together in the same directory
- The application runs entirely in the browser and doesn't require a server
- Data is not saved between sessions - users will need to re-enter match data each time they open the application

## Match Score Format

Enter scores in the format "A:B" where:
- A = Games won by Team A
- B = Games won by Team B

Example: "6:0" means Team A won 6 games and Team B won 0 games.

## Calculation Logic

The application uses the following logic for calculations:

### Points
- Doubles: 2 points for a win, 1 point each for a tie
- Singles: 1 point for a win, 0.5 points each for a tie

### Rankings
Rankings are determined by:
1. Total points (highest to lowest)
2. Game differential (games won minus games lost)
3. Direct match results (in case of ties)

## Testing

A test suite is included to verify the application's functionality:
1. Open `test.html` in a web browser
2. Click the test buttons to run individual tests or "Run All Tests"
3. View the test results to ensure all calculations are working correctly

## Files

- `index.html` - Main application HTML
- `styles.css` - CSS styles for the application
- `script.js` - JavaScript for calculations and interactivity
- `test.html` - Test suite for verifying functionality
- `README.md` - This documentation file

## Mobile Optimization

The application is designed to work well on mobile devices and tablets:
- Responsive layout adjusts to screen size
- Touch-friendly interface elements
- Simplified display on smaller screens