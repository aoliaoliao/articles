`Jest`是一款上手比较快的前端测试框架，提供了丰富的Mock方法，断言方法，而且能配合`webpack`, `babel`, `ts`等一起使用，不用担心在一个老旧系统中会有水土不服的现象。

## Jest文档概览
在[Jest的官方文档](https://jestjs.io/docs/en/api)中，对Jest的使用主要分为了6大部分：

1. Globals: 在Jest的测试文件中可以全局使用的一些方法，无需手工导入。`beforeEach`, `describe`, `test`, `test.only()`等等

2. Expect： Jest提供的一些断言方法，非常丰富。`expect`, `.not`, `.toBe` `.toHaveBeenCalled` `.toEqual` `.toMatch`等等。

3. Mock Functions: 这一部分用来说明一个mock方法所具备的属性，比如存储每次调用情况的数据`mockFn.mock.calls`,模拟异步方法的返回值`mockFn.mockResolvedValue`等等。

4. The Jest Object：每个测试文件中都内置一个名为`Jest`的对象，Jest提供了许多Mock方法，可以对几乎任何内容（例如对象，方法，模块等等）进行mock，Mock在单测中非常重要，在Vue项目中则**至关重要**。

5. Configuring Jest：Jest虽说是号称零配置使用，但还是提供了丰富的配置项，通过这些配置项我们可以指定测试范围，可以和`webpack`, `Babel`, `TypeScript`更好的配合，可以输出测试覆盖率等等。

6. Jest Cli Options：Jest的命令行工具配置，通过这一部分的参数指定Jest的配置文件，是否启动监听，缓存等等。


前4部分主要是在具体的测试文件中使用，5，6部分是配置信息，要想在项目中将单测文件运行起来，必须先熟悉这两部分讲的内容。


## Jest的命令行参数配置

先说`Jest Cli Options`。 在一个项目中，通过命令行启动不太方便，而且在一个老旧项目中，虽然单测模块的逻辑比较简单，但最好还是可以支持打断点在前期进行辅助。所以在VsCode 中配置lanch文件，以便快速启动和方便断点测试。

```json
{
    "name": "Jest Debug File",
    "type": "node",
    "request": "launch", 
    "program": "${workspaceRoot}/node_modules/jest/bin/jest",
    "stopOnEntry": false,
    /**
    * 配置 Jest Cli Options 。
    * --config: Jest配置文件的地址
    * --coverage: 手机覆盖率信息
    * --watch: 启动测试文件的监听模式
    * fileBasename: 指定本次运行要测试的文件， 如果不指定将运行所有的测试文件
    */
    "args": ["--config=${workspaceRoot}/test/unit/jest.conf.js", "--coverage", "--watch" "${fileBasename}" ],
    "runtimeArgs": [ 
    ],
    "cwd": "${workspaceRoot}",
    "sourceMaps": true,
    "console": "integratedTerminal"
  }

```

## Jest的配置信息

先上一个Jest的配置，这些配置中的 `rootDir`， `moduleFileExtensions`, `moduleNameMapper`, `transform` 配置项和webpack的保持一致是测试文件能够运行起来的基础。

比如，如果`moduleNameMapper`和`alias`的配置不同，那么`path resolve`将不能正确解析被测试文件中的别名配置。


```javascript
// jest.conf.js
const path = require('path');

module.exports = {
  rootDir: path.resolve(__dirname, '../../'),
  // 默认支持的文件扩展名
  // 其作用和 webpack 的 `resolve.extensions` 一致，在一个正式项目中，这二者也最好保持一致。
  moduleFileExtensions: [
    'js',
    'json',
    'vue',
  ],
  // 测试文件中可能会用到的一些别名，和webpack中配置的alias保持一致
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'  
  },
  // 将指定的文件进行转换，和webapck提供的loader一致
  transform: {
    '^.+\\.js$': '<rootDir>/node_modules/babel-jest',
    '.*\\.(vue)$': '<rootDir>/node_modules/vue-jest',
  },
  // 指定测试文件的范围 
  testMatch: [
    '**/test/unit/**/*.spec.(js|jsx|ts|tsx)|**/__tests__/*.(js|jsx|ts|tsx)',
  ],
  // 快照测试
  snapshotSerializers: ['<rootDir>/node_modules/jest-serializer-vue'],
  // 执行指定路径的文件，以配置或设置测试环境。这些指定的文件将在每一个测试文件执行之前被执行。
  setupFiles: ['<rootDir>/test/unit/setup'],
  // 指出是否收集测试时的覆盖率信息
  collectCoverage: true,
  coverageDirectory: '<rootDir>/test/unit/coverage',
  // 配置收集测试时覆盖率信息的文件
  collectCoverageFrom: [
    'src/**/*.{js,vue}', // 允许收集
    '!src/main.js',  // 不允许收集
    '!src/router/index.js',
    '!**/node_modules/**',
    '!tests/**'
  ],
};

```

## 前四项的使用

对Jest的配置是基础工作，做完这些就可以写一个测试文件了，一个完整的测试文件是对前四项功能的综合应用。

### 首先说Mock
Mock再测试文件中至关重要。

当我们想正式运行一个文件的时候，可能不会很通顺，因为在一个项目中我们规划的测试单元对应的部分很少是纯函数，如果我们不在运行测试单元之前把可能出现的全局数据全都mock好，那么我们的代码是跑不起来的。

以一个vuex文件为例，关于Vuex中单测，这里有[官方教程](https://vuex.vuejs.org/zh/guide/testing.html), 从教程中也能看出来，vuex单测最麻烦的地方就是对`Action`的测试，教程中也是对涉及到的接口进行了Mock，模拟了返回结果，但这在实际项目中不适很合适：怎么可能将用到的所有接口一个个的在Mock出来，这是反人类的。

看一个vuex的例子先：
```javascript
// test.js
import Service from '@/service/service'
import API from '@/service/index'

const state = {
  list: []
}

const mutation = {
  setList (state, list) {
    state.list = list
  },
}

const actions = {
  getList ({ commit, state, dispatch }, param) {
    return Service.post(API.list, param).then(res => {
      commit('setList', res.datas)
      return res
    }).catch(err => {
      throw err
    })
  },
}

export default {
  state,
  mutations,
  actions
}

```

如果我们先要测试这个文件，我们必须先提前准备好两个对象： `Service` 和 `API`。 `Service` 是对ajax请求的封装，里面可能有`post`,`get`,`delete`等各种方法，而`API`就是所有的接口地址了，因为这个对象只提供一个字符串地址作为参数，所以我们可以使用原滋原味的对象，不用对其进行处理。

`Jest`对象提供了一个[`jest.mock`](https://jestjs.io/docs/en/jest-object#jestmockmodulename-factory-options)方法，可以对我们从别处导入进来的对象进行Mock。看一下Mock之后的Service对象是什么：

```javascript
// Service.js
export default {
  get: (url, params = {}, config = {}) => service.get(url, {
    params,
    ...config
  }).then(res => res).catch(err => {
    throw err
  }),
  post:(...),
  delete,
  ...
}

// -->
// -->

// Mock 的数据
Service {
  get: { 
    [Function: get]
    _isMockFunction: true,
    getMockImplementation: [Function],
    mock: [Getter/Setter],
    mockReturnValue: [Function],
    mockResolvedValue: [Function],
    mockName: [Function],
    ...
  },
  post: {...},
  ...
}

```
经过Mock之后，我们从`Service.js`导入进来的Service对象已经完全被接管了，当我们遇到有使用`Service.post`方法的时候，直接mock一个返回值就能保证程序正常运行下去。

我们还观察到，每个action方法的第一个参数是一个store实例，我们会在action中用到stroe对象中的commit，dispatch等方法, 所以同样的方法mock一下`vuex`模块。

总之测试文件大概是这个样子：

```javascript
import test from '@/test.js'
import Service from '@/Service.js' 
import Vuex from 'vuex'

// Mock 模块
jest.mock('@/Service.js') 
jest.mock('vuex')

describe('test.js', async () => {  
  let store

  beforeEach(() => {
    store = new Vuex.Store()
  }) 
  
  it('测试actions.getList', async () => { 
    const resp = {
      datas: {}
    }  

    Service.post.mockResolvedValue(resp)
    const result = await test.actions.getList(store, resp)

    // 断言 commit 方法被调用
    expect(store.commit).toHaveBeenCalled()
    expect(store.commit.mock.calls.length).toBe(1)
    expect(store.commit.mock.calls[0][0]).toEqual('setList')
    // 断言getList方法返回了预期值
    expect(result).toEqual(resp) 
  })
}
```

### Globals, Expect, Mock Functions

这三部分其实在上例中都有涉及到。

`describe`,`it`和`beforeEach` 就属于Globals部分，在所有被检测到测试文件中，这些方法都可以直接使用。`beforeEach` 会在每个`it`执行之前被执行一次，可以在此处做一些维护变量纯净性的操作。

`expect`, `toBe`, `toEqual` 和 `toHaveBeenCalled` 属于 Expect 部分，这是系统提供的断言方法，系统提供的断言方法种类很丰富，可以从多方面判断测试单元的是否达到了预期输出。

上例中，`store.commit`是个mock出来的方法，针对所有mock出来的方法都有属性`mock`。`mockFn.mock.calls`记录了该mock的犯法被调用了几次，每次调用的方法名和传参是什么等等。 

## 总结

本文的主要目的就是记录使用Jest实现单测的一个流程，以及Jest中各部分的主要作用，如果需要更细致的了解肯定还是要仔细阅读文档啦。

除了这些技术性的内容，还是要再说一句，写一个测试单元之前首先要明确这个**单元的输入和输出**是什么，然后借助Mock工具熨平单元中出现的一些会影响测试流程的变量，最后借助断言工具从多角度判断输出是否符合预期。

