import { appReducer } from "./app-slice.ts"
import { tasksReducer } from "@/features/todolists/model/tasks-slice.ts"
import { todolistsReducer } from "@/features/todolists/model/todolists-slice.ts"
import { configureStore } from "@reduxjs/toolkit"

// объединение reducer'ов с помощью combineReducers

// создание store
export const store = configureStore({
  reducer: {
    tasks: tasksReducer,
    todolists: todolistsReducer,
    app: appReducer,
  },
})

// автоматическое определение типа всего объекта состояния
export type RootState = ReturnType<typeof store.getState>
// автоматическое определение типа метода dispatch
export type AppDispatch = typeof store.dispatch

// для возможности обращения к store в консоли браузера
// @ts-ignore
window.store = store
