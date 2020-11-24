# scripts
npm 如何处理`scripts`字段？

-------

## Description 描述
`package.json`文件中的`scripts`属性支持多种内置的脚本命令以及他们预设的生命周期事件，当然也支持多种自定义的脚本。这些脚本命令都可以通过运行`npm run-script <stage>` 或简写为 `npm run <stage>`来执行。

和执行脚本名称匹配的`pre<script>`和`post<script>`命令也将分别在目标脚本执行前和执行后被触发（例如：`premyscirpt`, `myscript`, `postmyscirpt`）。`dependencies`中指定的依赖项中的命令可以通过`npm explore <pkg> -- npm run <stage>`来执行。
 

## Pre & Post Scripts

要为package.json的“scripts”部分中定义的任何脚本创建“pre”或“post”脚本，只需在它们的开头添加“ pre”或“ post”. 

pre 命令会在目标命令之前执行，post命令会在目标命令之后执行。

```json
{
  "scripts": {
    "precompress": "{{ executes BEFORE the `compress` script }}",
    "compress": "{{ run command to compress files }}",
    "postcompress": "{{ executes AFTER `compress` script }}"
  }
}

```

## Life Cycle Scripts 生命周期脚本

有一些特殊的生命周期脚本仅在某些情况下发生。这些脚本是除“pre”和“ post”脚本之外发生的
- `prepare`, `prepublish`, `prepubishOnly`, `prepack`,  `postpack`

### prepare 
- Runs BEFORE the package is packed
- Runs BEFORE the package is published
- Runs on local npm install without any arguments
- Run AFTER prepublish, but BEFORE prepublishOnly
- NOTE: If a package being installed through git contains a prepare script, its dependencies and devDependencies will be installed, and the prepare script will be run, before the package is packaged and installed. 
- 在`npm pack`命令之前执行
- 在`npm publish`命令之前执行
- 在本地执行`npm install`且不带参数的时候执行
- 在`npm prepublish` 之后执行，但在`npm prepublishOnly`之前执行
- **注意：**如果通过git安装的软件包包含prepare脚本，则在打包和安装软件包之前，将安装dependencies和devDependencies，并运行prepare脚本。

### prepublish （将弃用）

和 prepare 一样

### prepublishOnly
- Runs BEFORE the package is prepared and packed, ONLY on npm publish. 

- 当执行`npm publish`的时候，会在`npm prepare` 和 `npm pack`之前执行

### prepack
- Runs BEFORE a tarball is packed (on "npm pack", "npm publish", and when installing a git dependencies).

- 在打包tarball之前运行（在“ npm pack”，“ npm publish”上以及安装git依赖项时）。


### postpack

- Runs AFTER the tarball has been generated and moved to its final destination.

- 在生成tarball并将其移动到其最终目的地之后运行


## Life Cycle Operation Order 生命周期操作顺序

npm publish
- prepublishOnly
- prepare
- prepublish
- publish
- postpublish


npm pack
- prepack
- postpack

npm install
- preinstall
- install
- postinstall

  也会触发
- prepublish（当在本地执行的时候）
- prepare （当在本地执行的时候）

npm start

  该命令可以视为`npm run start`的简写

- prestart
- start
- poststart

## Default Values (默认值)

npm will default some script values based on package contents.

npm将基于包内容默认一些脚本值。

- `start`: `node server.js`

  如果软件包根目录中有一个server.js文件，则`npm start`将默认执行`node server.js`。

- `install`: `node-gyp rebuild`

  如果软件包根目录中有一个binding.gyp文件，并且您尚未定义自己的`install`或`preinstall`脚本，则npm将默认install命令使用node-gyp进行编译。


## User 用户

如果是root管理员执行npm命令，则它将uid更改为用户帐户或用户配置指定的uid，默认情况下为none。设置unsafe-perm标志可以使用root特权运行脚本。

## Environment 运行环境

script 命令运行在一个环境中运行，在该环境中，可以获得许多有关npm设置和进程当前状态的信息。

### path

如果你的脚本中依赖了一个定义过可执行脚本的模块，那么这个可执行文件将会被添加到`PATH`变量中以方便直接运行这个可执行脚本。例如：
```json
{ 
  "name" : "test", 
  "version": "1.2.5",
  "dependencies" : { 
    "cross-env": "^5.2.0",
  }, 
  "scripts": { 
    "dev": "cross-env test=true npm run dev",
  } 
}
```
这样之所以在执行`npm run dev`时可以执行`cross-env`命令是因为在npm install时该脚本已被导出到`node_modules/.bin`目录中。


