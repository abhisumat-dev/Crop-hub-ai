$BASE = 'http://localhost:3000'
$p = 0; $f = 0

function T {
    param($name, $url, $method='GET', $body=$null, $expect, $contains='')
    $sc = 0; $content = ''
    try {
        $s = @{ Uri=$url; Method=$method; Headers=@{'Content-Type'='application/json'}; UseBasicParsing=$true; ErrorAction='Stop' }
        if ($body) { $s['Body'] = ($body | ConvertTo-Json -Depth 5) }
        $r = Invoke-WebRequest @s
        $sc = $r.StatusCode; $content = $r.Content
    } catch {
        try { $sc = [int]$_.Exception.Response.StatusCode } catch {}
        try { $content = $_.ErrorDetails.Message } catch {}
    }
    $ok = $sc -eq $expect
    if ($ok -and $contains -ne '' -and $content -notmatch [regex]::Escape($contains)) { $ok = $false }
    if ($ok) { $script:p++; Write-Host "  [PASS] $name" -ForegroundColor Green }
    else {
        $script:f++
        Write-Host "  [FAIL] $name -- HTTP $sc (expected $expect)" -ForegroundColor Red
        $preview = if ($content.Length -gt 160) { $content.Substring(0,160) } else { $content }
        Write-Host "         $preview" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "=== TARGETED RETEST: Fixed Endpoints ===" -ForegroundColor Cyan

Write-Host ""
Write-Host "-- Weather Security Fixes --" -ForegroundColor Magenta
T "Weather: XSS script tag rejected 400" "$BASE/api/weather" POST @{location='<script>alert(1)</script>'} 400
T "Weather: HTML tag rejected 400" "$BASE/api/weather" POST @{location='<img src=x onerror=alert(1)>'} 400
T "Weather: SQL DROP injection rejected 400" "$BASE/api/weather" POST @{location='x; DROP TABLE crops_master'} 400
T "Weather: Number input rejected 400" "$BASE/api/weather" POST @{location=12345} 400
T "Weather: Valid Latur still works 200" "$BASE/api/weather" POST @{location='Latur, Maharashtra'} 200

Write-Host ""
Write-Host "-- Admin Login Fixes --" -ForegroundColor Magenta
T "Login: Empty PIN now 401" "$BASE/api/admin/login" POST @{pin=''} 401
T "Login: Numeric 1234 as JSON number now 200" "$BASE/api/admin/login" POST @{pin=1234} 200
T "Login: Correct PIN string 1234 returns 200" "$BASE/api/admin/login" POST @{pin='1234'} 200
T "Login: Wrong PIN 9999 returns 401" "$BASE/api/admin/login" POST @{pin='9999'} 401
T "Login: Very long PIN 5000 chars returns 401" "$BASE/api/admin/login" POST @{pin=('9' * 5000)} 401

Write-Host ""
Write-Host "-- Recommend Validation (fresh window) --" -ForegroundColor Magenta
T "Recommend: pH 15.0 too high returns 400" "$BASE/api/recommend" POST @{location='Latur';soil_type='Black Cotton Soil';soil_ph=15.0;nitrogen='Medium';phosphorus='Low';potassium='Medium';habit_crop=''} 400
T "Recommend: Negative pH returns 400" "$BASE/api/recommend" POST @{location='Latur';soil_type='Black Cotton Soil';soil_ph=-3;nitrogen='Medium';phosphorus='Low';potassium='Medium';habit_crop=''} 400
T "Recommend: Invalid nitrogen VeryHigh returns 400" "$BASE/api/recommend" POST @{location='Latur';soil_type='Black Cotton Soil';soil_ph=6.5;nitrogen='VeryHigh';phosphorus='Low';potassium='Medium';habit_crop=''} 400
T "Recommend: SQL injection in habit_crop safe 200" "$BASE/api/recommend" POST @{location='Latur, Maharashtra';soil_type='Black Cotton Soil';soil_ph=6.5;nitrogen='Medium';phosphorus='Low';potassium='Medium';habit_crop='DROPTABLE'} 200

Write-Host ""
Write-Host "=== RESULTS ===" -ForegroundColor Cyan
Write-Host "  Pass: $p   Fail: $f" -ForegroundColor $(if ($f -gt 0) {'Red'} else {'Green'})
