Java.choose("com.example.MyClass", {
    onMatch: function(instance) {
        i = instance
        console.log("Found instance:", instance);
       
    },
    onComplete: function() {
        console.log("Search completed");
    }
});