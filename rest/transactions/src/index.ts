import express, { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import router from './router'

// Load environment variables
dotenv.config()

const app = express()
const PORT = parseInt(process.env.PORT || '3200', 10)

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/api', router)

// Basic health check route
app.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack)
    res.status(500).json({
        error: 'Internal Server Error',
        message:
            process.env.NODE_ENV === 'development' ? err.message : undefined,
    })
})

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})
