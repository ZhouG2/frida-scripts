
function hook_sub_6E88C9F480(){
    var base_addr = Module.findBaseAddress("libcocos2dlua.so_0x6e87cfc000_36040704_fix.so");

    Interceptor.attach(base_addr.add(0x6e88c9f480), {
        onEnter(args) {
            console.log("call sub_6E88C9F480");
            console.log("arg0:"+args[0]);
            console.log("arg1:"+args[1]);
            
        },
        onLeave(retval) {
            console.log(retval);
            console.log("leave sub_6E88C9F480");
        }
    });
}
