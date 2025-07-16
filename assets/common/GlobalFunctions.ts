(function() {
    (window as any).onRechargeSuccess = function() {
        console.log("🎉 onRechargeSuccess called from React Native!");
        alert("🎉 onRechargeSuccess called from React Native!");
    };
})(); 