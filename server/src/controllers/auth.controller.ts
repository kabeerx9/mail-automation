import { Request, Response } from 'express';
import config from '../config';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'

interface User {
    id: string;
    name: string;
    email: string;
    password: string;
}

export class AuthController {
    private users : User[] = []

  register = async (req: Request, res: Response) => {
    const { name, email, password } = req.body;

    if(!email || !password){
        return res.status(400).json({
            success: false,
            message: 'Email and password are required'
        })
    }

    // check if user already exists
    if(this.users.find((user: User) => user.email === email)){
        return res.status(400).json({
            success: false,
            message: 'User already exists'
        })
    }


    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser : User = {
        id: Date.now().toString(),
        name,
        email,
        password: hashedPassword
    }

    this.users.push(newUser);

    // create a token

    const token = jwt.sign({ id: newUser.id, email: newUser.email }, config.jwt_secret, { expiresIn: '1h' });

    res.status(201).json({
        success: true,
        message: 'User registered successfully',
        token
    })
    console.log(this.users)
  }

  login = async (req : Request , res: Response)=>{
    const { email, password } = req.body;

    const user = this.users.find((user: User) => user.email === email);

    if (!user) {
        return res.status(401).json({
            success: false,
            message: 'User not found'
        })
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        return res.status(401).json({
            success: false,
            message: 'Invalid credentials'
        })
    }

    const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, config.jwt_secret, { expiresIn: '1h' });

    res.status(200).json({
        success: true,
        message: 'Login successful',
        token
    })

  }

  getStatus = async (req: Request, res: Response) => {
    res.status(200).json({
        success: true,
        message: 'Auth service is running'
    })
  }

  checkToken = async (req: Request, res: Response) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ success: false, message: 'Token is required' });
    }
    try {
        const decoded = jwt.verify(token, config.jwt_secret);
        res.status(200).json({ success: true, message: 'Token is valid', decoded });
    } catch (error) {
        res.status(401).json({ success: false, message: 'Token is invalid', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }
}
