param(
  [string]$OutputRoot = "assets"
)

$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Drawing

Add-Type -ReferencedAssemblies System.Drawing -TypeDefinition @"
using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.IO;
using System.Runtime.InteropServices;

public sealed class P0VisualSliceSpec
{
  public string Name = "";
  public string SourcePath = "";
  public string OutputPath = "";
  public int X;
  public int Y;
  public int Width;
  public int Height;
  public int MaxWidth;
  public int MaxHeight;
  public int Padding;
}

public static class P0GameplayVisualSlicer
{
  public static void Generate(P0VisualSliceSpec spec)
  {
    using (Bitmap source = new Bitmap(spec.SourcePath))
    using (Bitmap cropped = new Bitmap(spec.Width, spec.Height, PixelFormat.Format32bppArgb))
    {
      using (Graphics graphics = Graphics.FromImage(cropped))
      {
        graphics.CompositingQuality = CompositingQuality.HighQuality;
        graphics.InterpolationMode = InterpolationMode.HighQualityBicubic;
        graphics.PixelOffsetMode = PixelOffsetMode.HighQuality;
        graphics.DrawImage(source, new Rectangle(0, 0, spec.Width, spec.Height), new Rectangle(spec.X, spec.Y, spec.Width, spec.Height), GraphicsUnit.Pixel);
      }

      ApplyAlphaKey(cropped);
      using (Bitmap trimmed = TrimTransparent(cropped, spec.Padding))
      using (Bitmap resized = ResizeToFit(trimmed, spec.MaxWidth, spec.MaxHeight))
      {
        Directory.CreateDirectory(Path.GetDirectoryName(spec.OutputPath) ?? ".");
        resized.Save(spec.OutputPath, ImageFormat.Png);
      }
    }
  }

  private static void ApplyAlphaKey(Bitmap image)
  {
    int width = image.Width;
    int height = image.Height;
    Rectangle rect = new Rectangle(0, 0, width, height);
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
    if (IsBackground(pixels[offset + 2], pixels[offset + 1], pixels[offset]))
    {
      queue.Enqueue(index);
    }
  }

  private static bool IsBackground(byte r, byte g, byte b)
  {
    int max = Math.Max(r, Math.Max(g, b));
    int min = Math.Min(r, Math.Min(g, b));
    bool lowSaturation = (max - min) <= 18;
    bool grayRange = max >= 28 && max <= 118;
    return lowSaturation && grayRange;
  }

  private static Bitmap TrimTransparent(Bitmap source, int padding)
  {
    int left = source.Width;
    int top = source.Height;
    int right = -1;
    int bottom = -1;

    for (int y = 0; y < source.Height; y++)
    {
      for (int x = 0; x < source.Width; x++)
      {
        if (source.GetPixel(x, y).A == 0) continue;
        left = Math.Min(left, x);
        top = Math.Min(top, y);
        right = Math.Max(right, x);
        bottom = Math.Max(bottom, y);
      }
    }

    if (right < left || bottom < top)
    {
      return new Bitmap(1, 1, PixelFormat.Format32bppArgb);
    }

    left = Math.Max(0, left - padding);
    top = Math.Max(0, top - padding);
    right = Math.Min(source.Width - 1, right + padding);
    bottom = Math.Min(source.Height - 1, bottom + padding);
    int width = right - left + 1;
    int height = bottom - top + 1;

    Bitmap output = new Bitmap(width, height, PixelFormat.Format32bppArgb);
    using (Graphics graphics = Graphics.FromImage(output))
    {
      graphics.DrawImage(source, new Rectangle(0, 0, width, height), new Rectangle(left, top, width, height), GraphicsUnit.Pixel);
    }
    return output;
  }

  private static Bitmap ResizeToFit(Bitmap source, int maxWidth, int maxHeight)
  {
    double scale = Math.Min((double)maxWidth / source.Width, (double)maxHeight / source.Height);
    scale = Math.Min(1.0, scale);
    int width = Math.Max(1, (int)Math.Round(source.Width * scale));
    int height = Math.Max(1, (int)Math.Round(source.Height * scale));

    Bitmap output = new Bitmap(width, height, PixelFormat.Format32bppArgb);
    using (Graphics graphics = Graphics.FromImage(output))
    {
      graphics.CompositingQuality = CompositingQuality.HighQuality;
      graphics.InterpolationMode = InterpolationMode.HighQualityBicubic;
      graphics.PixelOffsetMode = PixelOffsetMode.HighQuality;
      graphics.DrawImage(source, 0, 0, width, height);
    }
    return output;
  }
}
"@

$root = Resolve-Path "."

