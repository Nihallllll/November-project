# Start all backend services and frontend
Write-Host "Starting ChainFlow services..." -ForegroundColor Green

# Check if Redis is running
Write-Host "`nChecking Redis container..." -ForegroundColor Cyan
$redisRunning = docker ps --filter "name=redis" --format "{{.Names}}" 2>$null
if (-not $redisRunning) {
    Write-Host "Redis container not running. Starting..." -ForegroundColor Yellow
    docker start redis 2>$null
    if (-not $?) {
        Write-Host "Creating and starting Redis container..." -ForegroundColor Yellow
        docker run -d -p 6379:6379 --name redis redis:alpine
    }
    Start-Sleep -Seconds 2
} else {
    Write-Host "✓ Redis is running" -ForegroundColor Green
}

# Start Backend Server
Write-Host "`nStarting Backend Server..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location 'D:\Web3.0 Projects\November-project\Backend'; bun run server.ts"

# Wait a moment
Start-Sleep -Seconds 2

# Start Worker
Write-Host "Starting Worker..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location 'D:\Web3.0 Projects\November-project\Backend'; bun run worker.ts"

# Wait a moment
Start-Sleep -Seconds 2

# Start Scheduler
Write-Host "Starting Scheduler..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location 'D:\Web3.0 Projects\November-project\Backend'; bun run scheduler.ts"

# Wait a moment
Start-Sleep -Seconds 2

# Start Frontend
Write-Host "Starting Frontend..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location 'D:\Web3.0 Projects\November-project\Frontend'; npm run dev"

Write-Host "`n✓ All services started!" -ForegroundColor Green
Write-Host "`nServices running:" -ForegroundColor Yellow
Write-Host "  - Backend Server: http://localhost:3000" -ForegroundColor White
Write-Host "  - Worker: Processing jobs" -ForegroundColor White
Write-Host "  - Scheduler: Running scheduled flows" -ForegroundColor White
Write-Host "  - Frontend: Check terminal for URL (usually http://localhost:5173)" -ForegroundColor White
Write-Host "`nPress any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
