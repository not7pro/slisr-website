using System;
using System.Drawing;
using System.Drawing.Imaging;

public class ImageCropper {
    public static void CropWhite(string inputPath, string outputPath) {
        using (Bitmap bmp = new Bitmap(inputPath)) {
            int w = bmp.Width;
            int h = bmp.Height;
            int minX = w, minY = h, maxX = 0, maxY = 0;
            
            // Loop through pixels to find non-white and non-transparent pixels
            for (int y = 0; y < h; y++) {
                for (int x = 0; x < w; x++) {
                    Color c = bmp.GetPixel(x, y);
                    // Consider it whitespace if it's purely white or transparent
                    bool isWhiteOrTransparent = (c.A == 0) || (c.R > 240 && c.G > 240 && c.B > 240);
                    if (!isWhiteOrTransparent) {
                        if (x < minX) minX = x;
                        if (x > maxX) maxX = x;
                        if (y < minY) minY = y;
                        if (y > maxY) maxY = y;
                    }
                }
            }
            
            if (minX > maxX || minY > maxY) {
                // Image is completely white/transparent
                return;
            }
            
            // Add a small 10px padding
            minX = Math.Max(0, minX - 10);
            minY = Math.Max(0, minY - 10);
            maxX = Math.Min(w - 1, maxX + 10);
            maxY = Math.Min(h - 1, maxY + 10);
            
            Rectangle cropRect = new Rectangle(minX, minY, maxX - minX + 1, maxY - minY + 1);
            using (Bitmap target = new Bitmap(cropRect.Width, cropRect.Height)) {
                using (Graphics g = Graphics.FromImage(target)) {
                    g.DrawImage(bmp, new Rectangle(0, 0, target.Width, target.Height), cropRect, GraphicsUnit.Pixel);
                }
                
                // Save it
                target.Save(outputPath, ImageFormat.Png);
            }
        }
    }
}
