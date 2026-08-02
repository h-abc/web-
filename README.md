# web-
世界杯赛事信息综合服务平台
Docker 启动命令
1. 确保已安装 Docker 和 Docker Compose
2. 在项目根目录执行：
   docker-compose up -d
3. 访问 https://h-abc.github.io/web-/
   
数据库与资源文件挂载说明
- 数据库文件：容器内 /app/data/worldcup.db
- 通过卷映射 ./data:/app/data 实现持久化，重启容器数据不丢失
- 前端静态资源（HTML/CSS/JS）内置在镜像中，无需额外挂载
- 球队和比赛数据在容器首次启动时自动写入数据库
