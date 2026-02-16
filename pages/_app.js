import { Toaster } from "react-hot-toast";
import "react-hot-toast";

export default function App({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />

      <Toaster
        position="bottom-center"
        gutter={8}
        toastOptions={{
          duration: 4000,
          style: {
            background: "linear-gradient(135deg, #141e30, #243b55)",
            color: "#fff",
            borderRadius: "12px",
            padding: "12px",
            fontSize: "14px",
            textAlign: "center",
            minWidth: "250px"
          },
          success: {
            iconTheme: {
              primary: "#00ffae",
              secondary: "#000"
            }
          },
          error: {
            iconTheme: {
              primary: "#ff4b4b",
              secondary: "#000"
            }
          }
        }}
      />
    </>
  );
}