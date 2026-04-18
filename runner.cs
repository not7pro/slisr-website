using System;
using System.IO;

class Program {
    static void Main(string[] args) {
        string input = @"C:\Users\Arshad\school-logo.png";
        string output = @"C:\Users\Arshad\school-logo-cropped.png";
        try {
            ImageCropper.CropWhite(input, output);
            File.Delete(input);
            File.Move(output, input);
            Console.WriteLine("Cropped and replaced successfully.");
        } catch (Exception e) {
            Console.WriteLine("Error: " + e.Message);
        }
    }
}
