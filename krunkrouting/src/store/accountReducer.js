// action - state management
import { ACCOUNT_INITIALIZE, GROUP_INIT, LOGIN, LOGOUT } from './actions';

export const initialState = {
    token: '',
    isLoggedIn: false,
    isInitialized: false,
    user: null,
    group_invite_code: null
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

        case GROUP_INIT: {
            const { group_invite_code } = action.payload;
            return{
                ...state,
                group_invite_code
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
        default: {
            return { ...state };
        }
    }
};

export default accountReducer;
