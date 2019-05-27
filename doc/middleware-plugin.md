<a name="module_middleware-plugin"></a>

## middleware-plugin

* [middleware-plugin](#module_middleware-plugin)
    * [MiddlewarePlugin](#exp_module_middleware-plugin--MiddlewarePlugin) ⏏
        * [.description()](#module_middleware-plugin--MiddlewarePlugin+description)
        * [.optionDefinitions()](#module_middleware-plugin--MiddlewarePlugin+optionDefinitions) ⇒ <code>OptionDefinition</code> \| <code>Array.&lt;OptionDefinition&gt;</code>
        * [.middleware()](#module_middleware-plugin--MiddlewarePlugin+middleware) ⇒ <code>function</code> \| <code>Array.&lt;function()&gt;</code>

<a name="exp_module_middleware-plugin--MiddlewarePlugin"></a>

### MiddlewarePlugin ⏏
Optionally you can extend EventEmitter and emit `verbose` events.

**Kind**: Exported class  
**Emits**: <code>event:verbose</code>  
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
Return one of more Koa middleware functions.

**Kind**: instance method of [<code>MiddlewarePlugin</code>](#exp_module_middleware-plugin--MiddlewarePlugin)  
