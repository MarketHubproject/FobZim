@echo off
echo Starting ZimBuzz App...
echo.
echo Opening browser to http://localhost:8081
echo.
start http://localhost:8081
npx expo start --web --port 8081
pause