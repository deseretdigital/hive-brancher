export default function createReducer (initialState, actionHandlers) {
    return (state = initialState, action) => {
        try {
            const reduceFn = actionHandlers[action.type];
            if (!reduceFn) {
                return state;
            }
            if(Array.isArray(state)) {
                return [ ...reduceFn(state, action) ];
            } else if (typeof state === 'string') {
                return reduceFn(state, action);
            }
            return {
                ...state,
                ...reduceFn(state, action)
            };
        } catch(e) {
            console.error(`An error occurred with a reducer: ${action.type}`); // eslint-disable-line no-console
            console.error(e); // eslint-disable-line no-console
        }
    };
}
