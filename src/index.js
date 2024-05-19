// fiber执行阶段
// 每次渲染都有两个阶段 reconcilation 跟 commit 阶段
// reconciler： 是diff算法阶段，可以被中断，会找出所有节点的变更
// 比如节点删除 更新 新增 属性变化， 称为react的副作用

// 提交阶段：将上个阶段计算出来的副作用一次性执行，是同步

const Comp = (
  <div id="compId">
    <p id="text1">
      <p>text1</p>
      <p id="text1-1">text1-1</p>
    </p>
    <p id="text2">text2</p>
  </div>
)

// console.log(Comp)

const root = {
  stateNode: document.getElementById('root'),
  props: {children: [Comp]}
}

let nextUnitOfWork = root
// 从虚拟DOM跟节点进行遍历，如有浏览器有空闲时间，将进行fiber 节点构建，如果没有，则暂停构建，但nextUnitWork停留在上一次构建的节点
const workLoop = (deadline) => {

  while (nextUnitOfWork && deadline.timeRemaining() > 0) {
    nextUnitOfWork = performanceUnitOfWork(nextUnitOfWork)
  }
  if(nextUnitOfWork) {
    requestIdleCallback(workLoop)
}
  // 构建完fiber数 提交，生成真实DOM
  if(!nextUnitOfWork) {
    console.log(root)
    commitRoot(root)
  }
}

// TODO: 1.构建真实dom 当不会添加到页面上， 2 构建fiber 结构为 主要结构  {return, child, sibling, props, effectTag, type}
const beginWork = (workingInProgressFiber) => {

  // 没有真实dom 创建真实dom
  if (!workingInProgressFiber.stateNode) {
    workingInProgressFiber.stateNode = document.createElement(workingInProgressFiber.type)
    for (let key in workingInProgressFiber.props) {
      // 简单出来将 props 值调添加到dom
      if (key !== 'children') workingInProgressFiber.stateNode[key] = workingInProgressFiber.props[key]
    }
    // 文本简单 处理
    if(workingInProgressFiber.props && !Array.isArray(workingInProgressFiber.props.children)) {
      workingInProgressFiber.stateNode.textContent = workingInProgressFiber.props.children
    }
  }

  if (workingInProgressFiber.props && Array.isArray(workingInProgressFiber.props.children)) {
    // debugger
    let previousFiber; // 记录上个fiber 节点
    workingInProgressFiber.props.children.forEach((child, index) => {
      // 构建fiber节点信息
      // debugger
      const childFiber = {
        type: child.type,
        props: child.props,
        return: workingInProgressFiber,
        effectTag: 'PLACEMENT'
      }
      // 第一元素 是孩子
      if (index === 0) {
        workingInProgressFiber.child = childFiber
      } else {
        previousFiber.sibling = childFiber
      }
      previousFiber = childFiber
    });
  }
}
const performanceUnitOfWork = (workingInProgressFiber) => {
  beginWork(workingInProgressFiber)
  // fiber 遍历顺序是 先孩子在sibling 然后到return
  if(workingInProgressFiber.child) {
    return  workingInProgressFiber.child
  }
  while(workingInProgressFiber) {
    // 如果没有自孩子 当前节点便利完成
    // completeUnitOfWork(workingInProgressFiber)
    // 如果有兄弟节点 返兄弟节点
    if(workingInProgressFiber.sibling) {
      return workingInProgressFiber.sibling
    }
  // 没有兄弟节点 回到父级，重新进度while递归 找父级节点的兄弟
    workingInProgressFiber =  workingInProgressFiber.return
  }
}

const commitRoot = (root) => {
  let currentRoot = root.child
  while(currentRoot) {
     currentRoot.return.stateNode.appendChild(currentRoot.stateNode)
     currentRoot = currentRoot.child || currentRoot.sibling

  }
}
requestIdleCallback(workLoop)
