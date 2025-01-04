/*
 * To observe a single class by name:
 *     observeClass('NSString');
 *
 * To dynamically resolve methods to observe (see ApiResolver):
 *     observeSomething('*[* *Password:*]');
 */



function main()
{


    // frida-trace  -m '*[*jsapi* *]/iu' -m '*[*wxdata* *]/iu'   '微信'
    // observeClass('JSOperateWxDataRequest');
    // // // observeClass('JSOperateWxDataResponse');
    // observeClass('JSAPIBaseResponse');
    // observeClass('JSLoginResponse');
    // observeClass('MMCGIRequester');
    observeClass('QRCodeLoginCGI');
    observeClass('CheckLoginQRCodeRequest');
    observeClass('MMMainWindowController');
    observeClass('PushLoginURLRequest');
    observeClass('PushLoginURLResponse');
    observeClass('GetLoginQRCodeRequest');
    observeClass('GetLoginQRCodeResponse');
    
    
    // observeClass('WAWebLocalStorage');
    // observeClass('WAIPCServer');
    // observeClass('WAIPCCgiWrap');

    // MMCGIRequester requestCGI
    // WAHost
    // // observeClass('MMXPCMessage');
    
    // // observeClass('MMCGIService');
    // observeClass('WAIDKeyReportRequest');
    // observeClass('WAKVReportRequest');
    // observeClass('WAIPCServer');
    
    
    
    // JSLoginResponse

    
    // observeClass('WABaseRequest');
    // observeClass('WAIPCServer');
    
    // observeSomething('*[* *Password:*]') 

}

var  OCArgType =  {
	TypeChar              : 'c',
	TypeInt               : 'i',
	TypeShort             : 's',
	TypeLong              : 'l',  // note: long encodes to 'q' on 64 bit
	TypeLongLong          : 'q',
	TypeUnsignedChar      : 'C',
	TypeUnsignedInt       : 'I',
	TypeUnsignedShort     : 'S',
	TypeUnsignedLong      : 'L',
	TypeUnsignedLongLong  : 'Q',
	TypeFloat             : 'f',
	TypeDouble            : 'd',
	TypeBool              : 'B',  // note: BOOL encodes to 'c' on 64 bit
	TypeVoid              : 'v',
	TypeCString           : '*',
	TypeObject            : '@',
	TypeClass             : '#',
	TypeSelector          : ':',
	TypeArray             : '[',
	TypeStruct            : '{',
	TypeUnion             : '(',
	TypeBitField          : 'b',
	TypePointer           : '^',
	TypeUnknown           : '?',
} ;
function transObject(pointer, typ){
    // readS8(): number;
    // readU8(): number;
    // readS16(): number;
    // readU16(): number;
    // readS32(): number;
    // readU32(): number;
    // readS64(): Int64;
    // readU64(): UInt64;
    // readShort(): number;
    // readUShort(): number;
    // readInt(): number;
    // readUInt(): number;
    // readLong(): number | Int64;
    // readULong(): number | UInt64;
    // readFloat(): number;
    // readDouble(): number;
    // readByteArray(length: number): ArrayBuffer | null;
    // readCString(size?: number): string | null;
    // readUtf8String(size?: number): string | null;
    // readUtf16String(length?: number): string | null;
    // readAnsiString(size?: number): string | null;
    // var callMap ={
    //     // 'c':'readU8',
    //     // 'i':'readInt',
    //     // 's':'readShort',
    //     // 'l':'readLong',
    //     'q':'readLong',
    //     // 'C':'readU8',
    //     // 'I':'readUInt',
    //     // 'S':'readUShort',
    //     // 'L':'readULong',
    //     'Q':'readULong',
    //     // 'f':'readFloat',
    //     // 'd':'readDouble',
    //     // 'B':'readU8',
    //     // '*':'readCString',
    // }
    // console.log("typ:::", typ)
    // let m = callMap[typ]
    // if( m && !pointer.isNull()){
    //     try{
    //         let r = pointer[m]()
    //         if(r == null)
    //             return ""
    //         return  r.toString()
    //     }
    //     catch(e){
    //         return e
    //     }
        
    // }
    return `${pointer.toString()} ${pointer.toInt32()}`

}

var ISA_MASK = ptr('0x0000000ffffffff8');
var ISA_MAGIC_MASK = ptr('0x000003f000000001');
var ISA_MAGIC_VALUE = ptr('0x000001a000000001');

function observeSomething(pattern) {
    var resolver = new ApiResolver('objc');
    var things = resolver.enumerateMatchesSync(pattern);
    things.forEach(function(thing) {
        observeMethod(thing.address, '', thing.name);
    });
}

function observeClass(name) {
    var k = ObjC.classes[name];
    if (!k) {
        return;
    }
    k.$ownMethods.forEach(function(m) {
        //console.log("types::", k[m].types)
        observeMethod(k[m].implementation, name, m, k[m].types);
    });
    // if(k.$super && k.$super.$className != k.$className){
    //     observeClass
    // }
}

