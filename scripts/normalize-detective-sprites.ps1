param(
  [string]$Source = "public/sprites/detective-walk.png",
  [string]$Destination = "public/sprites/detective-walk-normalized.png"
)

Add-Type -AssemblyName System.Drawing

$sourcePath = (Resolve-Path -LiteralPath $Source).Path
$sourceBitmap = [System.Drawing.Bitmap]::FromFile($sourcePath)

try {
  if (($sourceBitmap.Width % 3) -ne 0 -or ($sourceBitmap.Height % 4) -ne 0) {
    throw "The source sheet must be divisible into 3 columns and 4 rows."
  }

  $sourceCellWidth = [int]($sourceBitmap.Width / 3)
  $sourceCellHeight = [int]($sourceBitmap.Height / 4)
  $outputCellWidth = 176
  $outputCellHeight = 340
  $anchorX = 88
  $groundY = 330

  $sourceRect = [System.Drawing.Rectangle]::new(0, 0, $sourceBitmap.Width, $sourceBitmap.Height)
  $bitmapData = $sourceBitmap.LockBits(
    $sourceRect,
    [System.Drawing.Imaging.ImageLockMode]::ReadOnly,
    [System.Drawing.Imaging.PixelFormat]::Format32bppArgb
  )

  try {
    $pixels = New-Object byte[] ($bitmapData.Stride * $bitmapData.Height)
    [System.Runtime.InteropServices.Marshal]::Copy(
      $bitmapData.Scan0,
      $pixels,
      0,
      $pixels.Length
    )
  }
  finally {
    $sourceBitmap.UnlockBits($bitmapData)
  }

  $output = [System.Drawing.Bitmap]::new(
    $outputCellWidth * 3,
    $outputCellHeight * 4,
    [System.Drawing.Imaging.PixelFormat]::Format32bppArgb
  )
  $graphics = [System.Drawing.Graphics]::FromImage($output)

  try {
    $graphics.Clear([System.Drawing.Color]::Transparent)
    $graphics.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceCopy
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::Half

    for ($row = 0; $row -lt 4; $row++) {
      for ($column = 0; $column -lt 3; $column++) {
        $minY = $sourceCellHeight
        $maxY = -1

        for ($y = 0; $y -lt $sourceCellHeight; $y++) {
          $globalY = $row * $sourceCellHeight + $y
          for ($x = 0; $x -lt $sourceCellWidth; $x++) {
            $globalX = $column * $sourceCellWidth + $x
            $alpha = $pixels[$globalY * $bitmapData.Stride + $globalX * 4 + 3]
            if ($alpha -gt 0) {
              if ($y -lt $minY) { $minY = $y }
              if ($y -gt $maxY) { $maxY = $y }
            }
          }
        }

        if ($maxY -lt 0) {
          throw "No opaque pixels found in frame row $row, column $column."
        }

        # Use the coat/torso envelope rather than the moving feet to avoid
        # horizontal jitter between the walk poses.
        $bandStart = [int]($minY + ($maxY - $minY) * 0.38)
        $bandEnd = [int]($minY + ($maxY - $minY) * 0.68)
        $rowCenters = [System.Collections.Generic.List[double]]::new()

        for ($y = $bandStart; $y -le $bandEnd; $y++) {
          $minimumX = $sourceCellWidth
          $maximumX = -1
          $globalY = $row * $sourceCellHeight + $y

          for ($x = 0; $x -lt $sourceCellWidth; $x++) {
            $globalX = $column * $sourceCellWidth + $x
            $alpha = $pixels[$globalY * $bitmapData.Stride + $globalX * 4 + 3]
            if ($alpha -gt 80) {
              if ($x -lt $minimumX) { $minimumX = $x }
              if ($x -gt $maximumX) { $maximumX = $x }
            }
          }

          if ($maximumX -ge 0) {
            $rowCenters.Add(($minimumX + $maximumX) / 2.0)
          }
        }

        $bodyCenterX = ($rowCenters | Measure-Object -Average).Average
        $destinationCell = [System.Drawing.Rectangle]::new(
          $column * $outputCellWidth,
          $row * $outputCellHeight,
          $outputCellWidth,
          $outputCellHeight
        )
        $graphics.SetClip($destinationCell)

        $drawX = [int][Math]::Round($destinationCell.X + $anchorX - $bodyCenterX)
        $drawY = $destinationCell.Y + $groundY - $maxY
        $frameSource = [System.Drawing.Rectangle]::new(
          $column * $sourceCellWidth,
          $row * $sourceCellHeight,
          $sourceCellWidth,
          $sourceCellHeight
        )

        $graphics.DrawImage(
          $sourceBitmap,
          $drawX,
          $drawY,
          $frameSource,
          [System.Drawing.GraphicsUnit]::Pixel
        )
        $graphics.ResetClip()
      }
    }

    $destinationDirectory = Split-Path -Parent $Destination
    if ($destinationDirectory -and -not (Test-Path -LiteralPath $destinationDirectory)) {
      New-Item -ItemType Directory -Path $destinationDirectory | Out-Null
    }

    $output.Save($Destination, [System.Drawing.Imaging.ImageFormat]::Png)
  }
  finally {
    $graphics.Dispose()
    $output.Dispose()
  }
}
finally {
  $sourceBitmap.Dispose()
}

Write-Output "Normalized detective sheet written to $Destination (528x1360)."
