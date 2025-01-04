
//这是默认的模板 
(function () {
    // @ts-ignore
    function print_arg(addr) {
        try {
            var module = Process.findRangeByAddress(addr);
            if (module != null) return "\n"+hexdump(addr) + "\n";
            return ptr(addr) + "\n";
        } catch (e) {
            return addr + "\n";
        }
    }
    // @ts-ignore
    function hook_native_addr(funcPtr, paramsNum) {
        var module = Process.findModuleByAddress(funcPtr);
        try {
            Interceptor.attach(funcPtr, {
                onEnter: function (args) {
                    this.logs = "";
                    this.params = [];
                    // @ts-ignore
                    this.logs=this.logs.concat("So: " + module.name + "  Method: sub_6E88C9F480 offset: " + ptr(funcPtr).sub(module.base) + "\n");
                    for (let i = 0; i < paramsNum; i++) {
                        this.params.push(args[i]);
                        this.logs=this.logs.concat("this.args" + i + " onEnter: " + print_arg(args[i]));
                    }
                }, onLeave: function (retval) {
                    for (let i = 0; i < paramsNum; i++) {
                        this.logs=this.logs.concat("this.args" + i + " onLeave: " + print_arg(this.params[i]));
                    }
                    this.logs=this.logs.concat("retval onLeave: " + print_arg(retval) + "\n");
                    console.log(this.logs);
                }
            });
        } catch (e) {
            console.log(e);
        }
    }
    // @ts-ignore
    hook_native_addr(Module.findBaseAddress("libcocos2dlua.so_0x6e87cfc000_36040704_fix.so").add(0xfa3480), 0x2);
})();
