import express, { Express } from 'express'
import userRoutes from './modules/users/user.routes'
import syncRoutes from './modules/sync/sync.routes';
import authRoutes from './modules/auth/auth.routes';
import cors from 'cors'

const app: Express = express()
const port: number = 3000

// CORS 配置
app.use(cors({
  origin: process.env.NODE_ENV === 'development' 
      ? ['http://localhost:5173', 'app://.*'] // 允许 Vite 开发服务器和 Electron 应用
      : '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true, // 允许发送身份凭证（cookies等）
  maxAge: 86400 // 预检请求缓存时间，单位秒
}));

app.use(express.json())
app.use('/api', userRoutes)
app.use('/api', syncRoutes);
app.use('/api', authRoutes);
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`)
})