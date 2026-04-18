关于 在knowledge.vue中点击新增和编辑按钮出现的问题
当我们写成
watch(() => props.currentArticle, (newVal) => {
  if (newVal) {
    // 合并对象属性 若两个中有相同属性 后面的对象的属性会覆盖前面的对象的属性
    Object.assign(formData, newVal)   
    // 使用现有id
    businessId.value = newVal.id
    // 拿到图片地址
    imgURL.value = fileBaseUrl + newVal.coverImage
  }
})
时出现
当先打开新增再打开编辑 然后再打开新增 功能是好的
但是当先打开编辑 再打开新增 编辑中的有些内容就没被清空 而是直接到了新增按钮打开的弹窗上了

关键在于el-form 的 resetFields() 方法 和 Vue 的生命周期渲染顺序。

1. 核心矛盾：什么是“初始值”？
el-form 的 resetFields() 方法并不是把表单清空，而是把表单重置为“初始值”。
这个初始值是什么时候确定的？ 是在 el-form 组件第一次挂载（Mounted）完成时，它会抓取当时 formData 里的值作为基准。
2. 为什么“先编辑、再新增”会出问题？（不加 nextTick 的情况）
点击编辑：父组件修改了 currentArticle。
触发 Watch：子组件的 watch 立即执行，同步执行了 Object.assign(formData, newVal)。此时 formData 变成了编辑的文章内容。
弹窗打开：el-dialog 渲染，内部的 el-form 第一次加载。
抓取快照：el-form 看到 formData 已经是“文章内容”了，于是它把**“文章内容”当成了初始值**记录了下来。
关闭弹窗：你调用了 ruleFormRef.value.resetFields()。表单被重置回了它记录的初始值（即“文章内容”）。
点击新增：currentArticle 变成 {}（空对象）。
watch 触发，执行 Object.assign(formData, {})。注意： Object.assign 往一个有值的对象里合并空对象，是不会清空原属性的！
于是，formData 依然保留着上一次的“文章内容”。
结果：新增弹窗里出现了编辑的内容。
3. 为什么加了 nextTick 就好了？
点击编辑：父组件修改了 currentArticle。
触发 Watch：watch 执行，但里面的代码被丢进了 nextTick 队列（异步执行）。
弹窗打开：el-dialog 渲染，el-form 第一次加载。
抓取快照：此时 nextTick 还没运行，formData 还是最原始的定义（空字符串）。el-form 把“空字符串”记录成了初始值。
异步更新：nextTick 运行，formData 被赋值为“文章内容”，用户在界面上看到编辑数据。
关闭弹窗：你调用了 resetFields()。表单被重置回它记录的初始值（即第4步记录的“空字符串”）。
结果：数据被真正重置了，下次打开新增自然是干净的。
4. 这种做法的隐患
虽然这种做法“奇迹般”地修好了 Bug，但它存在几个风险：
依赖执行时机：如果以后你在 handleEdit 里做了更复杂的操作，或者 Dialog 的渲染逻辑变了，这个 nextTick 的时序可能就不再准确。
Object.assign 的局限：你的父组件里写的是 handleEdit({})。如果父组件传的是 null，你的 watch 里的 if(newVal) 就不会执行，nextTick 也不会跑，数据依然清不掉。
图片和富文本：resetFields 只能重置 el-form-item 绑定的标准表单项。对于你代码里的 imgURL（封面图）和 RichTextEditor（富文本），它们不属于 el-form 管理。如果这部分也正常了，那是由于你在 handleClose 里手动写了 handleRemove() 等逻辑。

总结建议
你发现 nextTick 能解决问题，是因为它利用了 Element UI 的初始化逻辑。
但为了代码的健壮性，最标准的做法应该是：
在 handleClose 时，显式地清空 formData 的所有字段。
在 watch 的 else 分支（即 newVal 为空时），显式调用重置函数。
代码对比：
你的修改（巧劲）：利用 nextTick 让表单组件误以为空值是初始值。
健壮的做法（笨功夫）：不管初始值是谁，在关闭和切换到新增模式时，手动把 formData 里的每一个 Key 都设为 '' 或 []。
