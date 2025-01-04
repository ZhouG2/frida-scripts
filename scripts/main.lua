function writefile(path, content, mode)
    if not content then return end
    
    mode = mode or "w+b"
    local file = io.open(path, mode)
    if file then
        if file:write(content) == nil then return false end
        io.close(file)
        return true
    else
        return false
    end
end

function __G__TRACKBACK__(errorMessage)
    local err = tostring(errorMessage)
    print("----------------------------------------")
    print("LUA ERROR: " .. tostring(errorMessage) .. "\n")
    print(debug.traceback("", 2))
    print("----------------------------------------")
    log(err)
    writefile(cc.FileUtils:getInstance():getWritablePath() .."/err.log", err)
end

function log(msg)
    local path =  cc.FileUtils:getInstance():getWritablePath() .."/eee.log"
    local file = io.open(path, "a")  -- 使用 "a" 模式打开文件，表示以追加模式打开
    if file then
        if file:write(content .. "\n") == nil then 
            file:close()  -- 写入失败时，关闭文件
            return false 
        end
        file:close()  -- 写入成功后，关闭文件
        return true
    else
        return false
    end
end

log("enter main")
function lcher_class(classname, super)
    local superType = type(super)
    local cls

    if superType ~= "function" and superType ~= "table" then
        superType = nil
        super = nil
    end

    if superType == "function" or (super and super.__ctype == 1) then
        -- inherited from native C++ Object
        cls = {}

        if superType == "table" then
            -- copy fields from super
            for k,v in pairs(super) do cls[k] = v end
            cls.__create = super.__create
            cls.super    = super
        else
            cls.__create = super
            cls.ctor = function() end
        end

        cls.__cname = classname
        cls.__ctype = 1

        function cls.new(...)
            local instance = cls.__create(...)
            -- copy fields from class to native object
            for k,v in pairs(cls) do instance[k] = v end
            instance.class = cls
            instance:ctor(...)
            return instance
        end

    else
        -- inherited from Lua Object
        if super then
            cls = {}
            setmetatable(cls, {__index = super})
            cls.super = super
        else
            cls = {ctor = function() end}
        end

        cls.__cname = classname
        cls.__ctype = 2 -- lua
        cls.__index = cls

        function cls.new(...)
            local instance = setmetatable({}, cls)
            instance.class = cls
            instance:ctor(...)
            return instance
        end
    end

    return cls
end

local LauncherScene = lcher_class("LauncherScene", function()
    local scene = cc.Scene:create()

    
    scene.name = "LauncherScene"
    return scene
end)
local version_num_test
function LauncherScene:ctor()
    local winSize = self:getContentSize()
   
    -- print(winSize.width, winSize.height)
    -- require("socket")
    -- if self.tcpServer then
    --     return self.tcpServer
    -- end

    -- self.tcpServer = assert(socket.bind("*", port))
    -- self:setNodeEventEnabled(true)
    -- self:scheduleUpdateWithPriorityLua( function (dt)
       
    --     local canAccept = socket.select({self.tcpServer},nil,0.005)
    --     for _,s in ipairs(canAccept) do
    --         s:settimeout(1)
    --         local c = s:accept()
    --         local remoteIP, remotePort, rtype = c:getpeername()
    --         if remoteIP then
    --             c:settimeout(5,"bt")
    --             local txt, e = c:receive("*a")
    --             print("receive from " .. remoteIP  .. ":")
    --             if not e then
    --                 -- 执行接收到的 Lua 代码
    --                 local func, err = load(line)
    --                 if func then
    --                     local status, result = pcall(func)
    --                     if status then
    --                         c:send(tostring(result) .. "\n")
    --                     else
    --                         c:send("Error: " .. tostring(result) .. "\n")
    --                     end
    --                 else
    --                     c:send("Error: " .. tostring(err) .. "\n")
    --                 end
    --             end
    --         end
    --     end
    -- end, 2)
    -- local hostname = socket.dns.gethostname()
    -- local ip = socket.dns.toip(hostname) or "127.0.0.1"
    -- local port = 12345
    -- local label = cc.Label:createWithSystemFont("Waiting for script[" .. ip ..':' .. port .."]","",30)
    local label = cc.Label:createWithSystemFont("Hello World","",30)
    label:setColor(cc.c3b(255, 255, 0))
    self:addChild(label)
    label:setPosition(winSize.width / 2, winSize.height / 2)
    
end





local function _readfile(path)
    local file = io.open(path,  "r")
    if file then
        local content = file:read("*a")
        io.close(file)
        return content
    end

    return nil
end





print ("before LauncherScene.new()")
local lchr = LauncherScene.new()
print ("after LauncherScene.new()")

-- Launcher.runWithScene(lchr)
local sharedDirector = cc.Director:getInstance()

local curScene = sharedDirector:getRunningScene()
if curScene then
    sharedDirector:replaceScene(lchr)
else
    sharedDirector:runWithScene(lchr)
end
log("end main")
-- cc.Director:getInstance():runWithScene()