function observeMethod(impl, name, m, typs) {
    typs = typs || ""
    var argArr =  typs.split("@0:8")
    var sType = ""
    if(argArr.length>1){
        sType = argArr[1].replace(/\d+/ig,"")

    }

    console.log('Observing ' + name + ' ' + m + ' ' + typs) ;
    Interceptor.attach(impl, {
        onEnter: function(a) {
            this.log = [];
            var d = new Date()
            d.setHours(d.getHours() - d.getTimezoneOffset()/60)
            
            this.log.push(`${d.toJSON()} ` + 'func:::(' + a[0] + ') ' + name + ' ' + m);
            this._checked = false
            
            if (m.indexOf(':') !== -1) {
                var params = m.split(':');
                params[0] = params[0].split(' ')[1];
                for (var i = 0; i < params.length - 1; i++) {
                    var r = a[2 + i]
                    if(!r || r.isNull() || sType.length <= i){
                        if (r && !r.isNull()){
                            this.log.push(params[i] + ': ' + r.toString())
                        }
                        continue
                        
                    }
                        
                    try {
                        if(sType.charAt(i) ==  OCArgType.TypeObject){
                            const theObj = new ObjC.Object(r);
                            if(!theObj)
                                continue
                            // this.log.push(params[i] + ': ' + ' (' + theObj.$className + ')' + theObj.toString() );
                            if(('_NSInlineData' == theObj.$className 
                             || 'NSConcreteMutableData' == theObj.$className
                            ) && theObj.length() >0){
                                var s = ObjC.classes.NSString.alloc()
                                var str = s.initWithData_encoding_(r,4) || s.initWithData_encoding_(r,0)
                                
                                if(str)
                                    this.log.push(params[i] + ': ' + ' (' + theObj.$className + ')'  + str.toString())
                                else 
                                    this.log.push("str = null data length:" + theObj.length() + " :" + theObj.toString() )
                            }
                            else 
                                this.log.push(params[i] + ': ' + ' (' + theObj.$className + ')' + theObj.toString() );
                            if(theObj.$className.match(/block/i)){
                                const block = new ObjC.Block(r);
                                this.log.push("signature::" + "types:" + block.types  + " retType:"  + block._signature.retType.type + " size:"  + block._signature.retType.size)
                                for(var aa =0;block._signature.argTypes[aa];aa++)
                                    this.log.push("argTypes:" + aa + " " + block._signature.argTypes[0].type + " size:" +block._signature.argTypes[0].size)
                            }
                        }
                        else {
                            this.log.push(params[i] + ': ' + ' (' +  sType.charAt(i) + ')'  + transObject(r, sType.charAt(i)));
                        }
                        
                       
                    }
                    catch(e){
                        this.log.push(params[i] + ':  error:::' + e.toString() );
                    }    
                    
                    
                    // if (isObjC(a[2 + i])) {
                    //     const theObj = new ObjC.Object(a[2 + i]);
                    //     this.log.push(params[i] + ': ' + theObj.toString() + ' (' + theObj.$className + ')');
                    // } else {
                    //     this.log.push(params[i] + ': ' + a[2 + i].toString());
                    // }
                }
            }
            let filters=[
                'init',
                // 'initWithCoder',
                // 'SetCode',
                'requestCGI',
                // 'sendMessageToServer'
                // 'setData'
                'Auth',
                'Login',
                'auth',
                'login'
                // 'requestPb'
            ]
            
            if(!filters.find(v=> m.indexOf(v)>=0)){
                return
            }
            this.log.push("backtrace:" + Thread.backtrace(this.context, Backtracer.ACCURATE)
                    .map(DebugSymbol.fromAddress).join("\n"));
                this.log.push("callStackSymbols:" + ObjC.classes.NSThread.callStackSymbols().toString());
                    
                this._checked = true
                
        },

        onLeave: function(r) {
           
            if(this._checked && !r.isNull() && typs.charAt(0) == OCArgType.TypeObject){
                const theObj = new ObjC.Object(r);
                
                this.log.push('ret: '+ ' (' + theObj.$className + ')' + theObj.toString() );
                if('_NSInlineData' == theObj.$className && theObj.length() >0){
                    var s = ObjC.classes.NSString.alloc()
                    var str = s.initWithData_encoding_(r,4) || s.initWithData_encoding_(r,0)
                    if(str)
                        this.log.push("str:" + str.toString())
                }
            }
            // else 
            //     this.log.push('ret::' + typs.charAt(0))
               

            console.log(this.log.join('\n') + '\n');
        }
    });
}

function isObjC(p) {
    var klass = getObjCClassPtr(p);
    return !klass.isNull();
}

function getObjCClassPtr(p) {
    /*
     * Loosely based on:
     * https://blog.timac.org/2016/1124-testing-if-an-arbitrary-pointer-is-a-valid-objective-c-object/
     */

    if (!isReadable(p)) {
        return NULL;
    }
    var isa = p.readPointer();
    var classP = isa;
    if (classP.and(ISA_MAGIC_MASK).equals(ISA_MAGIC_VALUE)) {
        classP = isa.and(ISA_MASK);
    }
    if (isReadable(classP)) {
        return classP;
    }
    return NULL;
}

function isReadable(p) {
    try {
        p.readU8();
        return true;
    } catch (e) {
        return false;
    }
}

main()