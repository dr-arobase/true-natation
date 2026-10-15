# ─── Démarrage du projet Natation ────────────────────────────────────────────
# Lance le backend (port 3001) et le frontend (port 5173) dans deux fenêtres

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$backend = Join-Path $root "backend"
$frontend = $root

# 1. Libérer le port 3001 si occupé
$conn = Get-NetTCPConnection -LocalPort 3001 -State Listen -ErrorAction SilentlyContinue
if ($conn) {
    $pid3001 = $conn.OwningProcess
    Stop-Process -Id $pid3001 -Force -ErrorAction SilentlyContinue
    Write-Host "✅ Port 3001 libéré (PID $pid3001)." -ForegroundColor Green
} else {
    Write-Host "✅ Port 3001 déjà libre." -ForegroundColor Green
}

# 2. Démarrer le backend dans un nouveau terminal
Write-Host "🚀 Démarrage du backend..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backend'; npm run dev"

Start-Sleep -Seconds 2

# 3. Démarrer le frontend dans un nouveau terminal
Write-Host "🚀 Démarrage du frontend..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontend'; npm run dev"

Write-Host ""
Write-Host "─────────────────────────────────────────" -ForegroundColor Gray
Write-Host "  Backend  → http://localhost:3001" -ForegroundColor Yellow
Write-Host "  Frontend → http://localhost:5173" -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────" -ForegroundColor Gray
