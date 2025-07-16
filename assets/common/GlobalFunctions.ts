import UserService from "./auth/UserService";

(function() {
    (window as any).onRechargeSuccess = function() {
        UserService.getBalance();
    };
})(); 