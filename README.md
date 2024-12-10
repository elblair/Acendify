# Acendify
A dynamic platform for discovering and tracking climbing routes across America. Users can create personal accounts, explore new climbs, log and monitor their progress, and connect with a community of climbers to share routes, reviews, and experiences.
## Developers
Brittany Lewis, Owen White, Adam Gebben, Eleanor Blair
## Technology Stack
- Version control: git/github
- Project tracking: github project board
- Database: postgreSQL ​
- Application server: nodeJS
- Testing tools: Mocha+Chai
- Deployment environment: Raspberry Pi
- Templating engine: Handlebars
## Prerequisites
- Windows/Mac/Linux
- Safari/Chrome/etc.
## Deploying the Development Environment
Once the code is pulled, navigate to the `ProjectSourceCode` directory. From there run: 

```sh
docker compose up
``` 

to deploy and perform the testing for the development environment.
## How to Run Tests
- Tests are run automatically when deploying the development environment

## Testing Output
Server is running on port 3000
web-1  |   Authentication Routes
web-1  |     POST /register
web-1  | User registered: testuser
web-1  |       ✓ should successfully register a new user (122ms)
web-1  |     GET /register
web-1  |       ✓ should serve register page
web-1  |     POST /login
web-1  | testuser
web-1  |       ✓ should handle login with correct credentials (73ms)
web-1  | testuser
web-1  |       ✓ should handle invalid login credentials (70ms)
web-1  | 
web-1  |   Protected Routes
web-1  |     ✓ should redirect /add_climb to login when not authenticated
web-1  |     ✓ should redirect /add_ascent to login when not authenticated
web-1  |     ✓ should redirect /user_settings to login when not authenticated
web-1  | 
web-1  | 
web-1  |   7 passing (295ms)
## Link to Deployed Application
https://acendify.ddns.net/home
