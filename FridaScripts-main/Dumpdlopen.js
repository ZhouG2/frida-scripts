
Interceptor.attach(Module.findExportByName(null, 'android_dlopen_ext'), {
    onEnter: function(args) {
        var library_path = Memory.readCString(args[0])
        if (library_path) { 
            console.log(library_path)
        }
    }

})
