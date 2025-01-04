DebugSymbol.findFunctionsMatching("*nirvana*").forEach(function(v){console.log(DebugSymbol.fromAddress(v))})

frida-trace  -m '*[*jsapi* *]/iu' -m '*[*wxdata* *]/iu'   '微信'