
function hook_0x6e88fb27c0(){
    var base_addr = Module.findBaseAddress("libcocos2dlua.so_0x6e87cfc000_36040704_fix.so");

    Interceptor.attach(base_addr.add(0x6e88fb27c0), {
        onEnter(args) {
            console.log("call 0x6e88fb27c0");
            console.log(JSON.stringify(this.context));
        },
    });
}
