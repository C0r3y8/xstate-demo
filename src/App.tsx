import { Machine } from 'xstate';
import { useMachine } from '@xstate/react';
import React from 'react';
// import logo from './logo.svg';
import './App.css';
import { Login } from './pages/Login';
import { Todos } from './pages/Todos';

interface User {
  token: string;
}

const token = localStorage.getItem('token');

const loginMachine = Machine<User>({
  id: 'login',
  context: {
    token: token || ''
  },
  initial: token ? 'logged' : 'notLogged',
  states: {
    logged: {
      on: {
        'LOGOUT': 'notLogged'
      }
    },
    notLogged: {
      on: {
        'LOGIN': 'logged'
      }
    }
  }
})

const opMachine = Machine({
  id: 'op',
  initial: 'idle',
  states: {
    idle: {
      on: {
        'DO_SOMETHING': 'pending'
      }
    },
    pending: {
      on: {
        'OP_FINISH': 'idle'
      }
    }
  }
})

function App() {
  const [state, send] = useMachine(loginMachine);
  const [opState, opSend] = useMachine(opMachine);

  if (state.matches('notLogged')) {
    return <Login signIn={send} />;
  }

  return (
    <div>
      <button
        className="logout-btn"
        onClick={() => {
          if (opState.matches('idle')) {
            send('LOGOUT');
            localStorage.removeItem('token');
          } else {
            alert('You do something!!!')
          }
        }}
      >Logout</button>
      <Todos loginState={state} opSend={opSend} />
    </div>
  );
}

export default App;
