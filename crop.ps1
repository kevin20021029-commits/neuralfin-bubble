param([Parameter(Mandatory=$true)][string]$OutDir)
# NeuralFin asset cropper v3 (ASCII-only to avoid GBK/UTF8 mojibake in PS5.1)
# Verified mapping: 08ee=jingxuan 24eb=guanzhu 450f=boke f7ced=profile 8f31(png 1320x2868)=faxian
# Coords in original pixels; jpgs are 1280x2781, png is 1320x2868
Add-Type -AssemblyName System.Drawing
$srcDir = "C:\Users\kevin\AppData\Local\Temp\aionui\6c5311c5"
$JX  = Join-Path $srcDir "08ee6eba68e0b04ee8f71681de936b45.jpg"  # jingxuan
$GZ  = Join-Path $srcDir "24eb3d8257dba173a8b54f979fb33be9.jpg"  # guanzhu
$PK  = Join-Path $srcDir "450f0db73697c5fa0a32c4b479001b39.jpg"  # boke
$PF  = Join-Path $srcDir "f7ced0a61d590198e1a43a533442d487.jpg"  # profile
$FX  = Join-Path $srcDir "8f31e41fd9d4c0724e6167b33b4bb0d8.png"  # faxian

$crops = @(
  @("banner_nbti",    $JX,   26,  368, 1228, 385),
  @("col_daguo",      $JX,   26,  962, 1228, 500),
  @("avatar_daguo",   $JX,   68, 1620,   88,  86),
  @("col_aiglasses",  $JX,   26, 1757, 1228, 515),
  @("cover_anker",    $GZ,   24,  362,  600, 795),
  @("bubble_sprite",  $GZ, 1084, 2136,   94,  98),
  @("podcast_hero",   $PK,   54,  384, 1172, 695),
  @("pod_qian",       $PK,   99, 1266,  219, 224),
  @("pod_mangge",     $PK,   99, 1641,  219, 224),
  @("pod_micang",     $PK,   99, 2018,  219, 224),
  @("avatar_trends",  $PF,   55,  416,  261, 262),
  @("post_meta",      $PF,   24, 1564,  603, 742),
  @("post_mps",       $PF,  653, 1564,  603, 742),
  @("cover_shein",    $FX,   26,  500,  615, 830),
  @("cover_sanhuan",  $FX,  672,  500,  618, 830),
  @("cover_mecamand", $FX,   26, 1654,  615, 833),
  @("cover_zuckerberg",$FX, 672, 1654,  618, 470),
  @("avatar_dgla",    $FX,  696, 2293,   52,  52),
  @("logo_n",         $FX,   50,  216,  108, 107)
)

$jpegEnc = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
function Save-Jpeg($bmp, $path) {
  $ep = New-Object System.Drawing.Imaging.EncoderParameters(1)
  $ep.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]85)
  $bmp.Save($path, $jpegEnc, $ep); $ep.Dispose()
}

foreach ($c in $crops) {
  $name=$c[0]; $src=$c[1]; $x=[int]$c[2]; $y=[int]$c[3]; $w=[int]$c[4]; $h=[int]$c[5]
  $img=[System.Drawing.Image]::FromFile($src)
  if ($x+$w -gt $img.Width)  { $w=$img.Width-$x }
  if ($y+$h -gt $img.Height) { $h=$img.Height-$y }
  $bmp=New-Object System.Drawing.Bitmap($w,$h)
  $g=[System.Drawing.Graphics]::FromImage($bmp)
  $g.DrawImage($img,(New-Object System.Drawing.Rectangle(0,0,$w,$h)),(New-Object System.Drawing.Rectangle($x,$y,$w,$h)),[System.Drawing.GraphicsUnit]::Pixel)
  $g.Dispose()
  Save-Jpeg $bmp (Join-Path $OutDir "$name.jpg")
  $img.Dispose(); $bmp.Dispose()
  Write-Output "OK $name ${w}x${h}"
}
Write-Output "DONE"
