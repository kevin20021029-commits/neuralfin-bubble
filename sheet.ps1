param([Parameter(Mandatory=$true)][string]$OutDir)
Add-Type -AssemblyName System.Drawing
$names = @("banner_nbti","col_daguo","col_aiglasses","cover_shein","cover_sanhuan","cover_mecamand","cover_zuckerberg","cover_anker","podcast_hero","pod_qian","pod_mangge","pod_micang","post_meta","post_mps","avatar_trends","avatar_daguo","avatar_dgla","logo_n","bubble_sprite")

$jpegEnc = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
function Save-Jpeg($bmp, $path) {
  $ep = New-Object System.Drawing.Imaging.EncoderParameters(1)
  $ep.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]85)
  $bmp.Save($path, $jpegEnc, $ep); $ep.Dispose()
}

$cellW = 320; $labelH = 26; $cols = 4
$imgs = @(); $hs = @()
foreach ($n in $names) {
  $img = [System.Drawing.Image]::FromFile((Join-Path $OutDir "$n.jpg"))
  $imgs += ,@($n, $img)
  $hs += ([int](280 * $img.Height / $img.Width) + $labelH)
}
$rows = [Math]::Ceiling($imgs.Count / $cols)
$rowH = New-Object int[] $rows
for ($i = 0; $i -lt $imgs.Count; $i++) {
  $r = [int][Math]::Floor($i / $cols)
  if ($hs[$i] -gt $rowH[$r]) { $rowH[$r] = $hs[$i] }
}
$sheetH = ($rowH | Measure-Object -Sum).Sum + 10
$sheetW = $cellW * $cols + 10
$sheet = New-Object System.Drawing.Bitmap($sheetW, $sheetH)
$sg = [System.Drawing.Graphics]::FromImage($sheet)
$sg.Clear([System.Drawing.Color]::FromArgb(24,24,28))
$font = New-Object System.Drawing.Font("Consolas", 10)
for ($i = 0; $i -lt $imgs.Count; $i++) {
  $col = $i % $cols; $r = [int][Math]::Floor($i / $cols)
  $px = 10 + $col * $cellW
  $py = 10
  for ($rr = 0; $rr -lt $r; $rr++) { $py += $rowH[$rr] }
  $th = $hs[$i] - $labelH
  $sg.DrawImage($imgs[$i][1], $px, $py, 280, $th)
  $sg.DrawString($imgs[$i][0], $font, [System.Drawing.Brushes]::White, $px, $py + $th + 2)
  $imgs[$i][1].Dispose()
}
$sg.Dispose()
$sheetPath = Join-Path $OutDir "_contact_sheet.jpg"
Save-Jpeg $sheet $sheetPath
$sheet.Dispose()
Write-Output "SHEET $sheetPath"
