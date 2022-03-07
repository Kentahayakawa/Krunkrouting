// action - state management
import { ACCOUNT_INITIALIZE, GROUP_INIT, LOGIN, INVITE_CODE, LOGOUT, PRICE_FILTER, RATING_FILTER, DISTANCE_FILTER, SEARCH_RESULTS, CLEAR_SEARCH_RESULTS} from './actions';

export const initialState = {
    token: '',
    isLoggedIn: false,
    isInitialized: false,
    user: null,
    group_invite_code: null,
    search_results: []
};

//-----------------------|| ACCOUNT REDUCER ||-----------------------//

const accountReducer = (state = initialState, action) => {
    switch (action.type) {
        case ACCOUNT_INITIALIZE: {
            const { isLoggedIn, user, token } = action.payload;
            return {
                ...state,
                isLoggedIn,
                isInitialized: true,
                token,
                user
            };
        }

        case LOGIN: {
            const { user } = action.payload;
            return {
                ...state,
                isLoggedIn: true,
                user
            };
        }

        case LOGOUT: {
            return {
                ...state,
                isLoggedIn: false,
                token: '',
                user: null
            };
        }

        case PRICE_FILTER: {
            const { minprice, maxprice } = action.payload;
            return {
                ...state,
                minprice,
                maxprice
            };
        }

        case RATING_FILTER: {
            const { minrating } = action.payload;
            return {
                ...state,
                minrating
            };
        }

        case INVITE_CODE:{
            const {group_invite_code} = action.payload;
            return {
                ...state,
                group_invite_code
            };
        }

        case DISTANCE_FILTER: {
            const { distbias } = action.payload;
            return {
                ...state,
                distbias
            };
        }

        case SEARCH_RESULTS: {
            const { search_results } = action.payload;
            return {
                ...state,
                search_results
            };
        }
        
        case CLEAR_SEARCH_RESULTS: {
            return {
                ...state,
                search_results: []
            };
        }

        default: {
            return { ...state };
        }
    }
};

export default accountReducer;
