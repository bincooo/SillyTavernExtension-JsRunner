# SillyTavern Extension Javascript Runner

This is a simple extension that allows you to run javascript code in the context of the current page.

可用参数如下:
```javascript
event = {
    eventSource, event_types
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
    const context = getContext();
    const message = context.chat[context.chat.length-1]
    message.mes = "(bilbilbil~) " + message.mes
    context.chat[context.chat.length-1] = message
    extensions.toastr.success("Message sent !")
})
```