$slices = @(
  @{
    Name = "tex_train_head_rust_001"; Source = "assets/textures/trains/tex_train_head_rust_001.png";
    Output = "$OutputRoot/textures/trains/runtime/tex_train_head_rust_001.png"; X = 170; Y = 60; Width = 1110; Height = 860; MaxWidth = 384; MaxHeight = 304; Padding = 16
  },
  @{
    Name = "tex_train_carriage_combat_001"; Source = "assets/textures/trains/sheet_train_carriages_p0_001.png";
    Output = "$OutputRoot/textures/trains/runtime/tex_train_carriage_combat_001.png"; X = 12; Y = 386; Width = 342; Height = 330; MaxWidth = 512; MaxHeight = 256; Padding = 10
  },
  @{
    Name = "tex_train_carriage_supply_001"; Source = "assets/textures/trains/sheet_train_carriages_p0_001.png";
    Output = "$OutputRoot/textures/trains/runtime/tex_train_carriage_supply_001.png"; X = 18; Y = 730; Width = 326; Height = 258; MaxWidth = 512; MaxHeight = 256; Padding = 10
  },
  @{
    Name = "tex_enemy_raider_basic_001"; Source = "assets/textures/enemies/sheet_enemies_p0_001.png";
    Output = "$OutputRoot/textures/enemies/runtime/tex_enemy_raider_basic_001.png"; X = 300; Y = 480; Width = 240; Height = 300; MaxWidth = 256; MaxHeight = 256; Padding = 10
  },
  @{
    Name = "tex_enemy_husk_brute_001"; Source = "assets/textures/enemies/sheet_enemies_p0_001.png";
    Output = "$OutputRoot/textures/enemies/runtime/tex_enemy_husk_brute_001.png"; X = 0; Y = 432; Width = 280; Height = 370; MaxWidth = 256; MaxHeight = 256; Padding = 10
  },
  @{
    Name = "icon_lootbox_supply_common"; Source = "assets/icons/resources/sheet_lootboxes_resources_p0_001.png";
    Output = "$OutputRoot/icons/resources/runtime/icon_lootbox_supply_common.png"; X = 0; Y = 70; Width = 268; Height = 230; MaxWidth = 128; MaxHeight = 128; Padding = 8
  },
  @{
    Name = "icon_resource_coin_001"; Source = "assets/icons/resources/sheet_lootboxes_resources_p0_001.png";
    Output = "$OutputRoot/icons/resources/runtime/icon_resource_coin_001.png"; X = 640; Y = 958; Width = 260; Height = 226; MaxWidth = 128; MaxHeight = 128; Padding = 8
  },
  @{
    Name = "icon_resource_module_fragment_001"; Source = "assets/icons/resources/sheet_lootboxes_resources_p0_001.png";
    Output = "$OutputRoot/icons/resources/runtime/icon_resource_module_fragment_001.png"; X = 930; Y = 650; Width = 286; Height = 250; MaxWidth = 128; MaxHeight = 128; Padding = 8
  },
  @{
    Name = "icon_equipment_rifle_rusty_001"; Source = "assets/icons/equipment/sheet_equipment_icons_p0_001.png";
    Output = "$OutputRoot/icons/equipment/runtime/icon_equipment_rifle_rusty_001.png"; X = 0; Y = 0; Width = 310; Height = 232; MaxWidth = 128; MaxHeight = 128; Padding = 8
  },
  @{
    Name = "icon_equipment_engine_core_001"; Source = "assets/icons/equipment/sheet_equipment_icons_p0_001.png";
    Output = "$OutputRoot/icons/equipment/runtime/icon_equipment_engine_core_001.png"; X = 590; Y = 762; Width = 254; Height = 220; MaxWidth = 128; MaxHeight = 128; Padding = 8
  },
  @{
    Name = "icon_module_cannon_basic_001"; Source = "assets/icons/train_modules/sheet_train_module_icons_p0_001.png";
    Output = "$OutputRoot/icons/train_modules/runtime/icon_module_cannon_basic_001.png"; X = 18; Y = 58; Width = 260; Height = 220; MaxWidth = 128; MaxHeight = 128; Padding = 8
  }
)

foreach ($slice in $slices) {
  $spec = New-Object P0VisualSliceSpec
  $spec.Name = $slice.Name
  $spec.SourcePath = (Resolve-Path $slice.Source).Path
  $spec.OutputPath = Join-Path $root $slice.Output
  $spec.X = $slice.X
  $spec.Y = $slice.Y
  $spec.Width = $slice.Width
  $spec.Height = $slice.Height
  $spec.MaxWidth = $slice.MaxWidth
  $spec.MaxHeight = $slice.MaxHeight
  $spec.Padding = $slice.Padding
  [P0GameplayVisualSlicer]::Generate($spec)
}

$slices |
  ForEach-Object {
    $path = Join-Path $root $_.Output
    $image = [System.Drawing.Image]::FromFile($path)
    try {
      [PSCustomObject]@{
        Name = $_.Name
        Size = "$($image.Width)x$($image.Height)"
        Length = (Get-Item $path).Length
      }
    } finally {
      $image.Dispose()
    }
  } |
  Sort-Object Name
