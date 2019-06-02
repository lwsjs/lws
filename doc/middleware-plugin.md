<a name="module_middleware-plugin"></a>

## middleware-plugin
MiddlewareStack plugin API.

**Example**  
```js
class Greeter {
  middleware (options = {}) {
    return function (ctx, next) {
      ctx.body = `Hello Mr ${options.surname}`
      next()
    }
  }

  optionDefinitions () {
    return [
      { name: 'surname', description: 'Your family name.' }
    ]
  }
}

module.exports = Greeter
```

* [middleware-plugin](#module_middleware-plugin)
    * [MiddlewarePlugin](#exp_module_middleware-plugin--MiddlewarePlugin) ⏏
        * [.description()](#module_middleware-plugin--MiddlewarePlugin+description)
        * [.optionDefinitions()](#module_middleware-plugin--MiddlewarePlugin+optionDefinitions) ⇒ <code>OptionDefinition</code> \| <code>Array.&lt;OptionDefinition&gt;</code>
        * [.middleware()](#module_middleware-plugin--MiddlewarePlugin+middleware) ⇒ <code>function</code> \| <code>Array.&lt;function()&gt;</code>

<a name="exp_module_middleware-plugin--MiddlewarePlugin"></a>

### MiddlewarePlugin ⏏
**Kind**: Exported class  
<a name="module_middleware-plugin--MiddlewarePlugin+description"></a>

#### middlewarePlugin.description()
A description to show in the usage guide.

**Kind**: instance method of [<code>MiddlewarePlugin</code>](#exp_module_middleware-plugin--MiddlewarePlugin)  
<a name="module_middleware-plugin--MiddlewarePlugin+optionDefinitions"></a>

#### middlewarePlugin.optionDefinitions() ⇒ <code>OptionDefinition</code> \| <code>Array.&lt;OptionDefinition&gt;</code>
Return one or more options definitions to collect command-line input.

**Kind**: instance method of [<code>MiddlewarePlugin</code>](#exp_module_middleware-plugin--MiddlewarePlugin)  
<a name="module_middleware-plugin--MiddlewarePlugin+middleware"></a>

#### middlewarePlugin.middleware() ⇒ <code>function</code> \| <code>Array.&lt;function()&gt;</code>
Return one of more Koa middleware functions. Optionally, emit `verbose` events to `ctx.app`.

**Kind**: instance method of [<code>MiddlewarePlugin</code>](#exp_module_middleware-plugin--MiddlewarePlugin)  
**Params**: [options] {object} - A config object.  
