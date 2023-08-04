import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    isLoggedIn: false,
    jwt: "",
    name: "",
    pic:" ",
    email: "",
    _id: "",
}

const authSlice = createSlice({
    name: "Auth",
    initialState,
    reducers: {
        login: (state, data) => {
            state.isLoggedIn = true;
            state.jwt = data.payload.jwt;
            state.name = data.payload.name;
            state.pic = data.payload.picture;
            state.email = data.payload.email;
            state._id = data.payload._id;
        },
        logout: (state) => {
            state.isLoggedIn = false;
            state.jwt = "";
            state.name = "";
            state.pic = "";
            state.email = "";  
            state._id = "";  
        }
    }
})

export default authSlice.reducer;

export const { login, logout } = authSlice.actions;