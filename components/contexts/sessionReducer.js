/** ---------------------------
 *       Reducer Function
 *  ---------------------------
 * Reducer function to manage the user session state.
 *
 * @param {Object} state - The current state of the session.
 * @param {Object} action - The action object to determine the state change.
 * @param {string} action.type - The type of action to be performed.
 * @param {Object} [action.payload] - The payload containing data for the action.
 * @returns {Object} The new state after applying the action.
 */

const sessionReducer = (state, action) => {
  switch (action.type) {
    case actionTypes.SET_SESSION:
      return {
        ...state,
        session: action.payload,
        user: action.payload?.user || null,
        token: action.payload?.access_token || null,
        preferences:
          action.payload?.user?.preferences ?? defaultUserPreferences,
      };
    case actionTypes.SET_USER:
      return { ...state, user: action.payload };
    case actionTypes.SET_PREFERENCES:
      return { ...state, preferences: action.payload };
    case actionTypes.LOGOUT:
      return { ...defaultSession };
    default:
      throw new Error(`Unhandled action type: ${action.type}`);
  }
};

export default sessionReducer;
