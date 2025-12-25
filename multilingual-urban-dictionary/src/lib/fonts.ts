import localFont from "next/font/local";

export const maragsaDisplay = localFont({
  src: [
    {
      path: "../../maragsa/Maragsa-Display.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../maragsa/Maragsa-Display.woff",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-maragsa-display",
  display: "swap",
  preload: true,
});
