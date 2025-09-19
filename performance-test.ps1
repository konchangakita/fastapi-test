# FastAPI パフォーマンステストスクリプト (PowerShell)

Write-Host "=== FastAPI パフォーマンステスト ===" -ForegroundColor Green
Write-Host ""

# 1. 基本的なレスポンス時間テスト
Write-Host "1. 基本的なレスポンス時間テスト" -ForegroundColor Yellow
Write-Host "GET /items のレスポンス時間を10回測定..."

$totalTime = 0
for ($i = 1; $i -le 10; $i++) {
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:7776/items" -Method Get
        $stopwatch.Stop()
        $responseTime = $stopwatch.Elapsed.TotalMilliseconds
        Write-Host "試行 $i : $($responseTime.ToString('F2'))ms"
        $totalTime += $responseTime
    }
    catch {
        Write-Host "試行 $i : エラー - $($_.Exception.Message)" -ForegroundColor Red
    }
}

$averageTime = $totalTime / 10
Write-Host "平均レスポンス時間: $($averageTime.ToString('F2'))ms"
Write-Host ""

# 2. 負荷テスト
Write-Host "2. 負荷テスト" -ForegroundColor Yellow
Write-Host "100リクエストを並行実行..."

$jobs = @()
$stopwatch = [System.Diagnostics.Stopwatch]::StartNew()

for ($i = 1; $i -le 100; $i++) {
    $job = Start-Job -ScriptBlock {
        param($url)
        try {
            $response = Invoke-RestMethod -Uri $url -Method Get
            return "OK"
        }
        catch {
            return "ERROR: $($_.Exception.Message)"
        }
    } -ArgumentList "http://localhost:7776/items"
    $jobs += $job
}

# 全てのジョブが完了するまで待機
$results = $jobs | Wait-Job | Receive-Job
$jobs | Remove-Job

$stopwatch.Stop()
$totalTimeMs = $stopwatch.Elapsed.TotalMilliseconds
$requestsPerSecond = 100 / ($totalTimeMs / 1000)

Write-Host "総実行時間: $($totalTimeMs.ToString('F2'))ms"
Write-Host "スループット: $($requestsPerSecond.ToString('F2')) req/sec"

$successCount = ($results | Where-Object { $_ -eq "OK" }).Count
$errorCount = $results.Count - $successCount
Write-Host "成功: $successCount, エラー: $errorCount"
Write-Host ""

# 3. メモリ使用量確認
Write-Host "3. メモリ使用量確認" -ForegroundColor Yellow
Write-Host "Docker コンテナのリソース使用状況:"

try {
    $dockerStats = docker stats --no-stream fastapi-backend --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}"
    Write-Host $dockerStats
}
catch {
    Write-Host "Docker stats の取得に失敗しました: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# 4. 並行POSTリクエストテスト
Write-Host "4. 並行POSTリクエストテスト" -ForegroundColor Yellow
Write-Host "10個の同時POSTリクエストを送信..."

$postJobs = @()
for ($i = 1; $i -le 10; $i++) {
    $job = Start-Job -ScriptBlock {
        param($url, $itemName)
        try {
            $body = @{
                name = $itemName
                description = "パフォーマンステスト用アイテム"
                price = 100
            } | ConvertTo-Json
            
            $response = Invoke-RestMethod -Uri $url -Method Post -Body $body -ContentType "application/json"
            return "OK"
        }
        catch {
            return "ERROR: $($_.Exception.Message)"
        }
    } -ArgumentList "http://localhost:7776/items", "テストアイテム$i"
    $postJobs += $job
}

$postResults = $postJobs | Wait-Job | Receive-Job
$postJobs | Remove-Job

$postSuccessCount = ($postResults | Where-Object { $_ -eq "OK" }).Count
$postErrorCount = $postResults.Count - $postSuccessCount
Write-Host "POST 成功: $postSuccessCount, エラー: $postErrorCount"
Write-Host ""

# 5. 結果確認
Write-Host "5. 最終結果確認" -ForegroundColor Yellow

try {
    $items = Invoke-RestMethod -Uri "http://localhost:7776/items" -Method Get
    Write-Host "アイテム数: $($items.Count)"
    
    $stats = Invoke-RestMethod -Uri "http://localhost:7776/stats" -Method Get
    Write-Host "統計情報:"
    Write-Host "  総アイテム数: $($stats.total_items)"
    Write-Host "  総価値: $($stats.total_value)"
    Write-Host "  平均価格: $($stats.average_price)"
}
catch {
    Write-Host "結果確認でエラーが発生しました: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "パフォーマンステスト完了!" -ForegroundColor Green
