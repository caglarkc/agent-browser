import Foundation
import Vision
import ImageIO

// Persistent, local OCR process. Input is one JSON line per screenshot path.
// It never reads web HTML, DOM, JavaScript or credentials.
while let line = readLine() {
    do {
        guard let data = line.data(using: .utf8),
              let input = try JSONSerialization.jsonObject(with: data) as? [String: Any],
              let path = input["path"] as? String else { throw NSError(domain: "OCR", code: 1) }
        let request = VNRecognizeTextRequest()
        request.recognitionLevel = .accurate
        request.recognitionLanguages = ["en-US"]
        request.usesLanguageCorrection = false
        let start = DispatchTime.now().uptimeNanoseconds
        let handler = VNImageRequestHandler(url: URL(fileURLWithPath: path), options: [:])
        try handler.perform([request])
        let observations = (request.results ?? []).compactMap { item -> [String: Any]? in
            guard let candidate = item.topCandidates(1).first else { return nil }
            let b = item.boundingBox
            return ["text": candidate.string, "confidence": candidate.confidence,
                    "x": b.origin.x, "y": 1-b.origin.y-b.size.height,
                    "width": b.size.width, "height": b.size.height]
        }
        let elapsed = Double(DispatchTime.now().uptimeNanoseconds-start)/1_000_000
        let result: [String: Any] = ["items": observations, "recognitionMs": elapsed]
        let output = try JSONSerialization.data(withJSONObject: result, options: [.sortedKeys])
        print(String(data: output, encoding: .utf8)!)
        fflush(stdout)
    } catch {
        print("{\"error\":\"Local OCR failed\"}")
        fflush(stdout)
    }
}
