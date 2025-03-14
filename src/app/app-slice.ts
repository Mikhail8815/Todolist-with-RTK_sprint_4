import { createSlice } from "@reduxjs/toolkit"
import { RequestStatus } from "@/common/types"

const initialState = {
  themeMode: "light" as ThemeMode,
  status: "idle" as RequestStatus,
}

export const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: (create) => {
    return {
      changeThemeModeAC: create.reducer<{ themeMode: ThemeMode }>((state, action) => {
        state.themeMode = action.payload.themeMode
      }),
      setAppStatusAC: create.reducer<{ status: RequestStatus }>((state, action) => {
        state.status = action.payload.status
      }),
    }
  },
  selectors: {
    selectThemeMode: (state) => state.themeMode,
    selectStatus: (state) => state.status,
  },
})

export const appReducer = appSlice.reducer
export const { changeThemeModeAC, setAppStatusAC } = appSlice.actions
export const { selectThemeMode, selectStatus } = appSlice.selectors

// export const changeThemeModeAC = createAction<{ themeMode: ThemeMode }>("app/changeThemeMode")
//
// export const appReducer = createReducer(initialState, (builder) => {
//   builder.addCase(changeThemeModeAC, (state, action) => {
//     state.themeMode = action.payload.themeMode
//   })
// })

export type ThemeMode = "dark" | "light"
