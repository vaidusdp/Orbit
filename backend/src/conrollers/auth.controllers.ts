import { Request, response, Response } from "express";
import { asyncHandler } from "../utils/asycHandler.js";
import { loginUser, registerUser } from "../services/auth.services.js";
import { Result } from "pg";

const register = asyncHandler(async (req: Request, res: Response) => {
    const {name, email, password} = req.body;

    if(!name || !email || !password){
        return res.status(400).json({
            message: "Name, email and password are required"
        });
    }    

    const user = await registerUser({
        name,
        email, 
        password
    });

    return res.status(201).json({
        message: "User Registered Successfully",
        user,
    })
});

const login = asyncHandler(async (req: Request, res: Response) => {
    const {email, password} = req.body;

    if (!email || !password) {
        return res.status(400).json({
        message: "Email and password are required",
        });
    }

    const {
        user,
        accessToken,
        refreshToken,
    } = await loginUser({
        email,
        password,
    });

    const cookieOptions= {
        httoOnly: true,
        secure: process.env.NODE_ENV == "production",
        sameSite:
            process.env.NODE_ENV == "production" ? "none" : "lax"
    } as const;

    return res.status(200)
        .cookie(accessToken, cookieOptions)
        .cookie(refreshToken, cookieOptions)
        .json({
            message: "User Logged In Successfully",
            user,
            accessToken
    });
});

const getMe = asyncHandler((req: Request, res: Result) => {
    
})

export {
    register,
    login
}