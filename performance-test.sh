#!/bin/bash
# FastAPIパフォーマンステストスクリプト

echo "=== FastAPI パフォーマンステスト ==="
echo ""

# 1. 基本的なレスポンス時間テスト
echo "1. 基本的なレスポンス時間テスト"
echo "GET /items のレスポンス時間を10回測定..."

total_time=0
for i in {1..10}; do
  response_time=$(curl -X GET http://localhost:7776/items -o /dev/null -s -w "%{time_total}")
  echo "試行 $i: ${response_time}秒"
  total_time=$(echo "$total_time + $response_time" | bc)
done

average_time=$(echo "scale=4; $total_time / 10" | bc)
echo "平均レスポンス時間: ${average_time}秒"
echo ""

# 2. 負荷テスト（Apache Bench）
echo "2. 負荷テスト"
echo "100リクエストを同時に10回実行..."

if command -v ab &> /dev/null; then
  ab -n 100 -c 10 http://localhost:7776/items
else
  echo "Apache Bench (ab) がインストールされていません"
  echo "Ubuntu/Debian: sudo apt-get install apache2-utils"
  echo "macOS: brew install httpd"
  echo "Windows: Apache HTTP Server をインストール"
fi

echo ""

# 3. メモリ使用量確認
echo "3. メモリ使用量確認"
echo "Docker コンテナのリソース使用状況:"
docker stats --no-stream fastapi-backend

echo ""

# 4. 並行リクエストテスト
echo "4. 並行リクエストテスト"
echo "10個の同時リクエストを送信..."

# バックグラウンドで複数のリクエストを同時実行
for i in {1..10}; do
  curl -X POST http://localhost:7776/items \
    -H "Content-Type: application/json" \
    -d "{\"name\":\"テストアイテム$i\",\"price\":100}" \
    -o /dev/null -s &
done

# 全てのバックグラウンドプロセスが完了するまで待機
wait

echo "並行リクエスト完了"
echo ""

# 5. 結果確認
echo "5. 最終結果確認"
echo "アイテム数:"
curl -X GET http://localhost:7776/items -s | jq length

echo "統計情報:"
curl -X GET http://localhost:7776/stats -s | jq
