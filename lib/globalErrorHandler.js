import { Alert } from "react-native";

/**
 * Global error handler function.
 * 
 * @param {Error} error - The error object that was thrown.
 * @param {boolean} isFatal - Indicates if the error is fatal.
 * @param {string} [stacktrace] - The stack trace of the error.
 * @param {Function} [resetErrorStates] - Callback to reset error states in the app.
 * @param {Function} [logger=console.error] - Function for logging errors.
 */
export const globalErrorHandler = (
  error,
  isFatal,
  stacktrace = "",
  resetErrorStates = () => {},
  logger = console.error
) => {
  if (!error) return;

  logger("🔴 Global Error Handler:", {
    message: error.message,
    isFatal,
    stacktrace,
  });

  if (isFatal) {
    Alert.alert(
      "Critical Error",
      "A fatal error occurred. The app needs to restart.",
      [{ text: "OK", onPress: () => console.log("App will restart.") }]
    );
  }

  resetErrorStates({ error, stacktrace });
};

/**
 * Global native error handler function.
 * 
 * @param {string} errorString - String representation of a native error.
 * @param {Function} [logger=console.error] - Function for logging errors.
 */
export const globalNativeErrorHandler = (errorString, logger = console.error) => {
  logger("🔴 Global Native Error Handler:", errorString);
};
