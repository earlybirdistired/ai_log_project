# AI 보안 로그 분석기 Docker 실행 스크립트
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " 🐳 AI 보안 로그 분석기 Docker 컨테이너 시작" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# 1. Docker Compose 빌드 및 백그라운드 실행
docker compose up --build -d

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ 컨테이너가 성공적으로 실행되었습니다!" -ForegroundColor Green
    Write-Host "👉 접속 URL: http://localhost:3000" -ForegroundColor Yellow
    Write-Host "👉 로그 확인: docker compose logs -f" -ForegroundColor Gray
    Write-Host "👉 종료 명령: docker compose down" -ForegroundColor Gray
} else {
    Write-Host ""
    Write-Host "❌ Docker 실행에 실패했습니다." -ForegroundColor Red
    Write-Host "💡 Docker Desktop 앱이 켜져 있는지 확인 후 다시 실행해주세요." -ForegroundColor Yellow
}
