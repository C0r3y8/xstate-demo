import { Machine, actions, sendParent } from 'xstate';

const { assign } = actions;

export interface Todo {
  completed?: boolean;
  id?: string;
  prevTitle: string;
  title: string;
}

export const todoMachine = Machine<Todo>({
  id: 'todo',
  initial: 'reading',
  context: {
    id: undefined,
    title: '',
    prevTitle: ''
  },
  on: {
    TOGGLE_COMPLETE: {
      target: '.reading.completed',
      actions: [
        assign<Todo>({ completed: true }),
        sendParent((ctx: Todo) => ({ todo: ctx, type: 'TODO.COMMIT' }))
      ]
    },
    DELETE: 'deleted'
  },
  states: {
    reading: {
      initial: 'unknown',
      states: {
        unknown: {
          on: {
            '': [
              { target: 'completed', cond: ctx => ctx.completed || false },
              { target: 'pending' }
            ]
          }
        },
        pending: {
          on: {
            SET_COMPLETED: {
              target: 'completed',
              actions: [
                assign<Todo>({ completed: true }),
                sendParent((ctx: Todo) => ({ todo: ctx, type: 'TODO.COMMIT' }))
              ]
            }
          }
        },
        completed: {
          on: {
            TOGGLE_COMPLETE: {
              target: 'pending',
              actions: [
                assign<Todo>({ completed: false }),
                sendParent((ctx: Todo) => ({ todo: ctx, type: 'TODO.COMMIT' }))
              ]
            },
            SET_ACTIVE: {
              target: 'pending',
              actions: [
                assign<Todo>({ completed: false }),
                sendParent((ctx: Todo) => ({ todo: ctx, type: 'TODO.COMMIT' }))
              ]
            }
          }
        },
        hist: {
          type: 'history'
        }
      },
      on: {
        EDIT: {
          target: 'editing',
          actions: 'focusInput'
        }
      }
    },
    editing: {
      onEntry: assign({ prevTitle: ctx => ctx.title }),
      on: {
        CHANGE: {
          actions: assign({ title: (ctx, e) => e.value })
        },
        COMMIT: [
          {
            actions: sendParent((ctx: Todo) => ({
              todo: ctx,
              type: 'TODO.COMMIT'
            })),
            cond: ctx => ctx.title.trim().length > 0,
            target: 'reading.hist'
          },
          { target: 'deleted' }
        ],
        BLUR: {
          target: 'reading',
          actions: sendParent((ctx: Todo) => ({
            todo: ctx,
            type: 'TODO.COMMIT'
          }))
        },
        CANCEL: {
          target: 'reading',
          actions: assign({ title: ctx => ctx.prevTitle })
        }
      }
    },
    deleted: {
      onEntry: sendParent((ctx: Todo) => ({ id: ctx.id, type: 'TODO.DELETE' }))
    }
  }
});
