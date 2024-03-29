import { createSlice } from "@reduxjs/toolkit";

const notificationsSlice = createSlice({
  name: "notifications",
  initialState: { latestNotifications: [] },
  reducers: {
    setNotifications: (state, action) => {
      state.latestNotifications = action.payload;
      console.log(state.latestNotifications);
    },
  },
});

export const { setNotifications } = notificationsSlice.actions;

export default notificationsSlice.reducer;
