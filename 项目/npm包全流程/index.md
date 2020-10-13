# 大纲
私有化仓库
新建，单测
项目内调试
编译发布
版本管理


# 私有化仓库

搭建私有化仓库是为了对公司的前端中台建设做好支撑，对公司内部的前端组件有更规范的管理，搭建私有化仓库的方法有好多种，国内大厂几乎都使用的`cnpm.org`.

先看一下CNPM是什么：
> cnpmjs.org: Private npm registry and web for Company. 
So cnpm is meaning: Company npm.

cnpm.org是一个NodeJs库，其作用是创建一个企业级的私有化npm仓库，对公司内部npm包提供完整的管理功能，此外还能同步npm的官方仓库( https://registry.npmjs.org/)，CNPM的架构图形象的说明了其功能：


![CNPM架构图](./images/cnpm-architect.png)


### 环境准备
私有化仓库部署在阿里云ESC，具体涉及到的物料有：
- [ ] centos ：7.6.1810
- [ ] mysql ：5.7.28
- [ ] 安装的**cnpm.org版本** : 2.19.4

这里需要注意一点，许多教程上建议我们直接从github上clone其仓库到服务器，但这可能会导致一个问题，GitHub上最新的版本也许并不稳定，会出现一系列问题。

我最初下载的版本是`cnpm.org 3.0.0-rc.36`, 但是这个版本的数据库语句有问题，导致新增的`token`表创建失败，所以我回滚到了`2.9.4`版本。

`git clone -b 2.19.4 https://github.com/cnpm/cnpmjs.org.git`


### 配置
当代码clone到服务器之后，对`/config/index.js`配置文件做一些必要的修改。

```javascript
 module.exports = { 
    enableCluster: true, // enable cluster mode
    enablePrivate: false, // enable private mode, only admin can publish, other user just can sync package from source npm
    database: {
	    db: 'cnpmjs_test',  // cnpm 数据库的名称
      host: '数据库所在机器的ip',
      port: 3306,
      username: 'aoliao', // 连接数据库时的姓名
      password: 'database pwd '  // 连接数据库时的密码
    },
    admins: {
      admin: 'admin@cnpmjs.org',  // 管理员账号和邮箱
    },
    scopes: [ '@cnpm','@aoliao' ],  // 该仓库允许的scope
    registryHost: "服务器IP:7001或域名", // 私有化仓库的地址
    syncModel: 'none'// 'none', 'all', 'exist'
  };  

```
对几个配置重点说一下：
`enablePrivate`：当值为true时，只允许管理员进行发布，其他任何人没有权限进行发布；当值为false时，任何人都可以发布包，但非管理员发布的包其名称要符合一定的规则，即必须带有允许的scope, 例如：`@aoliao/vuex`，对于管理员用户没有相关要求。

`registryHost`: 配置为仓库所在机器的套接字或直接使用域名。如果不配置，当下载私有化仓库中的私有包时会报404。

`syncModel`: 同步模式。`none`: 不进行同步，只管理用户上传的私有模块，公共模块直接从上游获取；`exist`: 只同步已经存在于数据库的模块；`all`: 定时同步所有源registry的模块


### 建立仓库

到这一步就比较轻松了

1. 根据上文配置，打开mysql服务，新建数据库`cnpmjs_test`
2. 下载cnpm.org所需的依赖包`npm i`
3. 完成之后，运行`npm run start`启动私有化仓库。


在客户端用浏览器访问`http://ip:7002`, 如果能够打开说明安装成功。记得开放服务器对应的端口。在阿里云上则是添加对应的安全组设置。

### 校验

校验时需要将客户端本地的仓库源切换到私有仓库的地址`http://ip:7001`, 这里推荐一个npm源的管理工具`nrm`。

全局安装:`nrm add aoliao http://ip:7001`
切换到私有仓库源：`nrm  use aoliao`

接下来可以进行校验，校验内容包括新增用户，用户登陆，发布，撤销发布，下载私有仓库包，下载公共仓库包等。

##### 新增和登陆
执行`npm adduser`,新增用户，在npm的用户管理逻辑中，新增一个用户，如果成功之后，则自动登陆。如果直接使用`npm login`，使用的是新账号，则自动注册并登陆。成功之后的结果如图所示：
![adduser](./images/adduser.png)


##### 发布 和 取消发布
客户端切换到将要发布的npm包的路径下，以vue-router的源码为例，执行`npm publish`将模块发布到私有仓库。

![publish_error](./images/publish_error.png)

发布之后发现出现了403错误，查看原因是，此刻我们使用的是非管理员登陆，所以需要对 vue-router 的package.json做个修改，将name添加指定的scope, `@aoliao/vue-router`，再次发布，发布成功。

![publish_success](./images/publish_success.png)

对于取消发布，系统是比较慎重的，即使是npm的发布者想要取消发布也未必能够成功。当这个包被其他包依赖了，当这个包的发布时间超过了24小时则肯定会取消失败的。这个时候最好使用管理员账号进行操作，执行命令：`npm unpublish @aoliao/vue-router@3.1.3 --force`

![unpublish_success](./images/unpublish_success.png)



##### 下载

发布成功之后，可以即刻从私有仓库进行下载，执行命令：`npm install @aoliao/vue-router`

![install_success](./images/install_success.png)


如果要下载私有仓库不存在的包，则系统会直接从上游进行下载，不会存在找不到下载资源的问题：

![install_npm_success](./images/install_npm_success.png)


# 新建NPM包

新建一个npm包，这件事可简单可复杂。

















































