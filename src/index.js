import React from 'react';
const Comp = (
  <div id="comp">
    <p>text1</p>
    <p>text2</p>
    </div>
)
console.log(Comp)

// document.getElementById('root')
const render = (virtualDom,container) => {
  const {type, props} = virtualDom
  const dom = document.createElement(type) 
  Object.keys(props).filter(prop => prop !=='children').forEach(prop => {
    //将props 属性挂在dom结构上，但排除children属性
    // 注意 这是简单对属性处理，还需要对style 事件进行特色处理
    dom[prop] = props[prop]
  })
  // 如果children是数组，递归调用 render函数
  // 注意这是react.16之前版本 stack 递归渲染方式，但会存在问题，如果子阶段很多，js执行时间过长，会操作页面卡顿
  if(Array.isArray(props.children)) {
     props.children.forEach(child => render(child, dom))
  }else {
    dom.textContent = props.children
  }
  container.appendChild(dom)
}

render(Comp, document.getElementById('root'))