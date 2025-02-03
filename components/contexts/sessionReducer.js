import defaultUserPreferences from "@/constants/userPreferences";
const defaultSession = {
  user: null,
  preferences: defaultUserPreferences,
  token: null,
  session: null,
  drafts: [],
  households: {}, // {household_id: {household_data}}
  inventories: {}, //obj of inventories within each household_id key
  products: {}, //obj of products within each household_id-inventory_id composite key
  tasks: {}, //obj of tasks within each household_id key
};

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
    case actionTypes.SET_ANON_SESSION:
      return { ...defaultSession };

    case actionTypes.SET_SESSION:
      return {
        ...state,
        session: action.payload,
        user: action.payload?.user || null,
        token: action.payload?.access_token || null,
        preferences: action.payload?.user?.preferences ?? defaultUserPreferences,
      };

    case actionTypes.SET_USER:
      return { ...state, user: action.payload };

    case actionTypes.UPDATE_USER:
      return { ...state, user: { ...state.user, ...action.payload } };
    
      case actionTypes.LOGOUT:
    case actionTypes.LOGOUT_USER:
    case actionTypes.CLEAR_SESSION:
      return { ...defaultSession, user: null };

    case actionTypes.SET_HOUSEHOLDS:
      return { ...state, households: action.payload };

    case actionTypes.UPDATE_HOUSEHOLDS:
      return {
        ...state,
        households: { ...state.households, ...action.payload },
      };

    case actionTypes.SET_INVENTORIES:
      return { ...state, inventories: action.payload };

    case actionTypes.UPDATE_INVENTORIES:
      return {
        ...state,
        inventories: { ...state.inventories, ...action.payload },
      };

    case actionTypes.SET_PRODUCTS:
      return { ...state, products: action.payload };

    case actionTypes.UPDATE_PRODUCTS:
      return {
        ...state,
        products: { ...state.products, ...action.payload },
      };

    case actionTypes.SET_TASKS:
      return { ...state, tasks: action.payload };

    case actionTypes.UPDATE_TASKS:
      return {
        ...state,
        tasks: { ...state.tasks, ...action.payload },
      };

    case actionTypes.SET_DRAFTS:
      return { ...state, drafts: action.payload };

    case actionTypes.UPDATE_DRAFTS:
      return { ...state, drafts: [...state.drafts, ...action.payload] };

    case actionTypes.CLEAR_DRAFTS:
      return { ...state, drafts: [] };

    case actionTypes.SET_PREFERENCES:
      return { ...state, preferences: action.payload };

    case actionTypes.UPDATE_PREFERENCES:
      return { ...state, user: { ...state.user.preferences, ...action.payload }, preferences: { ...state.preferences, ...action.payload } };

    case actionTypes.LOGOUT:
      return { ...defaultSession };

    default:
      throw new Error(`Unhandled action type: ${action.type}`);
  }
}

export default sessionReducer;
