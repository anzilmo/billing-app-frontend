import { useEffect } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

export const Scanner = ({ onScanResult }) => {
  useEffect(() => {
    // We add a slight delay to ensure the DOM element is ready
    const scanner = new Html5QrcodeScanner(
      "reader",
      { 
        fps: 10, 
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      },
      false
    );

    scanner.render(
      (decodedText) => {
        onScanResult(decodedText);
      },
      (error) => {
        // Can be ignored due to normal scan noise
      }
    );

    return () => {
      scanner.clear().catch(error => {
        console.error("Failed to clear html5QrcodeScanner.", error);
      });
    };
  }, [onScanResult]);

  return <div id="reader"></div>;
};
