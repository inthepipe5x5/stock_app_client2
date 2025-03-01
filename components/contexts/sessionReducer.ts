import defaultSession, {session} from "@/constants/defaultSession";
import defaultUserPreferences from "@/constants/userPreferences";
import isTruthy from "@/utils/isTruthy";

/** ---------------------------
 *       Action Types
 *  ---------------------------
 * Enum for action types used in the session reducer.
 *
 * @readonly
 * @enum {string}
 */
export const actionTypes = Object.freeze({
  //actionTypes session
  SET_ANON_SESSION: "SET_ANON_SESSION",
  SET_NEW_SESSION: "SET_NEW_SESSION",
  UPDATE_SESSION: "SET_NEW_SESSION",
  CLEAR_SESSION: "CLEAR_SESSION",
  //actionTypes auth.users
  // SET_AUTH_USER: "SET_AUTH_USER",
  // UPDATE_AUTH_USER: "UPDATE_AUTH_USER",
  // CLEAR_AUTH_USER: "CLEAR_AUTH_USER",

  //actionTypes users/profiles
  SUCCESSFUL_LOGIN: "SUCCESSFUL_LOGIN",
  SET_USER: "SET_USER",
  UPDATE_USER: "UPDATE_USER",
  LOGOUT: "LOGOUT",
  LOGOUT_USER: "LOGOUT_USER",
  //actionTypes households
  SET_HOUSEHOLDS: "SET_HOUSEHOLDS",
  UPDATE_HOUSEHOLDS: "UPDATE_HOUSEHOLDS",
  //actionTypes inventories
  SET_INVENTORIES: "SET_INVENTORIES",
  UPDATE_INVENTORIES: "UPDATE_INVENTORIES",
  //actionTypes products
  SET_PRODUCTS: "SET_PRODUCTS",
  UPDATE_PRODUCTS: "UPDATE_PRODUCTS",
  //actionTypes tasks
  SET_TASKS: "SET_TASKS",
  UPDATE_TASKS: "UPDATE_TASKS",
  //actionTypes drafts
  SET_DRAFTS: "SET_DRAFTS",
  UPDATE_DRAFTS: "UPDATE_DRAFTS",
  CLEAR_DRAFTS: "CLEAR_DRAFTS",
  //actionTypes preferences
  SET_PREFERENCES: "SET_PREFERENCES",
  UPDATE_PREFERENCES: "UPDATE_PREFERENCES",
  CLEAR_PREFERENCES: "CLEAR_PREFERENCES",

  //actionTypes messages
  SET_MESSAGE: "SET_MESSAGE",
  SET_MESSAGES: "SET_MESSAGES",
  REMOVE_MESSAGE: "REMOVE_MESSAGE",
  CLEAR_MESSAGES: "CLEAR_MESSAGES",
});

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

export interface Action {
  type: keyof typeof actionTypes;
  payload?: any |  null | undefined;
}

const sessionReducer = (state: Partial<session>, action: Action): Partial<session> => {
  switch (action.type) {
    case actionTypes.CLEAR_SESSION:
    case actionTypes.SET_ANON_SESSION:
      return { ...defaultSession };

    case actionTypes.SUCCESSFUL_LOGIN:
      return { ...defaultSession, ...action.payload };
    case actionTypes.SET_NEW_SESSION:
      return { ...defaultSession, ...action.payload };
    case actionTypes.UPDATE_SESSION:
      return {
        ...state,
        ...action.payload,
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
      return { ...state, drafts: { ...state.drafts, ...action.payload } };

    case actionTypes.CLEAR_DRAFTS:
      return { ...state, drafts: defaultSession.drafts };

    // case actionTypes.SET_PREFERENCES:
    //   return { ...state, user: { ...action.payload } };

    // case actionTypes.UPDATE_PREFERENCES:
    //   return { ...state, user: { ...state.user.preferences, ...action.payload } };
    // case actionTypes.CLEAR_PREFERENCES:
    //   return { ...state, user: { ...state.user, preferences: defaultUserPreferences, user_id: state.user?.user_id ?? '' } };

    case actionTypes.SET_MESSAGE:
    case actionTypes.SET_MESSAGES:
      return { ...state, message: action.payload };
    case actionTypes.REMOVE_MESSAGE:
      
      return isTruthy(state?.message) ? { ...state, message: (state.message ?? []).filter((msg: any) => msg !== action.payload) } : state;
    case actionTypes.CLEAR_MESSAGES:
      return { ...state, message: [] };

    default:
      throw new Error(`Unhandled action type: ${action.type}`);
  }
}

export default sessionReducer;

