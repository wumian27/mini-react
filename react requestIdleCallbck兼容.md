requestIdleCallback是浏览器空闲时间执行的回调的API，主要是为了解决当任务需要长时间占用主进程时，导致更高优先级别任务（如动画或者事件任务）无法及时响应，从而引发页面丢帧或者卡死的情况

react时使用requestAnimationFrame 跟 MessageChannel 来兼容 requestIdleCallback
在看具体代码之前，先了解一些属性跟函数的作用

requestAnimationFrame是在浏览器下一次重绘之前执行，一般用于动画API 跟时间分片 （比如大量数据渲染页面）

MessageChannel 是以DOM Event的形式进行信息的传递，属于异步的宏任务；它的实现原理是基于双向通信的，它通过创建两个通信端口（port）来实现，其中一个端口用来发送信息，另一个用来接受信息

perfomance.now() 它返回一个表示从某个时间点（通常是页面加载或者导航开始的时间）到当前时间的高精度时间戳

具体实现如下

let oneFrameTime = 100 / 60 //16.6 浏览器每帧时间
let dealTime
let pendingCb
const channel = new MessageChannel()
window.requestIdleCallback = (cb, options) => {

  window.requestAnimationFrame((rafTime) => {
    // rafTime 可以看着一帧开始时间等于 performance.timing.navigationStart + performance.now()
    // 一帧结束时间
    dealTime = rafTime + oneFrameTime //
    pendingCb = cb
    channel.port1.postMessage('')
  })
}

const timeRemaining = () =>  dealTime - performance.now()
// 接受 port1发送给来的信息
// 根据浏览器事件循环机制可知，当微任务执行完，浏览器开始渲染，渲染完成开始执行宏任务，即（messageChannel事件）可以拿到浏览器渲染过后的时间
channel.port2.onmessage = () => {
  const currentTime = performance.now()
  const didTimeout = dealTime <= currentTime
  if (didTimeout || timeRemaining() > 0) {
    if(pendingCb){
        pendingCb({didTimeout,timeRemaining})
    }
  }
}

const sleep = (duration) => {
   const start = Date.now() 
   while (start + duration > Date.now()) {}
}
const queue = [
  () => {
    console.log('A开始')
    sleep(20)
    console.log('A结束')
  },
  () => {
    console.log('B开始')
    sleep(20)
    console.log('B结束')
  },
]
const workLoop = (dealTime) => {
  console.log(`本帧剩余时间${dealTime.timeRemaining()}`)
  // 如果有剩余时间 并且有任务 
  while(dealTime.timeRemaining() > 0 && queue.length) {
    performUnitOfWork()
  }

  // 如果没有剩余时间，当还有任务存在
  if(queue.length) {
    requestIdleCallback(workLoop)
  }
}

const performUnitOfWork = () => {
  const task = queue.shift()
  task()
}

requestIdleCallback(workLoop)



