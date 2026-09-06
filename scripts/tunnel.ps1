while ($true) {
    Write-Host "[Tunnel] Starting SSH tunnel to localhost.run..."
    ssh -o StrictHostKeyChecking=no -o ServerAliveInterval=10 -o ServerAliveCountMax=3 -R 80:127.0.0.1:8000 nokey@localhost.run
    Write-Host "[Tunnel] Disconnected. Reconnecting in 3s..."
    Start-Sleep -Seconds 3
}
