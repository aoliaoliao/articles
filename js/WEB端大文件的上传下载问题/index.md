公司项目需求，通过浏览器上传下载的文件大小在10G左右。对解决这个问题的过程做个简单记录。


## 上传
首先要明确，对于文件的上传，在我们通过页面选取过文件之后，浏览器只是关联了该文件的一些基本信息，比如文件大小，名称等，并没有将文件内容读取到内存中。只有当我们`new FormData`的时候，才是文件被读取到内存的过程。

浏览器在上传的过程中肯定需要把文件读取到内存中，但这个过程其实给我们留有操作空间。因为`File`其实继承于`Blob`，`Blob`是H5中新增的二进制类型的大对象，给我们提供了操作内存中数据的工具，具体的可以[查看这里](http://note.youdao.com/noteshare?id=2b1aabdb689e81d6319c1092af663979&sub=03D01A26C5D04C099AF1D111B225F3CA)。

前端之所以可以支持文件分片上传主要就是借助了`blob.slice()`方法，实现了对文件的分片读取。也是借助与这个工具可以实现边读边传，避免了文件过大导致浏览器内存爆掉。

> 前端并不是真的将文件分成N个独立的文件片段，只是每次读取文件的指定片段。这和后端处理真的分片内容不同。

文件的上传采用分片上传的方式，这个过程肯定需要后端的配合，整个上传过程调用了三个接口：
#### 1.文件上传初始化（init_upload）
通知服务器即将上传文件的大小和名字，服务器生成一个`uploadId`并回传作为该文件上传的唯一标识。`uploadId`作为一个重要标识，在后续的每次请求中都应该作为参数被携带上传。

#### 分片上传过程（part）:
这一部分是文件传输的主要过程，前端指定一个合理的分片大小`CHUNK_SIZE`，将一个大文件分为`chunks = Math.ceil( file.size / CHUNK_SIZE ) `份，每次上传一个文件指定范围内的内容，注意每片上传的时候都应该附带`uploadId`，以便后台进行分类。

安全起见，前端应该对选中的片段进行`md5`签名，

**断点续传**：如果需要断点续传，前端应该做的是在每一片上传完毕之后，在本地记录下当前上传的位置。而大量的工作应该在后端，揣测应该是根据文件名称，大小以及上传的目的地确定是否为同一个文件，如果是则返回之前的uploadId。


**上传过程的进度**：可以根据已上传的片数做一个进度展示，这里有一个不常用的知识点需要注意。借助`XMLHttpRequest`.我们常用的`xhr`钩子有`onloadstart`,`onload`,`onerror`,`onprogress`等等，这些钩子存在于**下载**的传输过程。`xhr`还有一个`upload`对象，该对象具备上边所有的钩子，不同的是，这些钩子在`上传`的传输过程中被触发。`xhr.upload.onprogress = function() {}`可以用来监听上传进度。

在文件全部上传成功之后可以进入下一步

#### 文件全部上传完毕（finish_upload）:
在文件全部上传成功之后调用，告诉服务器文件已全部上传，可以进行文件合并。


```javascript
// 伪代码
export default class FileUploader {
    constructor(options) {
        this.file = options.file
        this.chunks = ''
        this.uploadId = ''
        this.options = Object.assign({
            chunkSize: 16m
        }, options )
    }
    
    start() {
        this.$http.initUpload().then( res => {
            this.uploadId = res.uploadId
            this.upload()
        })
    }
    
    upload(){
        let formData = new FormData()
        formData.append( 'file', this.file.slice( start, end ) )
        // ...
        this.$http.part(param).then( res => {
            if ( allEnd ) {
                this.finish()
            }
        })
    }
    
    fininsh() {
        this.$http.finishUpload( )
    }
    
}

```

## 下载

在浏览器中下载文件，一般过程是web发送一个下载请求，然后剩下的事情都是浏览器在托管。开发人员在这一过程总没有可操作的余地。浏览器的下载过程应该也是边下边存，节约内存。在下载大文件的过程中，浏览器的内存没有明显变化。

公司的web网站一般是用`nginx`做反向代理。当下载`10G`大小文件的时候失败原因也在于`nginx`的配置原因。`nginx`的配置也是一个蛮大的工程，这里只讲遇到的问题，其他部分日后研究吧。

- [nginx http模块配置参数解读](https://www.jianshu.com/p/2d7b3fbc9826)

一般来讲，nginx服务器与后端服务器的通信速度较快，clinet与nginx的通信时间就慢一些，所以，ngin配备了缓冲功能。即有 `client buffer` 也有 `proxy buffer`。nginx作为反向代理，在接收`upstream`的数据时会对其有一个缓存，几个相关配置项如下：
```nginx
proxy_buffering on;         #默认是on, 开启proxy缓冲
proxy_buffers 8 4k|8K;      #缓冲区的大小和数量,
proxy_buffer_size 4k|8k;    #缓冲后端服务器取得的第一部分的响应内容,一般为header头部
proxy_busy_buffers_size 8K|16K; #允许一次性传给客户端的最大值
proxy_max_temp_file_size 1024m; #后端服务器的文件不大于配置值都可以缓存到nginx代理硬盘中，如果超出，那么文件不缓存，而是直接中转发送给客户端.如果proxy_max_temp_file_size设置为0，表示不使用临时缓存。
```
项目中遇到的下载失败问题，原因就在于`proxy_max_temp_file_size`该项的配置。该项的默认值是`1G`，按照设置来讲，当超过`1G`的时候代码nginx不再缓冲，文件内容会直接传给客户端，但是实际情况来讲，由于客户端下载速度比较慢，而nginx和后端服务器之间高速传输，两端速度不对等，导致nginx和tomcat之间的连接一直处于idle状态，超出一定时间(服务器的keepalive时间)后端服务器主动断开连接，进而客户端在下载了1G的文件之后就会被告知下载失败。

所以解决方案就是调大临时文件值的阈值或者直接不使用临时文件缓存，将其设为0。













