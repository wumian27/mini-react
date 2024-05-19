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
// 根据浏览器时间循环机制可知，当微任务执行完，浏览器开始渲染，渲染完成开始执行宏任务，即（messageChannel事件）
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

