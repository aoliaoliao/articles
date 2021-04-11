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
- [x] centos ：7.6.1810
- [x] mysql ：5.7.28
- [x] 安装的**cnpm.org版本** : 2.19.4

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


package.lock.json

先介绍几个`package.json`文件中的配置

### files

 files字段的值是一个数组，标明了项目打包之后最终包括的文件内容。数组中的值支持glob语法。 
 如果你在里面放一个文件夹名，那么这个文件夹中的所有文件都会被包含进项目中(除非是那些在其他规则中被忽略的文件)。


### main

`main`字段指明了程序的入口点。例如，如果包名为`foo`，用户install之后，通过`require('foo')`使用该包时返回的即是`main`字段对应的文件所export的对象。

### module

module 目前还是一个提案，并不是 package.json 文件标准格式的一部分。但它极有可能会成为标准的一部分，因为它目前已经是事实上的标准了（最早由 Rollup提出，Webpack也已支持）。

该字段的功能和main是一致的，其目的是为了使一个使用ES6模块的包可以更好的使用 Tree Shaking 机制。

那么自然的 main 和 module 的侧重点将有所不同：
- main 字段的值会指向我们使用 CommonJS 规范编译的文件地址
- module 字段的值会指向我们使用 ES6 模块规范编译的文件地址

在支持 ES6 模块的地方会优先使用 module 字段。

### typings

该字段是针对使用 TypeScript 语言的包来使用的，其值是编译后的 “类型声明文件” 的地址。



 
### browser

如果该模块是运行在客户端（浏览器）中，则应使用`browser`替代`main`。该字段将提示用户，这个模块里所依赖的一些对象在Node环境下可能不存在，例如window对象。

### bin

许多软件包都有一个或多个要安装到环境变量`PATH`中的可执行文件。 npm 中的`bin`字段可以轻易的实现这个需求。

bin 字段应该是一个对象，key是 命令名，value 是要执行的文件。如果是全局安装，npm会创建一个到`prefix/bin`的软链接，如果是本地安装，npm会创建一个到`./node_modules/.bin/`的软链接。

```json
{ 
  "bin" : { 
    "myapp" : "./cli.js" 
    } 
  }
}
// myapp 
```

如果只有一个可执行文件，那么bin的值可以设置为字符串，对应的命令名就是该模块的name
```json
{ 
  "name": "myapp", 
  "bin": "./path/to/program" 
}
// myapp
```
### repository

指定代码所在的位置。
```json
"repository": {
  "type" : "git",
  "url" : "https://github.com/npm/cli.git"
}
"repository": {
  "type" : "svn",
  "url" : "https://v8.googlecode.com/svn/trunk/"
}
```
如果这个package是属于 monorepo 管理方式，可能还需要指出其在仓库中的相对位置：

```json
"repository": {
  "type" : "git",
  "url" : "https://github.com/facebook/react.git",
  "directory": "packages/react-dom"
}
```

### scripts

提供一些自定义的命令。可以通过 `npm run`的方式使用

### private

如果在package.json中设置`private`为true，则npm将永远不会将其发布到仓库中。






# 项目内调试

在公司内部开发的模块，尤其是业务模块少不了集成到项目中进行开发调试，我们的需求是模块文件的修改效果可以直接体现在业务项目中。

借助`npm link`可以帮助我们实现这个需求。

```javascript
npm link [<@scope>/]<pkg>[@<version>]
```

1. 首先`cd`进入到模块文件所在的文件夹，执行`npm link` 将模块连接到全局。

2. 然后`cd`进入到项目文件所在的文件夹，执行 `npm link 模块文件名`, 这样模块文件就被安装到项目文件中了，在`node_modules`文件夹中可以查看到该模块文件。

