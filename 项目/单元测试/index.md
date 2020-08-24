# 单元测试

### 名词解释
**TDD** ：Test Driver Development ，测试驱动开发
**BDD** ：Behavior Driver Development , 行为驱动开发。
**Unit Test** ：单元测试
**Mocha**：前端测试框架
**chai** ： 断言库

### Mocha 
[入门教程](http://www.ruanyifeng.com/blog/2015/12/a-mocha-tutorial-of-examples.html)

测试框架就是运行测试的工具。Mocha是前端流行的测试框架之一，可运行于Node和浏览器环境，支持同步、异步测试，支持多种形式导出测试结果（.md，.html等）。
Mocha提供了直接在CLI中执行的命令`mocha`，只要一个项目安装了Mocha，那么就可以直接在CLI中输入`mocha 测试脚本文件名`来执行。如果通过这种方式启动脚本文件，在脚本文件中可以直接使用Mocha提供的方法，比如`describe(),it()`.


除了Mocha，还有Jasmine、Karma、Tape等多种测试框架。

### chai 断言库
**关于断言（assert）** ：判断代码的实际运行结果和预估结果是否一致，如果不一致就抛出一个错误。
断言功能由断言库实现，Mocha并没有自带的断言库，所以引入了断言库`chai`

### 示例
新建一个测试脚本文件：`add.test.js`
```javascript
// add.test.js
var add = require('./add.js');
var expect = require('chai').expect;

describe('加法函数的测试', function() {
  it('1 加 1 应该等于 2', function() {
    expect(add(1, 1)).to.be.equal(2);
  });
});
```
上面这段代码，就是一段测试代码，通过Mocha框架就可以直接运行。

测试脚本中应该包含一个多个测试套件`describe`，一个`describe`中应该包含多个测试用例`it`。  
`describe`表示一组相关的测试，他是一个函数，第一个参数是测试套件的名称，第二个参数是一个实际执行的函数。  
`it`表示一个单独的测试，是测试的最小单位，他也是一个函数，第一个参数表示测试的名称，第二个参数为实际执行的函数。  
`expect`是断言库提供的一种断言风格，其用法非常接近于自然语言。写法大致一致：开头是expect方法，尾部是断言方法，比如`equal`,`a/an`,`ok`,`match`等，中间用`to`或`to.be`连接。










