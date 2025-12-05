import type { User } from "../redux/types"

export interface LoginPayload{
    email: string,
    password: string
}

export interface LoginResponse{
    accessToken: string,
    user: User,
}

export const TOKEN_KEY = "Infobase-Token";

