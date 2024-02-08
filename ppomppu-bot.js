kakao_replier = []
kakao_rooms = []

function onNotificationPosted(sbn, sm) {
    var packageName = sbn.getPackageName();
	if (packageName.startsWith("org.telegram.messenger")) {
		var actions = sbn.getNotification().actions;
		if (actions == null) return;
		var userId = sbn.getUser().hashCode();
		for (var n = 0; n < actions.length; n++) {
			var action = actions[n];
			if (action.getRemoteInputs() == null) continue;
			var bundle = sbn.getNotification().extras;

			var msg = bundle.get("android.text").toString();
			if (!(msg.includes('해피머니') || msg.includes('컬쳐랜드'))) return;
			for (var i = 0; i < kakao_replier.length; i++) {
				kakao_replier[i].reply(msg);
			}
		}
		return;
	}
    if (!packageName.startsWith("com.kakao.tal")) return;
    var actions = sbn.getNotification().actions;
    if (actions == null) return;
    var userId = sbn.getUser().hashCode();
    for (var n = 0; n < actions.length; n++) {
        var action = actions[n];
        if (action.getRemoteInputs() == null) continue;
        var bundle = sbn.getNotification().extras;

        var msg = bundle.get("android.text").toString();
        var sender = bundle.getString("android.title");
        var room = bundle.getString("android.subText");
        if (room == null) room = bundle.getString("android.summaryText");
        var isGroupChat = room != null;
        if (room == null) room = sender;
        var replier = new com.xfl.msgbot.script.api.legacy.SessionCacheReplier(packageName, action, room, false, "");
        var icon = bundle.getParcelableArray("android.messages")[0].get("sender_person").getIcon().getBitmap();
        var image = bundle.getBundle("android.wearable.EXTENSIONS");
        if (image != null) image = image.getParcelable("background");
        var imageDB = new com.xfl.msgbot.script.api.legacy.ImageDB(icon, image);
        com.xfl.msgbot.application.service.NotificationListener.Companion.setSession(packageName, room, action);
        if (this.hasOwnProperty("responseFix")) {
            try {
                responseFix(room, msg, sender, isGroupChat, replier, imageDB, packageName, userId != 0);
            }
            catch (error) {
                replier.reply(error);
                replier.reply(error.stack);
            }
        }
    }
}

function responseFix(room, msg, sender, isGroupChat, replier, imageDB, packageName, isMultiChat) {
	if (!msg.startsWith('.')) return;

	message = '';
	switch (msg) {
		case '.상테크알림':
			if (kakao_rooms.includes(room)) {
				message += '이미 등록되어있음'
			}
			else {
				kakao_replier.push(replier);
				kakao_rooms.push(room);
				message += '등록완료';
			}
			break;
		case '.목록':
			for (let i = 0; i < kakao_rooms.length; i++) {
				message += kakao_rooms[i];
				if (i != kakao_rooms.length - 1) {
					message += '\n';
				}
			}
			break;
		}
	replier.reply(message)
}