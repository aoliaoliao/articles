[rollup中文文档](https://www.rollupjs.com/)

[rollup官方文档](https://rollupjs.org/guide/en/)

# Rollup 和 Webpack

Rollup 是打包工具界的后起之秀，现在社区已经有很多知名项目在使用了，比如 React，Vue等两大头部项目。

为什么在Webpack的功能和生态已经非常丰富的场景下又杀出了一个Rollup呢？这两者有什么不同呢？

必须要说的是，Webpack起步早，功能丰富，一切皆JS的设计思想在构建复杂的SPA应用时功能非常强大。静态资源比如CSS文件，图片文件等可以实现依赖管理；代码分割和按需导入有着更好的交互体验，热加载功能在应用开发的过程中及其方便。


但正如电影场景中的人物那样，体量过大则不够灵活。Rollup相对来说就显得小巧了，其设计目的也是专注于工具项目的打包，也就是说其处理的大部分内容是JS文件，而且JS的内容都是基于最新的ES6基础上开发的，所以可以更好的使用其设计的Tree-Shaking功能，这一功能非常有吸引力。

>Rollup 已被许多主流的 JavaScript 库使用，也可用于构建绝大多数应用程序。但是 Rollup 还不支持一些特定的高级功能，尤其是用在构建一些应用程序的时候，特别是代码拆分和运行时态的动态导入 dynamic imports at runtime. 如果你的项目中更需要这些功能，那使用 Webpack可能更符合你的需求。


所以总结的来说：Rollup偏向应用于js库，webpack偏向应用于前端工程，UI库；如果你的应用场景中只是js代码，希望做ES转换，模块解析，可以使用Rollup。如果你的场景中涉及到css、html，涉及到复杂的代码拆分合并，建议使用webpack。
 
# Rollup 的入门配置和基础生态

相对来讲，Rollup的入门使用更简单一些，社区也有完善的中文官方文档。无论我写点什么，都不会比[官方](https://www.rollupjs.com/)更详细和权威了。但是官方对生态中涉及的插件着墨不多，我这里记录一些常用的插件吧。

[这里有一份官方维护的插件列表](https://github.com/rollup/plugins)

当然，还有许多其他插件，社区提供的，非常有用：

[rollup-plugin-vue](https://rollup-plugin-vue.vuejs.org/#what-does-rollup-plugin-vue-do), [rollup-plugin-typescript2](https://github.com/ezolenko/rollup-plugin-typescript2)


```json
"devDependencies": {
    "@rollup/plugin-image": "^2.0.5",
    "@rollup/plugin-typescript": "^4.1.1",
    "rollup": "^1.32.1",
    "rollup-plugin-babel": "^4.4.0",
    "rollup-plugin-cleaner": "^1.0.0",
    "rollup-plugin-commonjs": "^10.1.0",
    "rollup-plugin-node-builtins": "^2.1.2",
    "rollup-plugin-node-globals": "^1.4.0",
    "rollup-plugin-node-resolve": "^5.2.0",
    "rollup-plugin-replace": "^2.2.0",
    "rollup-plugin-scss": "^2.5.0",
    "rollup-plugin-size-snapshot": "^0.10.0",
    "rollup-plugin-terser": "^5.3.0",
    "rollup-plugin-typescript2": "^0.27.3",
    "rollup-plugin-vue": "^5.1.6"
  },


```
























