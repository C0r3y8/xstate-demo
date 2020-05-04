import React, { useEffect } from 'react';
import cn from 'classnames';
import { State, Interpreter } from 'xstate';
import { useMachine } from '@xstate/react';

import { Todo } from './components/Todo';
import { Todos as TodosType, todosMachine } from './todosMachine';
import { useHashChange } from './useHashChange';

function filterTodos(state: State<TodosType>, todos: TodosType['todos']) {
  if (state.matches('active')) {
    return todos.filter(todo => !todo.completed);
  }

  if (state.matches('completed')) {
    return todos.filter(todo => todo.completed);
  }

  return todos;
}

const persistedTodosMachine = todosMachine.withConfig(
  {
    actions: {
      persist: ctx => {
        localStorage.setItem('todos-xstate', JSON.stringify(ctx.todos));
      }
    }
  },
  // initial state from localstorage
  {
    todo: 'Learn state machines',
    todos: (() => {
      try {
        return JSON.parse(localStorage.getItem('todos-xstate') || '') || [];
      } catch (e) {
        return [];
      }
    })()
  }
);

export function Todos({
  loginState,
  opSend
}: {
  loginState: State<{ token: string }>;
  opSend: Interpreter<{}>['send'];
}) {
  const [state, send] = useMachine(persistedTodosMachine);

  useHashChange(() => {
    send(`SHOW.${window.location.hash.slice(2) || "all"}`);
  });

  // Capture initial state of browser hash
  useEffect(() => {
    window.location.hash.slice(2) &&
      send(`SHOW.${window.location.hash.slice(2)}`);
  });

  const { todos, todo } = state.context;

  const numActiveTodos = todos.filter(todo => !todo.completed).length;
  const allCompleted = todos.length > 0 && numActiveTodos === 0;
  const mark = !allCompleted ? "completed" : "active";
  const markEvent = `MARK.${mark}`;
  const filteredTodos = filterTodos(state, todos);

  return (
    <section className="todoapp" data-state={state.toStrings()}>
      <header className="header">
        <h1>todos</h1>
        <input
          className="new-todo"
          placeholder="What needs to be done?"
          autoFocus
          onKeyPress={(e) => {
            const value = (e.target as any).value
            if (e.key === "Enter") {
              opSend('DO_SOMETHING');
              setTimeout(() => {
                if (loginState.matches('logged')) {
                  send("NEWTODO.COMMIT", { value });
                }
                opSend('OP_FINISH')
              }, 5000);
              // }, 0);
            }
          }}
          onChange={(e) => {
            send("NEWTODO.CHANGE", { value: e.target.value })
          }}
          value={todo}
        />
      </header>
      <section className="main">
        <input
          id="toggle-all"
          className="toggle-all"
          type="checkbox"
          checked={allCompleted}
          onChange={() => {
            send(markEvent);
          }}
        />
        <label htmlFor="toggle-all" title={`Mark all as ${mark}`}>
          Mark all as {mark}
        </label>
        <ul className="todo-list">
          {filteredTodos.map(todo => (
            <Todo key={todo.id} todoRef={todo.ref!} />
          ))}
        </ul>
      </section>
      {!!todos.length && (
        <footer className="footer">
          <span className="todo-count">
            <strong>{numActiveTodos}</strong> item
            {numActiveTodos === 1 ? "" : "s"} left
          </span>
          <ul className="filters">
            <li>
              <a
                className={cn({ selected: state.matches('all') })}
                href="#/"
              >
                All
              </a>
            </li>
            <li>
              <a
                className={cn({ selected: state.matches('active') })}
                href="#/active"
              >
                Active
              </a>
            </li>
            <li>
              <a
                className={cn({ selected: state.matches('completed') })}
                href="#/completed"
              >
                Completed
              </a>
            </li>
          </ul>
          {numActiveTodos < todos.length && (
            <button
              className='clear-completed'
              onClick={_ => send('CLEAR_COMPLETED')}
            >
              Clear completed
            </button>
          )}
        </footer>
      )}
    </section>
  );
}
