import { AnyEventObject, Interpreter, Machine, assign, spawn } from 'xstate';
import { v4 as uuid } from 'uuid';

import { Todo, todoMachine } from './components/todoMachine';

export interface TodoWithRef extends Todo {
  ref?: Interpreter<Todo>;
}

export interface Todos {
  todo: string;
  todos: TodoWithRef[];
}

const createTodo = (title: string): TodoWithRef => {
  return {
    id: uuid(),
    prevTitle: '',
    title: title,
    completed: false
  };
};

export const todosMachine = Machine<Todos>({
  id: 'todos',
  context: {
    todo: '', // new todo
    todos: []
  },
  initial: 'initializing',
  states: {
    initializing: {
      entry: assign<Todos>({
        todos: (ctx, e) => {
          return ctx.todos.map(todo => ({
            ...todo,
            ref: spawn(todoMachine.withContext(todo))
          }));
        }
      }),
      on: {
        '': 'all'
      }
    },
    all: {},
    active: {},
    completed: {}
  },
  on: {
    'NEWTODO.CHANGE': {
      actions: assign<Todos, AnyEventObject>({
        todo: (ctx, e) => e.value
      })
    },
    'NEWTODO.COMMIT': {
      actions: [
        assign<Todos, AnyEventObject>({
          todo: '', // clear todo
          todos: (ctx, e) => {
            const newTodo = createTodo(e.value.trim());
            return ctx.todos.concat({
              ...newTodo,
              ref: spawn(todoMachine.withContext(newTodo))
            });
          }
        }),
        'persist'
      ],
      cond: (ctx, e) => e.value.trim().length > 0
    },
    'TODO.COMMIT': {
      actions: [
        assign<Todos, AnyEventObject>({
          todos: (ctx, e) =>
            ctx.todos.map(todo => {
              return todo.id === e.todo.id
                ? { ...todo, ...e.todo, ref: todo.ref }
                : todo;
            })
        }),
        'persist'
      ]
    },
    'TODO.DELETE': {
      actions: [
        assign<Todos, AnyEventObject>({
          todos: (ctx, e) => ctx.todos.filter(todo => todo.id !== e.id)
        }),
        'persist'
      ]
    },
    'SHOW.all': '.all',
    'SHOW.active': '.active',
    'SHOW.completed': '.completed',
    'MARK.completed': {
      actions: (ctx) => {
        ctx.todos.forEach(todo => todo.ref!.send('SET_COMPLETED'));
      }
    },
    'MARK.active': {
      actions: ctx => {
        ctx.todos.forEach(todo => todo.ref!.send('SET_ACTIVE'));
      }
    },
    CLEAR_COMPLETED: {
      actions: assign({
        todos: ctx => ctx.todos.filter(todo => !todo.completed)
      })
    }
  }
});
