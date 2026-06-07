param(
  [string]$SourcePath = "assets/ui/core/sheet_ui_core_p0_001.png",
  [string]$OutputDirectory = "assets/ui/runtime"
)

$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Drawing

Add-Type -ReferencedAssemblies System.Drawing -TypeDefinition @"
using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Imaging;
using System.Runtime.InteropServices;

public static class P0UiSkinAlphaKeyer
{
  public static void Apply(Bitmap image)
  {
    int width = image.Width;
    int height = image.Height;
    var rect = new Rectangle(0, 0, width, height);
    BitmapData data = image.LockBits(rect, ImageLockMode.ReadWrite, PixelFormat.Format32bppArgb);
    try
    {
      int stride = data.Stride;
      int byteCount = stride * height;
      byte[] pixels = new byte[byteCount];
      Marshal.Copy(data.Scan0, pixels, 0, byteCount);
      bool[] visited = new bool[width * height];
      Queue<int> queue = new Queue<int>();

      for (int x = 0; x < width; x++)
      {
        AddSeed(pixels, stride, width, height, visited, queue, x, 0);
        AddSeed(pixels, stride, width, height, visited, queue, x, height - 1);
      }
      for (int y = 0; y < height; y++)
      {
        AddSeed(pixels, stride, width, height, visited, queue, 0, y);
        AddSeed(pixels, stride, width, height, visited, queue, width - 1, y);
      }

      while (queue.Count > 0)
      {
        int point = queue.Dequeue();
        int x = point % width;
        int y = point / width;
        pixels[(y * stride) + (x * 4) + 3] = 0;
        AddSeed(pixels, stride, width, height, visited, queue, x - 1, y);
        AddSeed(pixels, stride, width, height, visited, queue, x + 1, y);
        AddSeed(pixels, stride, width, height, visited, queue, x, y - 1);
        AddSeed(pixels, stride, width, height, visited, queue, x, y + 1);
      }

      Marshal.Copy(pixels, 0, data.Scan0, byteCount);
    }
    finally
    {
      image.UnlockBits(data);
    }
  }

  private static void AddSeed(byte[] pixels, int stride, int width, int height, bool[] visited, Queue<int> queue, int x, int y)
  {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    int index = (y * width) + x;
    if (visited[index]) return;
    visited[index] = true;
    int offset = (y * stride) + (x * 4);
    if (IsSheetBackgroundColor(pixels[offset + 2], pixels[offset + 1], pixels[offset]))
    {
      queue.Enqueue(index);
    }
  }

  private static bool IsSheetBackgroundColor(byte r, byte g, byte b)
  {
    int max = Math.Max(r, Math.Max(g, b));
    int min = Math.Min(r, Math.Min(g, b));
    return (max - min) <= 8 && max >= 38 && max <= 66;
  }
}
"@

$resolvedSource = Resolve-Path $SourcePath
$resolvedOutput = Join-Path (Resolve-Path ".") $OutputDirectory
New-Item -ItemType Directory -Force -Path $resolvedOutput | Out-Null

$slices = @(
  @{ Name = "ui_primary_button_ember"; X = 22; Y = 112; Width = 272; Height = 104 },
  @{ Name = "ui_secondary_button_iron"; X = 310; Y = 117; Width = 202; Height = 100 },
  @{ Name = "ui_icon_button_square"; X = 720; Y = 126; Width = 66; Height = 70 },
  @{ Name = "ui_modal_panel_iron"; X = 28; Y = 864; Width = 482; Height = 230 },
  @{ Name = "ui_reward_card_common"; X = 30; Y = 1282; Width = 210; Height = 178 },
  @{ Name = "ui_progress_bar_ember"; X = 37; Y = 1168; Width = 528; Height = 57 },
  @{ Name = "ui_module_slot_iron"; X = 43; Y = 558; Width = 208; Height = 280 }
)

$sourceImage = [System.Drawing.Bitmap]::FromFile($resolvedSource.Path)
try {
  foreach ($slice in $slices) {
    $targetPath = Join-Path $resolvedOutput "$($slice.Name).png"
    $targetImage = New-Object System.Drawing.Bitmap -ArgumentList $slice.Width, $slice.Height, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    try {
      $graphics = [System.Drawing.Graphics]::FromImage($targetImage)
      try {
        $sourceRect = New-Object System.Drawing.Rectangle -ArgumentList $slice.X, $slice.Y, $slice.Width, $slice.Height
        $graphics.DrawImage($sourceImage, 0, 0, $sourceRect, [System.Drawing.GraphicsUnit]::Pixel)
      } finally {
        $graphics.Dispose()
      }
      [P0UiSkinAlphaKeyer]::Apply($targetImage)
      $targetImage.Save($targetPath, [System.Drawing.Imaging.ImageFormat]::Png)
    } finally {
      $targetImage.Dispose()
    }
  }
} finally {
  $sourceImage.Dispose()
}

Get-ChildItem $resolvedOutput -Filter "ui_*.png" |
  Sort-Object Name |
  Select-Object Name, Length
