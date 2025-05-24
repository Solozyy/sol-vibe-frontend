"use client"

// Inspired by react-hot-toast library
import * as React from "react"

// Removed: import type { ToastActionElement, ToastProps } from "sonner"
// Instead, we'll define types locally or use more specific sonner types if applicable elsewhere.

const TOAST_LIMIT = 1
const TOAST_REMOVE_DELAY = 5000 // Milliseconds

// Define a type for the toast action, similar to what sonner expects for its action prop.
type CustomToastAction = {
  label: React.ReactNode;
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void; // Or just () => void if event arg isn't always used
};

// This is the shape of the toast objects managed by this custom hook.
type ToasterToast = {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: CustomToastAction; // Use our custom defined action type
  variant?: "default" | "destructive";
  open: boolean; // Explicitly part of our toast state
  onOpenChange: (open: boolean) => void; // Callback for when open state should change
  // If you intend to pass other sonner-specific props (like `duration`, `icon`, etc.)
  // through this system, you would add them here.
  // For example: `duration?: number;`
};

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

type ActionType = typeof actionTypes

type Action =
  | {
      type: ActionType["ADD_TOAST"]
      toast: ToasterToast // Uses our defined ToasterToast
    }
  | {
      type: ActionType["UPDATE_TOAST"]
      toast: Partial<ToasterToast> & { id: string } // Ensure ID is present for updates
    }
  | {
      type: ActionType["DISMISS_TOAST"]
      toastId?: ToasterToast["id"]
    }
  | {
      type: ActionType["REMOVE_TOAST"]
      toastId?: ToasterToast["id"]
    }

interface State {
  toasts: ToasterToast[]
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) {
    return
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId)
    dispatch({
      type: "REMOVE_TOAST",
      toastId: toastId,
    })
  }, TOAST_REMOVE_DELAY)

  toastTimeouts.set(toastId, timeout)
}

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }

    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) => (t.id === action.toast.id ? { ...t, ...action.toast } : t)),
      }

    case "DISMISS_TOAST": {
      const { toastId } = action

      if (toastId) {
        addToRemoveQueue(toastId)
      } else {
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id)
        })
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false, // Mark as not open
              }
            : t,
        ),
      }
    }
    case "REMOVE_TOAST":
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        }
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      }
  }
}

const listeners: Array<(state: State) => void> = []

let memoryState: State = { toasts: [] }

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action)
  listeners.forEach((listener) => {
    listener(memoryState)
  })
}

// Defines the properties that can be passed to the toast() function.
// Excludes properties managed internally like id, open, onOpenChange.
type ToastOptions = Pick<ToasterToast, "title" | "description" | "variant" | "action">;
// Make all properties in ToastOptions optional for the toast() function call
type OptionalToastOptions = {
  [K in keyof ToastOptions]?: ToastOptions[K]
}


function toast(props: OptionalToastOptions) {
  const id = genId()

  // The `dismiss` function specific to this toast instance
  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id })

  // The `update` function specific to this toast instance
  // Note: The props for update can be any partial ToasterToast, but must include id.
  const update = (updateProps: Partial<Omit<ToasterToast, "id">>) =>
    dispatch({
      type: "UPDATE_TOAST",
      toast: { ...updateProps, id },
    })

  dispatch({
    type: "ADD_TOAST",
    toast: {
      // Spread provided props (title, description, variant, action)
      ...props,
      // Internally managed properties:
      id,
      open: true,
      onOpenChange: (open: boolean) => { // Explicitly type 'open'
        if (!open) {
          // Call the dismiss logic for this specific toast
          // This directly dispatches the action rather than calling the `dismiss` const,
          // to avoid potential closure issues if `dismiss` isn't initialized yet,
          // though in this setup, `dismiss` would be available.
          dispatch({ type: "DISMISS_TOAST", toastId: id });
        }
      },
      // Ensure default variant if not provided, though props destructuring could also handle this
      variant: props.variant || "default",
    },
  })

  return {
    id: id,
    dismiss,
    update,
  }
}

function useToast() {
  const [state, setState] = React.useState<State>(memoryState)

  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [state]) // state dependency ensures re-subscription if state instance changes, though memoryState is module-level

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }),
  }
}

export { useToast, toast }