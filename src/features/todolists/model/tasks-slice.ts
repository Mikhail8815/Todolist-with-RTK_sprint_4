import { createTodolist, deleteTodolist } from "@/features/todolists/model/todolists-slice.ts"
import { createAppSlice } from "@/common/utils"
import { tasksApi } from "@/features/todolists/api/tasksApi.ts"
import {
  CreateTaskArgs,
  DeleteTaskArgs,
  DomainTask,
  type UpdateTaskModel,
} from "@/features/todolists/api/tasksApi.types.ts"
import { RootState } from "@/app/store.ts"
import { setAppStatusAC } from "@/app/app-slice.ts"

export const tasksSlice = createAppSlice({
  name: "tasks",
  initialState: {} as TasksState,
  reducers: (create) => ({
    //thunk
    fetchTasks: create.asyncThunk(
      async (todolistId: string, { rejectWithValue, dispatch }) => {
        try {
          dispatch(setAppStatusAC({ status: "loading" }))
          const res = await tasksApi.getTasks(todolistId)
          dispatch(setAppStatusAC({ status: "succeeded" }))
          return { tasks: res.data.items, todolistId }
        } catch (error) {
          dispatch(setAppStatusAC({ status: "failed" }))
          return rejectWithValue(null)
        }
      },
      {
        fulfilled: (state, action) => {
          state[action.payload.todolistId] = action.payload.tasks
        },
      },
    ),
    createTask: create.asyncThunk(
      async (args: CreateTaskArgs, { rejectWithValue, dispatch }) => {
        try {
          dispatch(setAppStatusAC({ status: "loading" }))
          await new Promise((resolve) => {
            setTimeout(resolve, 2000)
          })
          const res = await tasksApi.createTask(args)
          dispatch(setAppStatusAC({ status: "succeeded" }))
          return { task: res.data.data.item }
        } catch (error) {
          dispatch(setAppStatusAC({ status: "failed" }))
          return rejectWithValue(null)
        }
      },
      {
        fulfilled: (state, action) => {
          //TODO
          // const newTask: DomainTask = {
          //   title: action.payload.args.title,
          //   status: TaskStatus.New,
          //   id: nanoid(),
          //   todoListId: action.payload.args.todolistId,
          //   deadline: "",
          //   order: 1,
          //   startDate: "",
          //   description: "",
          //   priority: TaskPriority.Low,
          //   addedDate: "",
          // }
          state[action.payload.task.todoListId].unshift(action.payload.task)
        },
      },
    ),
    deleteTask: create.asyncThunk(
      async (args: DeleteTaskArgs, { rejectWithValue }) => {
        try {
          await tasksApi.deleteTask(args)
          return args
        } catch (error) {
          return rejectWithValue(null)
        }
      },
      {
        fulfilled: (state, action) => {
          const tasks = state[action.payload.todolistId]
          const index = tasks.findIndex((task) => task.id === action.payload.taskId)
          if (index !== -1) {
            tasks.splice(index, 1)
          }
        },
      },
    ),
    // changeTaskStatus: create.asyncThunk(
    //   async (args: { todolistId: string; taskId: string; status: TaskStatus }, thunkAPI) => {
    //     const { todolistId, taskId, status } = args
    //
    //     const allTodolistTasks = (thunkAPI.getState() as RootState).tasks[todolistId]
    //     const task = allTodolistTasks.find((task) => task.id === taskId)
    //
    //     if (!task) {
    //       return thunkAPI.rejectWithValue(null)
    //     }
    //
    //     const model: UpdateTaskModel = {
    //       description: task.description,
    //       priority: task.priority,
    //       startDate: task.startDate,
    //       deadline: task.deadline,
    //       title: task.title,
    //       status,
    //     }
    //
    //     try {
    //       const res = await tasksApi.updateTask({ todolistId, taskId, model })
    //       return { task: res.data.data.item }
    //     } catch (error) {
    //       return thunkAPI.rejectWithValue(null)
    //     }
    //   },
    //   {
    //     fulfilled: (state, action) => {
    //       const task = state[action.payload.task.todoListId].find((task) => task.id === action.payload.task.id)
    //       if (task) {
    //         task.status = action.payload.task.status
    //       }
    //     },
    //   },
    // ),
    // changeTaskTitle: create.asyncThunk(
    //   async (args: { todolistId: string; taskId: string; title: string }, thunkAPI) => {
    //     const { todolistId, taskId, title } = args
    //
    //     const allTodolistTasks = (thunkAPI.getState() as RootState).tasks[todolistId]
    //     const task = allTodolistTasks.find((task) => task.id === taskId)
    //
    //     if (!task) {
    //       return thunkAPI.rejectWithValue(null)
    //     }
    //
    //     const model: UpdateTaskModel = {
    //       description: task.description,
    //       status: task.status,
    //       priority: task.priority,
    //       startDate: task.startDate,
    //       deadline: task.deadline,
    //       title,
    //     }
    //     try {
    //       const res = await tasksApi.updateTask({ todolistId, taskId, model })
    //       return { task: res.data.data.item }
    //     } catch (error) {
    //       return thunkAPI.rejectWithValue(null)
    //     }
    //   },
    //   {
    //     fulfilled: (state, action) => {
    //       const task = state[action.payload.task.todoListId].find((task) => task.id === action.payload.task.id)
    //       if (task) {
    //         task.title = action.payload.task.title
    //       }
    //     },
    //   },
    // ),
    updateTask: create.asyncThunk(
      async (
        args: { todolistId: string; taskId: string; domainModel: Partial<UpdateTaskModel> },
        { dispatch, rejectWithValue, getState },
      ) => {
        const { todolistId, taskId, domainModel } = args

        const allTodolistTasks = (getState() as RootState).tasks[todolistId]
        const task = allTodolistTasks.find((task) => task.id === taskId)

        if (!task) {
          return rejectWithValue(null)
        }

        const model: UpdateTaskModel = {
          description: task.description,
          status: task.status,
          priority: task.priority,
          startDate: task.startDate,
          deadline: task.deadline,
          title: task.title,
          ...domainModel,
        }
        try {
          dispatch(setAppStatusAC({ status: "loading" }))
          const res = await tasksApi.updateTask({ todolistId, taskId, model })
          dispatch(setAppStatusAC({ status: "succeeded" }))
          return { task: res.data.data.item }
        } catch (error) {
          dispatch(setAppStatusAC({ status: "failed" }))
          return rejectWithValue(null)
        }
      },
      {
        fulfilled: (state, action) => {
          // const allTodolistTasks = state[action.payload.task.todoListId]
          // const taskIndex = allTodolistTasks.findIndex((task) => task.id === action.payload.task.id)
          // if (taskIndex !== -1) {
          //   allTodolistTasks[taskIndex] = action.payload.task
          // }
          const task = state[action.payload.task.todoListId].find((task) => task.id === action.payload.task.id)
          if (task) {
            task.status = action.payload.task.status
            // task.title = action.payload.task.title
          }
        },
      },
    ),
    //actions
    // deleteTaskAC: create.reducer<{ todolistId: string; taskId: string }>((state, action) => {
    //   const tasks = state[action.payload.todolistId]
    //   const index = tasks.findIndex((task) => task.id === action.payload.taskId)
    //   if (index !== -1) {
    //     tasks.splice(index, 1)
    //   }
    // }),
    // createTaskAC: create.reducer<{ todolistId: string; title: string }>((state, action) => {
    //   const newTask: DomainTask = {
    //     title: action.payload.title,
    //     status: TaskStatus.New,
    //     id: nanoid(),
    //     todoListId: action.payload.todolistId,
    //     deadline: "",
    //     order: 1,
    //     startDate: "",
    //     description: "",
    //     priority: TaskPriority.Low,
    //     addedDate: "",
    //   }
    //   state[action.payload.todolistId].unshift(newTask)
    // }),
    // changeTaskStatusAC: create.reducer<{ todolistId: string; taskId: string; isDone: boolean }>((state, action) => {
    //   const task = state[action.payload.todolistId].find((task) => task.id === action.payload.taskId)
    //   if (task) {
    //     task.status = action.payload.isDone ? TaskStatus.Completed : TaskStatus.New
    //   }
    // }),
    // changeTaskTitleAC: create.reducer<{ todolistId: string; taskId: string; title: string }>((state, action) => {
    //   const task = state[action.payload.todolistId].find((task) => task.id === action.payload.taskId)
    //   if (task) {
    //     task.title = action.payload.title
    //   }
    // }),
  }),
  extraReducers: (builder) => {
    builder
      .addCase(createTodolist.fulfilled, (state, action) => {
        state[action.payload.todolist.id] = []
      })
      .addCase(deleteTodolist.fulfilled, (state, action) => {
        delete state[action.payload.id]
      })
  },
  selectors: {
    selectTasks: (state) => state,
  },
})

export const tasksReducer = tasksSlice.reducer
export const { deleteTask, createTask, fetchTasks, updateTask } = tasksSlice.actions
export const { selectTasks } = tasksSlice.selectors

export type TasksState = Record<string, DomainTask[]>