通过命令`npm root -g`可以查询到全局npm存放在`C:\Program Files\nodejs\node_modules`路径下，在该路径中可以查看到所有的全局npm包。`npm link` 指令即是将未发布的模块放到了该路径下。在Windows中查看的话，会发现这个文件夹上有一个箭头，但注意，这里不是一个快捷方式，而是一个软链接。

![npmlink-global](./images/npmlink-global.png)

在项目文件的node_modules中查看目标模块，也可以看到这同样是一个软链接：

![npmlink-local](./images/npmlink-local.png)

通过连续两个软链接，我们在项目的node_models中使用的模块，实际上就是我们本地正在开发的包文件。通过这种方式实现了模块项目更改的效果直接体现在我们的业务项目文件中。

### 模块文件的watch

监听文件变化，实时进行编译（该方式非最优解，有待考证）

 




# 版本管理

### 版本规范标准semver

什么是semver? 这是一个语义化的包管理规范，现在社区发布NPM包都采用这种规范, [官网在这里](https://semver.org/lang/zh-CN/)

规范规定，一个标准的版本号应该是这样的：**主版本号·次版本号·修订号**

- 主版本号(major)：当你做了不兼容的API 修改
- 次版本号(minor)：当你做了向下兼容的功能性新增
- 修订号(patch)：当你做了向下兼容的问题修正

除了标准的版本格式之外，出于某种原因，当系统并非处于一个非常稳定的状态或者说功能非常全面的状态时，需要发布一个先行版本，这个时候需要在标准的版本号上加一点点改动：
- 内部版本（`alpha`）
- 公测版本（`beta`）
- 正式版本的候选版本（`rc`）: rc 即 `release candiate`



我们从一些知名库的版本记录中可以看到这个标准的应用，本地执行
```bash
npm view vue versions
```
可以看到VUE所有的版本记录，懒得截图了，粘贴几个例子看看吧：

`2.6.12`, `3.0.0-alpha.0`, `3.0.0-alpha.1`, `3.0.0-beta.1`, `3.0.0-rc.1`, `3.0.0`, `3.0.1`

##### FAQ

semver做为一个语义化的包版本规范，**版本号的改变具备重要的意义**，但每次版本号的更新还是人为控制的，我们不能说100%不会出问题。当出问题的时候应该怎么办？

**Q**: 如果我们将一个主版本变更当作一个次版本变更发布了该如何处理？

**A**: 即使是这种情况，也不能去修改已发行的版本。重新发行一个新的次版本号来更正这个问题并且恢复向下兼容。可以的话，将有问题的版本号记录到文件中，告诉使用者问题所在，让他们能够意识到这是有问题的版本。

**Q**: 如果即使是最小但不向下兼容的改变都需要产生新的主版本号，岂不是很快就达到 42.0.0 版？

**A**: 这是开发的责任感和前瞻性的问题。不兼容的改变不应该轻易被加入到有许多依赖代码的软件中。升级所付出的代价可能是巨大的。要递增主版本号来发行不兼容的改版，意味着你必须为这些改变所带来的影响深思熟虑，并且评估所涉及的成本及效益比。 



##### 版本发布最佳实践
- 首次对外正式发布版本的时候，版本号定为`1.0.0`
- 对一个包的任何修改都必须以新版本号发行
- 版本号根据代码改动情况，严格按照`major·minor·patch`格式
- 版本号只能递增，不能降级
- 发布重大版本或版本改动较大时，先发布**先行版本**



### Git 提交规范

Git 做为开发过程中一个高频操作，一个纯人工操作，最好也是要遵守一定的规范。践行一个标准的规范可以给我们提供不少的方便：

- 规范的提交记录可以直接从commit 生成Change log(发布时用于说明版本差异)

- 触发构建和部署流程

- 基于提交的类型，自动决定语义化的版本变更。

社区现在最流行的规范是[约定式提交规范Conventional Commits](https://www.conventionalcommits.org/zh-hans/v1.0.0-beta.4/), 其脱胎于`Angular Git 提交 规范`。

##### 规范格式

每次提交的Commit Message格式应该包括三个部分：Header, Body, Footer。格式应该符合下述要求：

```bash
<type>[(scope)]: <subject>
// 空一行
<body>
// 空一行
<footer>
```

Header部分是必须的，Body 和 Footer 可以省略。一般来说，每次提交都只包含 Header 部分。一个高频操作的规范如果过于严格和繁琐，注定不会流行起来。

先简略说一下 Body 和 Footer。

Body 是对本次commit 的详细描述，可以分成多行提交。

Footer 一般情况下可以省略，但是当出现在这两种情况时必须出现，

1）当前提交出现不兼容变动。Footer部分必须以`BREAKING CHANGE`开头，后接具体内容。

2）关闭Issue时。如果当前commit针对仓库中的某个Issue，那么Footer应该是`Close #123, #234`这样的格式。

详细讲一下 Header。

Header部分只有一行，包括三个部分：`type`（必须）, `(scope)`（可选）, `subject`（必须）。

- type 用于说明本次commit的类别。它的值应该在一个枚举中选择
- scope 用于说明本次commit的影响范围，只要是能让本项目的人员理解就可以
- subject 是commit目的的简短描述

types值的类型随着规范的发展可能会有修改，截至到笔者写作时，Conventional 规定的[完整的规范有这些](./assets/commit-type.json) 。

 当然，如果项目需要，我们也可以自定义一套我们自己的提交规范，就像 Conventional 一样， 在这套规范中，除了`feat` 和 `fix` ，我们可以定义自己需要的type。

type 枚举值常用的有：
1. feat： 新功能
2. fix: bug修复
3. docs: 文档或注释的变动
4. style: 代码编码格式的变动，不是css的变动
5. refactor: 重构
6. test： 测试文件的改动
7. chore: 构建过程或辅助工具的变动 


##### Git规范和SemVer的关系

git约定的这个规范和 SemVer 有什么关联呢？关系就是我们可以借助每次git提交的规范自动维护语义化版本号。

fix 类型提交应当对应到 `PATCH` 版本。feat 类型提交应该对应到 `MINOR` 版本。带有 BREAKING CHANGE 的提交不管类型如何，都应该对应到 `MAJOR` 版本。


在项目开发过程中，经常会有这样的疑惑，**如果提交符合多种类型我该如何操作？** 官方给出的回答是：回退并尽可能创建多次提交。约定式提交的好处之一是能够促使我们做出更有组织的提交和 PR。

如果我不小心使用了错误的提交类型，该怎么办呢？当你使用了在规范中但错误的类型时，例如将 feat 写成了 fix
在合并或发布这个错误之前，我们建议使用 git rebase -i 来编辑提交历史。而在发布之后，根据你使用的工具和流程不同，会有不同的清理方案。参考上一节对错误版本号的处理。

##### Git规范约束工具之 commitizen

[commitizen](https://github.com/commitizen/cz-cli)是一个提交日志工具，辅助开发者使用提交规则。它本身是支持多种不同的提交规范的，只需要安装和配置不同的适配器。

本文自然以 Conventional 为例，讲解一下具体如何使用。

```bash
// 首先全局安装 commitizen
npm install commitizen -g

// 在项目中配置 Conventional 规范
commitizen init cz-conventional-changelog --save-dev --save-exact
```
配置完成之后，以后每次提交可以使用`git cz` 代替`git commit`。 `git cz` 会有一个交互式界面辅助进行符合规范的提交。

![commitizen](./images/commitizen.png)


##### Git规范约束工具之 CommitLint

每次使用交互界面提交效率其实并不高，所以社区给出了另一种方案[commitlint](https://github.com/conventional-changelog/commitlint)， 看名字也能看出来是一种Lint检查。它通过校验每次提交的内容是否符合格式来判断是否放行本次提交。

```bash
// 本地安装命令行工具
npm install @commitlint/cli -D

// 本地安装Conventional配置
npm install @commitlint/config-conventional -D

```

commitlint做为一个命令行工具，具体的配置可以查看[这里](https://commitlint.js.org/#/reference-cli)


除了 Conventional 规范，还有下列提交规范可以选，这些规范分别使用于不同的场景：
@commitlint/config-angular
@commitlint/config-lerna-scopes
@commitlint/config-patternplate
conventional-changelog-lint-config-atom
conventional-changelog-lint-config-canonical
commitlint-config-jira

安装对应的npm之后，在项目根目录下新建`commitlint.config.js`文件，文件内容：
```javascript
module.exports = {extends: ['@commitlint/config-conventional']};
```
或者在根目录下的`package.json`文件内，新建字段：
```json
{
  "commitlint": {
    "extends": [
      "@commitlint/config-conventional"
    ]
  }
}
```

安装完commitlint之后，还需要一个工具：[husky](https://docs.breword.com/typicode-husky)

```shell
npm install husky -D

```
安装husky之后会在项目的`.git/hooks`目录下生成所有的hook脚本。
![husky](./images/husky.png)

在`package.json`中配置对应的钩子之后，项目在执行git操作之时会触发对应钩子的脚本

```json
{
  "husky": {
    "hooks": {
        "commit-msg": "commitlint -E HUSKY_GIT_PARAMS"
    } 
  }
}

```
`HUSKY_GIT_PARAMS` 是husky定义的环境变量。它指向路径`.git/COMMIT_EDITMSG` 代表最后一次提交时输入的信息。

### 版本管理工具lerna

参考文章：
[手摸手教你玩转 Lerna](http://blog.runningcoder.me/2018/08/17/learning-lerna/)
[lerna 中文文档](https://github.com/minhuaF/blog/issues/2)
[lerna 官方文档](https://github.com/lerna/lerna)

什么是lerna ?

> Lerna is a tool that optimizes the workflow around managing multi-package
repositories with git and npm.

[lerna](https://github.com/lerna/lerna) 是一种工具，用于优化使用git和npm管理多包存储库的工作流程。

##### Monorepo VS Multirepo

Monorepo 指单体式仓库，是指把所有可以发布的包都放到一个项目中进行管理，例如Babel。

Multirepo 指多体式仓库，是指每一个可以发布的包都是一个单独的项目，例如webpack。

二者的优缺点都比较明显。在公司的一个部门内，基于业务关系而划分的各种模块一般比较适用 Monorepo 


##### lerna 的使用场景

lerna的重心是用于多包管理。多包是指在一个项目中有N个可以独立发布到NPM仓库的NPM包，

##### lerna 可以做什么
lerna 可以通过脚本命令做很多事情，但在此之前要补充一个前置知识点：[NPM 脚本的生命周期](./npm中scripts翻译。md)

lerna 中主要的命令是这两个：
```shell
lerna bootstrap 
lerna publish
```

`lerna bootstrap` 用于引导目前Lerna库的所有package，安装它们全部的依赖关系并连接任何相互交叉依赖的关系。

当执行该命令的时候，将依次执行下列步骤：
1. 在每一个包的路径下面执行 `npm install`，为每个包安装其所有的外部依赖项；
2. 如果该项目中的各个包有相互依赖的关系，为这些依赖关系建立软链接`symlink`；
3. 在每一个包的路径下面执行`npm run prepublish`, 除非这个包被参数`--ignore-prepublish` 指定要忽略。
4. 在每一个包的路径下面执行`npm run prepare`.

`lerna publish` 会把任何一个有变更的package发布

当执行该命令的时候，将执行以下操作中的一个：

- 发布自上一版本以来已更新的软件包（在后台调用`lerna version`命令）
- 发布在当前提交中打了tag的包（`from-git`）
- 发布在远程仓库中不存在该版本的最新提交的npm包（`from-package`）
- 发布在上一次提交中更新的未版本化的“canary”版本的软件包（及其依赖）。

> Lerna will never publish packages which are marked as private ("private": true in the package.json).

在所有发布操作期间，将在根目录和每个包中调用适当的生命周期脚本

--canary
该参数允许以一个更细粒度的方式发布package。在发布到npm之前，它将通过获取当前版本，将其更改为下一个次要版本(minor), 并添加指定的元后缀(默认是`alpha`)和`git sha`来生成一个新版本号。

该参数默认升级“修订号”这一级别的版本号。当添加值`major`或`minor`时将修改对应的主版本号和次版本号级别

```shell
lerna publish --canary
# 1.0.0 => 1.0.1-alpha.0+${SHA} of packages changed since the previous commit
# 随后发布的 canary 版本，版本号将是 1.0.1-alpha.1+${SHA}。

# 添加 major 值，版本号1.0.0 => 2.0.0-alpha.0+${SHA}
lerna publish --canary major

# 添加 minor 值，版本号1.0.0 => 1.1.0-alpha.0+${SHA}
lerna publish --canary minor

```

--preid 

该选项和`lerna version`中的用法不同，该选项仅仅能结合`--canary`一起适用，用于指定修改canary版本的标识符，可以将默认的`alpha`修改为指定的值。
```shell
lerna publish --canary --preid beta
# 1.0.0 => 1.0.1-beta.0+${SHA} 

# 添加 major 值，版本号1.0.0 => 2.0.0-beta.0+${SHA}
lerna publish --canary major --preid beta

# 添加 minor 值，版本号1.0.0 => 1.1.0-beta.0+${SHA}
lerna publish --canary minor --preid beta

```

`--contents <dir>`
要发布的子目录。必须应用于所有包，并且必须包含package.json文件。程序包生命周期仍将在原始的package目录中运行。您可以尝试使用这些生命周期之一（prepare，prepublishOnly或prepack）来创建子目录。

如果您从事不必要的复杂发布，这将很有用。

注意：在`postpublish`钩子中删除掉生成的子目录

```shell
lerna publish --contents dist 

```

`--dist-tag <tag>`

`dist-tag`是npm中的一个概念，是指为一些特殊的包版本添加指定的特殊标记（tag）,当install的时候可以直接通过这个tag来下载。

lerna 通过这个选线也可以在发布的时候直接指定一个dist-tag, 如果不指定，默认值是`latest`。

发布成功之后可以通过命令`npm dist-tag ls [<pkg>]`查看：
```shell
npm dist-tag ls @aoliao/vue

latest: 1.0.3
next: 1.0.5
```


##### Per-Package Configuration 每个包的配置

A leaf package can be configured with special publishConfig that in certain circumstances changes the behavior of lerna publish.

在每一个子包的package.json中可以使用`publishConfig`配置项，该配置项在某些情况下将更新`lerna publish`的行为。

`publishConfig.access`

如果想要发布一个`scope package`，必须设置该选项。该选项有两个值：`public` 和 `restricted`。

public 表示发布的 scope package 可以被独立的下载使用。对于所有的 unscope package, access 的值永远都是 public

- 在lerna中，如果设置了该选项，但对应的包又不是 scope package, 那么会报一个失败的错误。

`publishConfig.registry`

如果在子包中设置了该选项，该子包会被单独publish到这个registry

`publishConfig.directory`

这个非标准字段允许自定义该包将被publish的子目录，子目录是相对于该包的根目录。全局配置的`--content` 的所有其他警告对该配置也适用。









##### lerna 如何使用

[lerna version](https://github.com/lerna/lerna/tree/master/commands/version#lernaversion)


[npm script life-cycle](https://docs.npmjs.com/cli/v6/using-npm/scripts#life-cycle-scripts)

[上传指定的文件](https://github.com/lerna/lerna/issues/1282#issuecomment-368120903)
























