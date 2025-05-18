const express = require('express')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const db = require('./config/database') // 引入数据库配置
const app = express()
const user = express.Router()
const port = 3000

// 添加 JSON 解析中间件
app.use(express.json())

const JWT_SECRET = 'your-secret-key'

// 测试路由
user.get('/', (req, res) => {
  res.send('Hello World!')
})

// 注册路由
user.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body
    
    // 检查用户是否已存在
    const [users] = await db.execute(
      'SELECT * FROM users WHERE username = ?',
      [username]
    )
    
    if (users.length > 0) {
      return res.status(400).json({ message: '用户已存在' })
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10)
    
    // 保存用户
    await db.execute(
      'INSERT INTO users (username, password) VALUES (?, ?)',
      [username, hashedPassword]
    )

    res.status(201).json({ message: '注册成功' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: '服务器错误' })
  }
})

// 登录路由
user.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body
    
    // 查找用户
    const [users] = await db.execute(
      'SELECT * FROM users WHERE username = ?',
      [username]
    )
    
    if (users.length === 0) {
      return res.status(400).json({ message: '用户不存在' })
    }

    const user = users[0]

    // 验证密码
    const validPassword = await bcrypt.compare(password, user.password)
    if (!validPassword) {
      return res.status(400).json({ message: '密码错误' })
    }

    // 生成 JWT token
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: '1h' }
    )

    res.json({ token })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: '服务器错误' })
  }
})

// 获取所有用户
user.get('/users', async (req, res) => {
  try {
    const [users] = await db.execute(
      'SELECT id, username, created_at FROM users'
    )
    res.json(users)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: '服务器错误' })
  }
})

// 验证中间件
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ message: '未提供认证令牌' })
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: '令牌无效' })
    }
    req.user = user
    next()
  })
}

// 受保护的路由示例
user.get('/protected', authenticateToken, (req, res) => {
  res.json({ message: '这是受保护的内容', user: req.user })
})

app.use('/api', user)

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`)
})