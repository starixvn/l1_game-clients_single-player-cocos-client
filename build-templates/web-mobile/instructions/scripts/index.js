var arrFrames = parent.document.getElementsByTagName("IFRAME");
for (var i = 0; i < arrFrames.length; i++) {
    if (arrFrames[i].contentWindow === window) {
        var currentIframe = arrFrames[i];
        currentIframe.style.background = "none";
    }
}