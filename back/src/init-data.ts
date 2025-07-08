// 在 back/src/ 下创建 init-data.ts
import { DataSource } from 'typeorm';
import { User } from './entity/user.entity';
import { Activity } from './entity/activity.entity';
import { Comment } from './entity/comment.entity';

// 添加延迟函数
function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function initTestData() {
  // 等待一下确保没有其他进程占用数据库
  console.log('等待数据库就绪...');
  await delay(2000);

  // 创建数据源连接
  const dataSource = new DataSource({
    type: 'sqlite',
    database: 'db.sqlite',
    entities: [User, Activity, Comment], // 添加Comment实体
    synchronize: true,
    extra: {
      busyTimeout: 30000, // 30秒超时
    },
  });

  try {
    // 连接数据库
    await dataSource.initialize();
    console.log('数据库连接成功！');

    // 获取 User 仓库
    const userRepository = dataSource.getRepository(User);

    // 检查是否已存在测试数据
    const existingUser = await userRepository.findOne({
      where: { username: 'admin' },
    });
    if (existingUser) {
      console.log('测试数据已存在，跳过初始化');
      return;
    }

    // 添加测试用户
    const testUsers = [
      { username: 'admin', password: '123456' },
      { username: 'testuser', password: 'testpass' },
      { username: 'user1', password: 'password1' },
    ];

    for (const userData of testUsers) {
      const user = userRepository.create(userData);
      await userRepository.save(user);
      console.log(`创建用户: ${userData.username}`);
    }

    console.log('测试数据初始化完成！');
  } catch (error) {
    console.error('初始化数据时出错:', error);
  } finally {
    // 关闭数据库连接
    await dataSource.destroy();
  }
}

// 执行初始化
initTestData();
