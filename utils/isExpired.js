/**
 * Checks whether the access token or retrieved session is expired.
 * @param {string} expiresAt - string time in seconds since Unix Epoch
 * @returns {boolean} - Returns true if the expiresAt is expired, false otherwise.
 */

const isExpired = (expiresAt) => {
  if (!expiresAt || expiresAt === null) {
    return true;
  }

  const currentTime = Date.now() / 1000; // Current time in seconds

  if (typeof expiresAt === 'string') {
    expiresAt = Date.parse(expiresAt) / 1000; // Convert to seconds
  } else if (typeof expiresAt === 'number') {
    expiresAt = expiresAt; // Already in seconds
  } else {
    return true; // Invalid format
  }
  // Compare the expiry time with the current time
  if (expiresAt < currentTime) {
    return true;
  }

  return false;
};



/**
   * The function ensureSessionNotExpired checks if a session is still active.
   * @param {object} sessionData - Supabase session object
   * @example {object} - sessionData{
    "session": {
      "access_token": "your_access_token",
      "expires_at": 1234567890, //time in seconds since Unix Epoch
      "user": {
        "id": "user_id",
        "email": "user_email",
        "created_at": "timestamp",
        "updated_at": "timestamp",
        // other user fields
      }
    }
  }
    @returns {boolean} - true if session is fresh; false by default 
   */

const ensureSessionNotExpired = (sessionData) => {
  if (!sessionData || sessionData === null) return false;

  const findExpiryDate = (obj) => {
    if (typeof obj !== "object" || obj === null) return null;

    const keys = [
      "expires_at",
      "expiresAt",
      "expiry",
      "expiry_date",
      "expiryDate",
    ];
    for (const key of keys) {
      if (obj.hasOwnProperty(key)) {
        return obj[key];
      }
    }

    for (const key in obj) {
      if (typeof obj[key] === "object") {
        const result = findExpiryDate(obj[key]);
        if (result !== null) return result;
      }
    }

    return null;
  };

  const expiry = findExpiryDate(sessionData);
  return !expiry || expiry === null ? !isExpired(expiry) : false;
};

/**
 * Checks if the invited_at date is greater than the specified number of days from the current date.
 * @param {string} invitedAt - The date when the invitation was sent, in string format.
 * @param {number} [days=7] - The number of days to compare against. Default is 7 days.
 * @returns {boolean} - Returns true if the invited_at date is greater than the specified number of days from now, false otherwise.
 */
export const isInvitationExpired = (invitedAt, days = 7) => {
  if (!invitedAt || typeof invitedAt !== 'string') {
    return true; // Invalid format or missing invitedAt
  }

  const currentTime = new Date().getTime();
  const invitedTime = new Date(invitedAt).getTime();

  if (isNaN(invitedTime)) {
    return true; // Invalid date format
  }

  const daysInMilliseconds = days * 24 * 60 * 60 * 1000;
  return currentTime - invitedTime > daysInMilliseconds;
};



export { isExpired, ensureSessionNotExpired };