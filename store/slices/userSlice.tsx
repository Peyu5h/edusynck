import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "~/lib/types";

const initialState = {
  user: null as User | null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    loginUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    logoutUser: (state) => {
      state.user = null;
    },
    hydrateUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
    },
  },
});

export const { loginUser, logoutUser, hydrateUser } = userSlice.actions;

export default userSlice.reducer;
