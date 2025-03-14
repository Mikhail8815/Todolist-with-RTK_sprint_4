import { Todolist } from "@/features/todolists/api/todolistsApi.types.ts"
import { todolistsApi } from "@/features/todolists/api/todolistsApi.ts"
import { createAppSlice } from "@/common/utils"
import { setAppStatusAC } from "@/app/app-slice.ts"

export const todolistsSlice = createAppSlice({
  name: "todolists",
  initialState: [] as DomainTodolist[],
  reducers: (create) => ({
    //actions
    changeTodolistFilterAC: create.reducer<{ id: string; filter: FilterValues }>((state, action) => {
      const todolist = state.find((todolist) => todolist.id === action.payload.id)
      if (todolist) {
        todolist.filter = action.payload.filter
      }
    }),
    //async actions (thunk)
    fetchTodolists: create.asyncThunk(
      async (_arg, { rejectWithValue, dispatch }) => {
        try {
          dispatch(setAppStatusAC({ status: "loading" }))
          const res = await todolistsApi.getTodolists()
          dispatch(setAppStatusAC({ status: "succeeded" }))
          return { todolists: res.data }
        } catch (error) {
          dispatch(setAppStatusAC({ status: "failed" }))
          return rejectWithValue(null)
        }
      },
      {
        fulfilled: (state, action) => {
          action.payload?.todolists.forEach((tl) => {
            state.push({ ...tl, filter: "all" })
          })
        },
      },
    ),
    changeTodolistTitle: create.asyncThunk(
      async (args: { id: string; title: string }, { rejectWithValue }) => {
        try {
          await todolistsApi.changeTodolistTitle(args)
          return args
        } catch (error) {
          return rejectWithValue(null)
        }
      },
      {
        fulfilled: (state, action) => {
          const index = state.findIndex((todolist) => todolist.id === action.payload.id)
          if (index !== -1) {
            state[index].title = action.payload.title
          }
        },
      },
    ),
    createTodolist: create.asyncThunk(
      async (title: string, { rejectWithValue }) => {
        try {
          const res = await todolistsApi.createTodolist(title)
          return { todolist: res.data.data.item }
        } catch (error) {
          return rejectWithValue(null)
        }
      },
      {
        fulfilled: (state, action) => {
          state.push({ ...action.payload.todolist, filter: "all" })
        },
      },
    ),
    deleteTodolist: create.asyncThunk(
      async (id: string, { rejectWithValue }) => {
        try {
          await todolistsApi.deleteTodolist(id)
          return { id }
        } catch (error) {
          return rejectWithValue(null)
        }
      },
      {
        fulfilled: (state, action) => {
          const index = state.findIndex((todolist) => todolist.id === action.payload.id)
          if (index !== -1) {
            state.splice(index, 1)
          }
        },
      },
    ),
  }),
  // extraReducers: (builder) => {
  //   builder
  // .addCase(fetchTodolists.fulfilled, (state, action) => {
  //   action.payload?.todolists.forEach((tl) => {
  //     state.push({ ...tl, filter: "all" })
  //   })
  // })
  // .addCase(changeTodolistTitle.fulfilled, (state, action) => {
  //   const index = state.findIndex((todolist) => todolist.id === action.payload.id)
  //   if (index !== -1) {
  //     state[index].title = action.payload.title
  //   }
  // })
  // .addCase(createTodolist.fulfilled, (state, action) => {
  //   state.push({ ...action.payload.todolist, filter: "all" })
  // })
  // .addCase(deleteTodolist.fulfilled, (state, action) => {
  //   const index = state.findIndex((todolist) => todolist.id === action.payload.id)
  //   if (index !== -1) {
  //     state.splice(index, 1)
  //   }
  // })
  // },
  selectors: {
    selectTodolists: (state) => state,
  },
})

// export const fetchTodolists = createAsyncThunk(
//   `${todolistsSlice.name}/setTodolistsTC`,
//   async (_arg, { rejectWithValue }) => {
//     try {
//       const res = await todolistsApi.getTodolists()
//       return { todolists: res.data }
//     } catch (error) {
//       return rejectWithValue(null)
//     }
//   },
// )
// export const changeTodolistTitle = createAsyncThunk(
//   `${todolistsSlice.name}/changeTodolistTitleTC`,
//   async (args: { id: string; title: string }, { rejectWithValue }) => {
//     try {
//       await todolistsApi.changeTodolistTitle(args)
//       return args
//     } catch (error) {
//       return rejectWithValue(null)
//     }
//   },
// )
// export const createTodolist = createAsyncThunk(
//   `${todolistsSlice.name}/createTodolistTC`,
//   async (title: string, { rejectWithValue }) => {
//     try {
//       const res = await todolistsApi.createTodolist(title)
//       return { todolist: res.data.data.item }
//     } catch (error) {
//       return rejectWithValue(null)
//     }
//   },
// )
// export const deleteTodolist = createAsyncThunk(
//   `${todolistsSlice.name}/deleteTodolistTC`,
//   async (id: string, { rejectWithValue }) => {
//     try {
//       await todolistsApi.deleteTodolist(id)
//       return { id }
//     } catch (error) {
//       return rejectWithValue(null)
//     }
//   },
// )

export const todolistsReducer = todolistsSlice.reducer
export const { changeTodolistFilterAC, fetchTodolists, changeTodolistTitle, createTodolist, deleteTodolist } =
  todolistsSlice.actions
export const { selectTodolists } = todolistsSlice.selectors

export type DomainTodolist = Todolist & {
  filter: FilterValues
}

export type FilterValues = "all" | "active" | "completed"

//____________________________________________________________

// export const deleteTodolistAC = createAction<{ id: string }>("todolists/deleteTodolist")
// export const createTodolistAC = createAction("todolists/createTodolist", (title: string) => {
//   return { payload: { title, id: nanoid() } }
// })
// export const changeTodolistTitleAC = createAction<{ id: string; title: string }>("todolists/changeTodolistTitle")
// export const changeTodolistFilterAC = createAction<{ id: string; filter: FilterValues }>(
//   "todolists/changeTodolistFilter",
// )

// export const todolistsReducer = createReducer(initialState, (builder) => {
//   builder
//     .addCase(deleteTodolistAC, (state, action) => {
//       const index = state.findIndex((todolist) => todolist.id === action.payload.id)
//       if (index !== -1) {
//         state.splice(index, 1)
//       }
//     })
//     .addCase(createTodolistAC, (state, action) => {
//       state.push({ ...action.payload, filter: "all" })
//     })
//     .addCase(changeTodolistTitleAC, (state, action) => {
//       const index = state.findIndex((todolist) => todolist.id === action.payload.id)
//       if (index !== -1) {
//         state[index].title = action.payload.title
//       }
//     })
//     .addCase(changeTodolistFilterAC, (state, action) => {
//       const todolist = state.find((todolist) => todolist.id === action.payload.id)
//       if (todolist) {
//         todolist.filter = action.payload.filter
//       }
//     })
// })
