import "@/styles/globals.css";
import { Provider } from "react-redux";
import { store } from "@/config/redux/store";
import dynamic from "next/dynamic";
import "react-toastify/dist/ReactToastify.css";

const ToastContainer = dynamic(
  () => import("react-toastify").then((mod) => mod.ToastContainer),
  { ssr: false }
);

export default function App({ Component, pageProps }) {
  return (
    <Provider store={store}>
      <>
        <Component {...pageProps} />
        <ToastContainer
          position="top-center"
          autoClose={2000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </>
    </Provider>
  );
}