### package.json vars 

`package.json`文件中的字段会被添加上`npm_package_`的前缀。以上面的片段为例，当你在执行脚本命令（例如dev）的时候，可以获取到一个值为`test`，名为`npm_package_name`的变量，也可以获取到一个值为`1.2.5`，名为`npm_package_version`的变量。对于其他字段也是一样的。

### configuration

npm所有的配置参数在运行环境中会被添加上`npm_config_`的前缀。例如，你可以通过`npm_config_root`查看当前您有效的根配置.

### Special: package.json "config" object 

package.json 中的config属性是一个对象，该对象中的属性允许在shell中通过`<name>[@<version>]:<key>`格式的参数进行覆盖。例如：
```json
{
  "name": "foo",
  "config" : { 
    "port" : "8080" 
  }, 
  "scripts" : { 
    "start" : "node server.js" 
  } 
}

```
在`server.js`文件中有这样的用法：
```javascript
http.createServer(...).listen(process.env.npm_package_config_port)

```
此时，我们可以重写port值：
```shell
npm config set foo:port 80
```

### current lifecycle event 当前生命周期事件

npm 会将当前正在执行的生命周期的名称存放在环境变量`npm_lifecycle_event`中。通过这个变量，我们可以在同一个脚本文件中执行不同的生命周期事件。这样的一个好处是我们在package.json中的配置可以更简单一些，不需要为每一个script都对应一个js文件。例如：
```json
{
  "name": "npm-lifecycle-events",
  "version": "0.0.1",
  "main": "example.js",
  "scripts": {
    "pretest": "node test.js",
    "test": "node test.js",
    "posttest": "node test.js"
  }, 
}

```

这样在`test.js`文件中，我们可以这样写：

```javascript
const TARGET = process.env.npm_lifecycle_event;

if (TARGET === 'test') {
  console.log(`Running the test task!`);
}

if (TARGET === 'pretest') {
  console.log(`Running the pretest task!`);
}

if (TARGET === 'posttest') {
  console.log(`Running the posttest task!`);
}

```


## Hook Scripts 

如果你想要为根目录下安装的所有包，在特定生命周期事件中运行特定脚本，可以使用hook script。

将一个可执行文件放在`node_modules\.hooks\{eventname}`处，在根目录中安装的所有软件包的生命周期中都经过该点时，它将为所有软件包运行。


## Best Practices 最佳实践

- Don't exit with a non-zero error code unless you really mean it. Except for uninstall scripts, this will cause the npm action to fail, and potentially be rolled back. If the failure is minor or only will prevent some optional features, then it's better to just print a warning and exit successfully.

- Try not to use scripts to do what npm can do for you. Read through package.json to see all the things that you can specify and enable by simply describing your package appropriately. In general, this will lead to a more robust and consistent state.

- Inspect the env to determine where to put things. For instance, if the npm_config_binroot environment variable is set to /home/user/bin, then don't try to install executables into /usr/local/bin. The user probably set it up that way for a reason.

- Don't prefix your script commands with "sudo". If root permissions are required for some reason, then it'll fail with that error, and the user will sudo the npm command in question.

- Don't use install. Use a .gyp file for compilation, and prepublish for anything else. You should almost never have to explicitly set a preinstall or install script. If you are doing this, please consider if there is another option. The only valid use of install or preinstall scripts is for compilation which must be done on the target architecture.
----
- 不要以非零错误代码退出，除非您确实这样。除卸载脚本外，这将导致npm操作失败，并有可能被回滚。如果故障很小，或者只会阻止某些可选功能，那么最好打印警告并成功退出。

- 可以通过npm实现的功能尽量不要使用脚本文件完成。仔细阅读package.json，熟悉可以通过相关配置就实现的功能，通常，这将导致更健壮和一致的状态。

- 检查环境变量，确定文件被放置在合适的位置。例如，如果`npm_config_binroot`环境变量设置为`/home /user/bin`，则不要尝试将可执行文件安装到`/usr/local/bin`。用户可能出于某种原因以这种方式进行设置。

- 不要在脚本命令前加上`sudo`前缀。如果出于某种原因需要root权限，系统会进行合适的错误提示。这样也可以避免用户对有问题的npm命令进行sudo。

- 使用`.gyp`文件进行编译和发布操作，不要使用`install`。您几乎永远不必显式设置`preinstall`或`install`脚本。如果执行此操作，请考虑是否还有其他选择。唯一有效使用`preinstall`或`install`的地方是必须在目标体系结构上进行编译操作。













