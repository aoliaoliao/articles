- [ ] 如何Mock元素

- [ ] 输出输出的界定， 多种输入，连续的输入，多出输出形式的判断

- [ ] 一些坑， mount 和 shallowMount , 变量作用域等


Vue官方提供了一个测试框架[Vue Test Utils](https://vue-test-utils.vuejs.org/zh/), 对其我就不做过多介绍了，肯定也没有官方说的清晰和详细，本文的主要目的还是阐述一些单测的思想和项目中运行时踩到的一些坑。

> 对于 UI 组件来说，我们不推荐一味追求行级覆盖率，因为它会导致我们过分关注组件的内部实现细节，从而导致琐碎的测试。
取而代之的是，我们推荐把测试撰写为断言你的组件的公共接口，并在一个黑盒内部处理它。一个简单的测试用例将会断言一些输入 (用户的交互或 prop 的改变) 提供给某组件之后是否导致预期结果 (渲染结果或触发自定义事件)。

### 关于 mount 和 shallowMount

这两个方法是测试的起点。我们都知道`UI = f(data)`，这两个方法就是`vue-test-util`给我们提供的`f`方法，通过输入被测组件Component和配置项Config, 我们可以得到一个可以我们的组件将会呈现在页面上的UI对象。

`UI = shallowMount(Component, Config)` 或 `UI = mount(Component, Config)`

我们通过判断这个输出的UI对象是否符合预期，来检测我们的代码是否正确运行了。

`shallowMount`用来浅渲染一个组件，即对组件中包含的子组件只保留其存根，而不渲染其内容。这个存根，可以理解为一个占位符，表示我知道这里应该出现什么内容，但此刻，我不care。

`mount`就是我们正常理解的渲染组件的过程了，如果没有特殊说明，他将正常渲染组件中涉及到的所有内容。

这两个方法都会触发组件的声明周期钩子，浅渲染的好处显而易见，性能的提升，避免子组件的干扰等等。但浅渲染也会有一些问题，比如在浅渲染`element-ui`的`el-table`时，即使我们提供了tableData, 我们也并不能得到预期的表格内容，因为所有相关的组件都以 `-stub` 的形式存在，很多时候，一个el-table中的内容是页面的主要内容，没有主要内容，怎么测试呢？所以，这里只能使用 `mount`， 不要因为shallowMount宣传的性能较为优异而将其当作第一首选。事实上，在业务组件的单测中，我更倾向于`mount`。


### 变身小叮当

正如在Jest的单测中讲的那样，我们必须提前准备好一些可能会阻碍被测文件正常执行的内容，就像小叮当帮助大熊去冒险一样，你必须准备好各种工具保护大熊，无论中途遇到什么阻碍，都能保护好大熊最终平安回家吃铜锣烧。

在Vue组件中，这种需要准备的工具可能还很多: 
- vuex
- vue-router
- 全局方法
- 全局组件

以一个全局的权限控制方法`$permission(role)`为例，在组件中有`<div v-if="$permission()"></div>`, 如果没有提前准备好`$permission`, 组件内部的data,computed, props等也找不到，那渲染进程肯定就出问题了。

`vue-test-util` 有标准的测试建议来处理这种问题，首先我们针对被测组件创建一个新的vue实例，然后可以在该实例上Mock各种数据。

```javascript
import { createLocalVue } from '@vue/test-utils'

descipt('demo', () => {
  const localVue = createLocalVue()
  let config = null // mount 或 shallowMount 的参数
  let store 
  let router
  let route  
  let permission

  beforeEach() {
    config = {
      localVue,
      mocks: {
        $store: store,  // 全局挂载 vuex 的实例
        $router: router, // 全局挂载 vue-router 的实例
        $route: route,  // 全局挂载 vue-router 的实例
        $permission: permission // 全局挂载自定义的一些实例
      },
      stubs: [
        'v-contextmenu',
        'v-contextmenu-item',
        'v-contextmenu-submenu'
      ]
    }
  }
})

```

通过`mocks`我们在vue实例上挂载了一些全局变量，这些全局变量现在还没有赋值，因为这些变量的值是需要根据被测组件来确定的。在正常的项目中，`permission`可能是一个对象也可能是一个方法，`router`包含很多数据和方法，但我们准备的时候没必要真的将我们定义的 permission 通过import 引入进来然后挂载到localVue上面，也没必要在new一个路由实例出来。

事实上这种方法反而是有害的，因为引入了真实的项目代码之后，如果测试文件出问题，我们反而不方便定位是测试代码的问题还是真的是被测文件的问题。

我们Mock的时候可以**按需Mock**, 不要做无关的Mock，过犹不及。

比如，被测文件中需要路由参数的id属性，那我们将route定义成这样就可以：

```javascript
let route = { params: { id: '123456' } }
```

比如，被测文件中只用到了路由的push方法，那我们将router定义成这样就可以：
```javascript
let router = {
  push: jest.fn()
}
```
 
但是对于vuex， 我个人觉得还是新建一个store实例比较方便，因为在vue组件中可能会有各种store的使用方式，通过mock一个store实例的对象更加方便

```javascript
const store = {
  modules: {
    test: {
      namespaced: true,
      state:{},
      actions: {}
    }
  }
}
```

### 梳理测试单元的输入输出

对前端交互组件的测试，主要的输入内容应该是用户的操作，各种键盘，鼠标操作等等，一个完整的测试单元可能会将一串连续的操作做为输入，其输出应该是页面正确渲染出了预期内容。

理想情况下，是将一个组件做为一个黑盒来测试，但实际上很多场景下很难做到这一点，比如，一个新增操作的结果是重新调取接口获取列表，那么我测试的输出就和页面渲染的关系不大，而是考查列表接口是否重新调用了。






