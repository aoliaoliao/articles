https://prettier.io/docs/en/integrating-with-linters.html 

http://eslint.cn/docs/user-guide/configuring 

https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint



>目标：ESLint ，Prettier和VsCode可以完美的配合，以既定的规则方便快速的格式化代码，同时修正简单的语法错误

### EsLint
`EsLint`的规则分为[两类](https://prettier.io/docs/en/comparison.html)。一类是格式化规则，例如`max-len, no-mixed-spaces-and-tabs, keyword-spacing, comma-style...`;另一类是语法规则，例如`no-unused-vars, no-extra-bind, no-implicit-globals, prefer-promise-reject-errors...`。对语法规则的校验也是`EsLint`最为作用的功能。

此外，`EsLint`还有一个作用是可以进行错误修正，比如语法上的，将 `var`修改为`const`, `==` 修改为`===`,也有格式上的，比如是否使用`分号`等等。
> 并不是所有的语法规则都可以被自动修复，EsLint可以修复的规则都具有**fixable**属性，同时提供了**fixer**修复方法，只有方法没有fixable属性也不会被修复，至于哪些规则具备这个属性，在EsLint官方网站上进行查询到时候可以看到。参考这里[如何提交一个EsLint规则](https://cn.eslint.org/docs/developer-guide/working-with-rules)

关于`EsLint`的规范，业界有许多成熟的规范框架，比如`eslint-config-airbnb`、`eslint-config-airbnb-base`等, 下载对应规范的npm包之后，可以在`.eslintrc.js`中配置使用
```js
module.exports = {
  extends: [
    'airbnb-base',
    'plugin:vue/essential',
    'plugin:prettier/recommended',
    'eslint:recommended'
  ],
  plugins: ['prettier'],
  rules: {
    'prettier/prettier': 'error'
  }
}
```
`extends`表示继承，其值可以是字符串或字符串数组，这些值代表的的规范将被应用于你的项目，当然，在属性`rules`中指定的规则具有更高的优先级，可以覆盖这些规范中的指定。

解释一下上述几个常规配置的含义：
- `airbnb-base`: 下载的npm包`eslint-config-airbnb-base`表示的规范，该规范会输出一个配置对象。当npm包名以`eslint-config-`开头时，可以将其省略。
- `plugin:vue/essential` 和 `plugin:prettier/recommended`: 下载的npm包`eslint-plugin-vue`表示的插件，当插件名称以`eslint-plugin-`开头的，也可以将其省略。`/essential`表示的是该插件支持的一个配置名称。一个插件可以有多个配置名称。
- `eslint:recommended`：启用EsLint的一系列核心规则。`recommended`表示推荐的。类似的还有`eslint:all`表示启动所安装eslint版本的所有的规则。

- 另外，eslint 也可以指定一个配置文件的路径，该文件应该输出一个配置对象。

`plugins`表示使用插件，但这里和`extends`是不同的，在`plugins`中指定的插件其中的所有规则都可以在`rules`中引用，然后对这引用的规则进行配置：格式如：`prettier/prettier`： `error`，表示对`eslint-plugin-pretter`插件中的`prettier`规则进行配置。

Eslint还有一些其他的[配置项](https://cn.eslint.org/docs/user-guide/configuring),这里做个简要记录：
```js
module.exports = {
  env: {    // 一个环境定义了一组预定义的全局变量
    browser: true,
    commonjs: true,
    es6: true,
    node: true
  },
  extends: [],  
  plugins: [],
  globals: {    // 指定项目中的一些全局变量，这样不会产生`no-undef`警告。
    Atomics: 'readonly',    // readonly 表示只读，不允许重写
    SharedArrayBuffer: 'writable' // writable 表示该全局变量支持重写
  },
  parserOptions: {  // 配置词法解析器
    parser: 'babel-eslint', //词法解析器使用babel-eslint，以更好的适配es6的新api
    ecmaVersion: 2018
  },
  rules: {
  }
}
```

### Prettier

`Prettier`的作用则主要是以强规则格式化代码，这里的规则侧重于代码格式而非语法， `Prettier`没有修正语法规则的功能。

虽然二者的侧重点不同，但还是有少许的重叠部分。比如在格式化代码的分号，缩进等。此时，如果二者的规则不一致，那就会出现冲突，同一段代码被两者来回修改，谁也通不过谁的关口。

当`EsLint`和`Prettier`配合出现冲突的时候，就是说明格式上有冲突了，这个时候有个大的规则就是以`Prettier`的规则为准，因为我们是在格式化代码，不是校验代码，在格式化上，`Prettier`毕竟更专业。

`prettier`的使用相对简单，只需要对它仅允许的几项做个配置就可以了，当然也可以完全不配置,仅使用默认值。
```
module.exports = {
  tabWidth: 2,
  semi: false,
  singleQuote: true,
  printWidth: 100, //一行的字符数，如果超过会进行换行，默认为100
  trailingComma: 'none' //是否使用尾逗号，有三个可选值"<none|es5|all>"
}

```

### 在VsCode中保存时发生了什么

在EsLint的官方网站中，如果要使自己配置的各种Lint规则生效，需要在[命令行](http://eslint.cn/docs/user-guide/command-line-interface)中使用指定的命令。比如`eslint file1.js file2.js`校验这两个js文件的语法。`eslint --fix file1.js file2.js`用于修正这两个文件的一些语法和格式错误。

同样的，`Prettier`也提供了[命令行](https://prettier.io/docs/en/cli.html)使用方式, 就像这样： `prettier --config ./my/.prettierrc --write ./my/file.js` 

`EsLint` 和 `Prettier` 作为一个完整的工具，提供这些命令行语法无可厚非，但我们在实际开发中，更多的是将这些工具提供的能力集成到我们的开发工具中。

VsCode借助于插件可以完美集成这些能力，分别下载`ESLint`和`Pretter`插件，然后在首选项中进行个性化配置， 这些配置将代替我们使用cli命令，使我们进行更快速的开发。

> 在VsCode中，用户可以设置**首选项（settings.json）**。首选项分为两个等级，一个是`用户`的，其修改应用于所有用该工具打开的项目，另一个是`工作区`, 其修改应用于本项目。

