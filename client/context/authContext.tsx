import React, { useReducer, createContext, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import Cookies from 'js-cookie';

import { GET_CURRENT_USER } from '../graphql/queries';

type ActionPayload = {
  /** The user's name, email and avatar URL provided by the dispatched action's payload */
  user: {
    _id: string;
    name: string;
    email: string;
    avatar: string;
  };
};

type Action = {
  /** The action type that tells the Reducer what action needs to be performed before returning the new state */
  type: 'LOGGED_IN_USER' | 'LOGGED_OUT_USER';
  /** The action payload that gives the Reducer the necessary data that it needs to incorporate to return the new state */
  payload: ActionPayload;
};

type State = {
  /** The user's name, email and avatar URL that lives in the state */
  user: {
    _id: string;
    name: string;
    email: string;
    avatar: string;
  };
};

// reducer
const authReducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'LOGGED_IN_USER':
      return { ...state, user: action.payload.user };
    default:
      return state;
  }
};

// state
const initialState: State = {
  user: {
    _id: '',
    name: '',
    email: '',
    avatar: '',
  },
};

type ContextType = {
  /** The global state provided by context */
  state: State;
  /** The dispatch method provided by context that will dispatch an action to update the global state */
  dispatch: React.Dispatch<Action>;
};

// create context
const AuthContext = createContext<ContextType>({
  state: initialState,
  dispatch: () => null,
});

type ComponentWithChildProps = React.PropsWithChildren<{ example?: string }>;

// context provider
const AuthProvider = ({
  children,
}: ComponentWithChildProps): React.ReactElement => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    // Check if user is signed in when app loads by the availability of the checkToken
    const checkTokenExists = Cookies.get('checkToken');

    // If token exists, get the user data from the backend and dispatch user details
    if (checkTokenExists) {
      const { data: user } = useQuery(GET_CURRENT_USER);

      if (user) {
        dispatch({
          type: 'LOGGED_IN_USER',
          payload: {
            user: {
              _id: user.current._id,
              name: user.current.name,
              email: user.current.email,
              avatar: user.current.avatar,
            },
          },
        });
      } else {
        // If checkToken exists but httpOnly with the actual token does not ie. server returns error, dispatch a blank state
        dispatch({
          type: 'LOGGED_IN_USER',
          payload: initialState,
        });
      }
    }
  }, []);

  const value = { state, dispatch };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// export
export { AuthContext, AuthProvider };