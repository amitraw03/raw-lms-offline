import { BrowserMultiFormatReader } from "@zxing/browser";
import { useEffect, useRef } from "react";
import { Box, Typography } from "@mui/material";

function QRScanner({ onScan }) {
  const videoRef = useRef(null);
  const readerRef = useRef(null);
  const scannedRef = useRef(false);

  useEffect(() => {
    const startScanner = async () => {
      try {
        const reader = new BrowserMultiFormatReader();
        readerRef.current = reader;

        console.log("Listing camera devices...");
        const devices = await BrowserMultiFormatReader.listVideoInputDevices();
        console.log("Devices:", devices);

        if (!devices.length) {
          throw new Error("No camera devices found");
        }

        // Prefer back camera if available
        const backCamera =
          devices.find(d => d.label.toLowerCase().includes("back")) ||
          devices[devices.length - 1];

        console.log("Using camera:", backCamera);

        await reader.decodeFromVideoDevice(
          backCamera.deviceId,
          videoRef.current,
          (result, err) => {
            if (result && !scannedRef.current) {
              scannedRef.current = true;

              const text = String(result.getText()).trim();
              console.log("QR scanned:", text);

              // Stop camera BEFORE state updates
              reader.reset();

              setTimeout(() => {
                onScan(text);
              }, 100);
            }
          }
        );
      } catch (e) {
        console.error("QR Scanner error:", e);
      }
    };

    startScanner();

    return () => {
      scannedRef.current = true;
      readerRef.current?.reset();
    };
  }, [onScan]);

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="body2" sx={{ mb: 1 }}>
        Align the QR code inside the frame
      </Typography>

      <video
        ref={videoRef}
        muted
        playsInline
        autoPlay
        style={{
          width: "100%",
          maxWidth: 360,
          height: 240,
          backgroundColor: "#000",
          borderRadius: 8,
          objectFit: "cover"
        }}
      />
    </Box>
  );
}

export default QRScanner;
