import CoreGraphics
import CoreText
import Foundation
import ImageIO
import UniformTypeIdentifiers

func color(_ red: CGFloat, _ green: CGFloat, _ blue: CGFloat, _ alpha: CGFloat = 1) -> CGColor {
    CGColor(colorSpace: CGColorSpaceCreateDeviceRGB(), components: [red, green, blue, alpha])!
}

func roundedRect(_ rect: CGRect, radius: CGFloat) -> CGPath {
    CGPath(roundedRect: rect, cornerWidth: radius, cornerHeight: radius, transform: nil)
}

func drawText(_ string: String, at point: CGPoint, size: CGFloat, color textColor: CGColor, bold: Bool, in context: CGContext) {
    let fontName = bold ? "HelveticaNeue-Bold" : "HelveticaNeue"
    let attributes: [NSAttributedString.Key: Any] = [
        NSAttributedString.Key(rawValue: kCTFontAttributeName as String): CTFontCreateWithName(fontName as CFString, size, nil),
        NSAttributedString.Key(rawValue: kCTForegroundColorAttributeName as String): textColor,
    ]
    let line = CTLineCreateWithAttributedString(NSAttributedString(string: string, attributes: attributes))
    context.textPosition = point
    CTLineDraw(line, context)
}

guard CommandLine.arguments.count == 3,
      let source = CGImageSourceCreateWithURL(URL(fileURLWithPath: CommandLine.arguments[1]) as CFURL, nil),
      let icon = CGImageSourceCreateImageAtIndex(source, 0, nil),
      let context = CGContext(
        data: nil,
        width: 1024,
        height: 500,
        bitsPerComponent: 8,
        bytesPerRow: 0,
        space: CGColorSpaceCreateDeviceRGB(),
        bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue
      ) else {
    fputs("Usage: swift render_feature.swift ICON_PNG OUTPUT_PNG\n", stderr)
    exit(1)
}

let background = [color(0.98, 0.99, 1), color(0.91, 0.96, 1)] as CFArray
let backgroundGradient = CGGradient(colorsSpace: CGColorSpaceCreateDeviceRGB(), colors: background, locations: [0, 1])!
context.drawLinearGradient(backgroundGradient, start: CGPoint(x: 0, y: 500), end: CGPoint(x: 1024, y: 0), options: [])

// Oversized arcs echo the blue and pink shapes in the shipped app icon.
context.setLineWidth(54)
context.setStrokeColor(color(0.42, 0.77, 1, 0.23))
context.addArc(center: CGPoint(x: 833, y: 190), radius: 335, startAngle: -.pi * 0.22, endAngle: .pi * 1.26, clockwise: false)
context.strokePath()
context.setLineWidth(22)
context.setStrokeColor(color(0.12, 0.66, 0.98, 0.25))
context.addArc(center: CGPoint(x: 865, y: 170), radius: 269, startAngle: .pi * 0.03, endAngle: .pi * 1.12, clockwise: false)
context.strokePath()
context.setFillColor(color(0.95, 0.22, 0.80, 0.75))
context.fillEllipse(in: CGRect(x: 951, y: 407, width: 23, height: 23))
context.setFillColor(color(0.12, 0.67, 0.98, 0.70))
context.fillEllipse(in: CGRect(x: 580, y: 50, width: 13, height: 13))

let navy = color(0.06, 0.13, 0.24)
let blue = color(0.09, 0.57, 0.91)
drawText("SIPP STORE", at: CGPoint(x: 64, y: 404), size: 28, color: blue, bold: true, in: context)
drawText("Run your store,", at: CGPoint(x: 64, y: 290), size: 54, color: navy, bold: true, in: context)
drawText("from anywhere.", at: CGPoint(x: 64, y: 220), size: 54, color: navy, bold: true, in: context)
drawText("Orders  •  Hours  •  Earnings", at: CGPoint(x: 67, y: 130), size: 25, color: color(0.26, 0.36, 0.48), bold: false, in: context)

let card = CGRect(x: 652, y: 75, width: 315, height: 350)
context.saveGState()
context.setShadow(offset: CGSize(width: 0, height: -14), blur: 28, color: color(0.12, 0.35, 0.60, 0.20))
context.setFillColor(color(1, 1, 1))
context.addPath(roundedRect(card, radius: 45))
context.fillPath()
context.restoreGState()
context.saveGState()
context.addPath(roundedRect(card.insetBy(dx: 12, dy: 12), radius: 36))
context.clip()
context.interpolationQuality = .high
context.draw(icon, in: CGRect(x: 665, y: 89, width: 289, height: 289))
context.restoreGState()

guard let output = context.makeImage(),
      let destination = CGImageDestinationCreateWithURL(URL(fileURLWithPath: CommandLine.arguments[2]) as CFURL, UTType.png.identifier as CFString, 1, nil) else {
    fatalError("Could not prepare feature graphic output")
}
CGImageDestinationAddImage(destination, output, nil)
guard CGImageDestinationFinalize(destination) else { fatalError("Could not write feature graphic") }
