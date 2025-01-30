/**
 * Checks whether the access token or retrieved session is expired.
 * @param {string} expiresAt - string time in seconds since Unix Epoch
 * @returns {boolean} - Returns true if the expiresAt is expired, false otherwise.
 */

const isExpired = (expiresAt) => {
    if (!expiresAt) {
      return true;
    }
  
    const currentTime = Date.now() / 1000; // Current time in seconds
  
    // Check if the token is expired
    if (expiresAt < currentTime) {
      return true;
    }
  
    return false;
  };
  
  export default isExpired;
  