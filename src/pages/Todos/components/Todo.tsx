import React, { useEffect, useRef } from 'react';
import cn from 'classnames';
import { AnyEventObject, Interpreter } from 'xstate';
import { useService } from '@xstate/react';

import { Todo as TodoType } from './todoMachine';

export function Todo({ todoRef }: { todoRef: Interpreter<TodoType> }) {
  const [state, send] = useService<TodoType, AnyEventObject>(todoRef);
  const inputRef = useRef<HTMLInputElement>(null);
  const { id, title, completed } = state.context;

  useEffect(() => {
    todoRef.execute(state, {
      focusInput() {
        inputRef.current && inputRef.current.select();
      }
    });
  }, [state, todoRef]);

  return (
    <li
      className={cn({
        editing: state.matches('editing'),
        completed
      })}
      data-todo-state={completed ? 'completed' : 'active'}
      key={id}
    >
      <div className="view">
        <input
          className="toggle"
          checked={completed}
          onChange={_ => { send("TOGGLE_COMPLETE"); }}
          type="checkbox"
          value={(completed || false).toString()}
        />
        <label
          onDoubleClick={e => { send('EDIT'); }}
        >
          {title}
        </label>{' '}
        <button className="destroy" onClick={() => send('DELETE')} />
      </div>
      <input
        className="edit"
        value={title}
        onBlur={_ => send('BLUR')}
        onChange={e => send('CHANGE', { value: e.target.value })}
        onKeyPress={e => {
          if (e.key === 'Enter') {
            send('COMMIT');
          }
        }}
        onKeyDown={e => {
          if (e.key === 'Escape') {
            send('CANCEL');
          }
        }}
        ref={inputRef}
      />
    </li>
  );
}
