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

export const fetchUserDetails = async (userId: string): Promise<User> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/getUser`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    },
  );
  if (!response.ok) {
    throw new Error("Failed to fetch user details");
  }
  return response.json();
};
