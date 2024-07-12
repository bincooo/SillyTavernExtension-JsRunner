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

<img width="513" alt="Screenshot 2024-07-12 at 23 23 55" src="https://github.com/user-attachments/assets/54fbdfe7-a111-4571-8eb5-e58deb78d547">
