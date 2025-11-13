# Maritime Ventures Easter Egg Game

## Overview
This application includes a hidden Easter egg game called "Maritime Ventures" - a freight transport management simulation game inspired by the classic computer game of the same name.

## How to Activate
To activate the Easter egg game, enter the famous **Konami Code** on the main page:

**↑ ↑ ↓ ↓ ← → ← → B A**

(Use arrow keys for directions, then press the 'B' key followed by the 'A' key)

## Game Features

### Main Game
- **Fleet Management**: Start with one cargo ship and earn money to buy more vessels
- **Ship Types**: 
  - Cargo Ship ($50,000) - 1000t capacity, 15 knots speed
  - Container Ship ($80,000) - 1500t capacity, 18 knots speed  
  - Tanker ($120,000) - 2000t capacity, 12 knots speed
- **Cargo Trading**: Accept cargo contracts between different ports worldwide
- **Reputation System**: Build your reputation through successful deliveries
- **Port Management**: Navigate between New York, London, Tokyo, Hamburg, and Singapore

### Mini-Games

#### Docking Game
- **Objective**: Safely pilot your ship into the designated docking area
- **Controls**: Arrow keys to control ship movement and speed
- **Challenge**: Avoid obstacles while docking at low speed
- **Scoring**: Bonus points based on time remaining and successful docking

#### Rescue Game  
- **Objective**: Navigate your rescue boat to save survivors at sea
- **Controls**: Arrow keys to move the rescue boat
- **Challenge**: Rescue all survivors within the time limit
- **Scoring**: Points for each survivor rescued, time bonus for completion

## Game Mechanics
- **Economy**: Earn money through successful cargo deliveries
- **Time Progression**: Game time advances automatically (1 day = 5 seconds)
- **Dynamic Cargo**: New cargo opportunities generate regularly
- **Ship Conditions**: Monitor and maintain your fleet
- **Port Fees**: Each port charges docking fees based on difficulty

## Tips for Success
1. Start with smaller, shorter cargo routes to build capital
2. Invest in faster ships to complete more jobs
3. Practice the mini-games to earn bonus money
4. Balance risk vs. reward when selecting cargo contracts
5. Build your reputation for access to better contracts

## Technical Implementation
- **Framework**: React with TypeScript
- **Styling**: Custom CSS with maritime-themed animations
- **State Management**: React hooks and local state
- **Game Loop**: setInterval-based timing for real-time updates
- **Input Handling**: Keyboard event listeners for ship controls

The game serves as a fun Easter egg while demonstrating advanced React component architecture, game state management, and interactive user interfaces.
