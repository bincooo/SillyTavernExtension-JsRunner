# SillyTavern Extension Javascript Runner

This is a simple extension that allows you to run javascript code in the context of the current page.

可用参数如下:
```javascript
script = {
    eventSource, event_types, ...
}

extensions = {
    getContext, toastr, doExtrasFetch, getApiUrl
}

command = {
    SlashCommandParser, ARGUMENT_TYPE, SlashCommandArgument, SlashCommandNamedArgument
}
```

Examples:
```javascript
script.eventSource.on(script.event_types.MESSAGE_SENT, (data) => {
    const context = extensions.getContext();
    const message = context.chat[context.chat.length-1]
    message.mes = "(bilbilbil~) " + message.mes
    context.chat[context.chat.length-1] = message
    extensions.toastr.success("Message sent !")
})
```

<img width="513" alt="Screenshot 2024-07-12 at 23 23 55" src="https://github.com/user-attachments/assets/54fbdfe7-a111-4571-8eb5-e58deb78d547">

- [[DLC] - messages 上下文特化处理](https://github.com/bincooo/SillyTavernExtension-JsRunner/discussions/6)
- [[DLC] - dall-e-3图文生成插件](https://github.com/bincooo/SillyTavernExtension-JsRunner/discussions/5)
- [[DLC] - 添加command指令 message-render 、message-cancel](https://github.com/bincooo/SillyTavernExtension-JsRunner/discussions/4)
- [[DLC] - 切换角色卡时同名世界书自动选中](https://github.com/bincooo/SillyTavernExtension-JsRunner/discussions/3)
- [[DLC] - 状态栏选项快捷发送按钮](https://github.com/bincooo/SillyTavernExtension-JsRunner/discussions/2)
- [[DLC] - 酒馆QR同名角色卡自动绑定](https://github.com/bincooo/SillyTavernExtension-JsRunner/discussions/1)
