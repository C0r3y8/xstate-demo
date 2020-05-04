import { Interpreter } from 'xstate';
import * as React from 'react';

export function Login({
  signIn
}: {
  signIn: Interpreter<{ token: string }>['send'];
}) {
  const [password, setPassword] = React.useState('');
  const [username, setUsername] = React.useState('');

  const handleSubmit = React.useCallback(() => {
    if (username === 'John' && password === 'coucou0%') {
      localStorage.setItem('token', username + Date.now())
      signIn('LOGIN');
    }
  }, [password, signIn, username]);

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <input
        className="login-item"
        onChange={(e) => {
          setUsername(e.target.value || '');
        }}
        type="text"
        value={username}
      />
      <input
        className="login-item"
        onChange={(e) => {
          setPassword(e.target.value || '');
        }}
        type="password"
        value={password}
      />
      <input type="submit" value="Login" />
    </form>
  );
}
