# 40-dont-load-unecessary-vards

As we have seen in previous tests ([32-prosody-cpu](../32-prosody-cpu/)), massive user joining can overload the Prosody process.
This test suite is here to evaluate a proposal to fix [issue #106](https://github.com/JohnXLivingston/peertube-plugin-livechat/issues/106).

The solution tested here is not the same as the one described in the issue #106.
Now that the plugin can handle federation, it could be difficult to load user's avatar by bypassing Prosody.

The solution proposed here consist to modify ConverseJS to avoid loading all vCards when the user joins the room.

The proposed patch is:

```patch
diff --git a/src/headless/plugins/vcard/index.js b/src/headless/plugins/vcard/index.js
index 067e7bb94..4199583f1 100644
--- a/src/headless/plugins/vcard/index.js
+++ b/src/headless/plugins/vcard/index.js
@@ -82,8 +82,19 @@ converse.plugins.add('converse-vcard', {
 
         api.listen.on('chatRoomInitialized', (m) => {
             setVCardOnModel(m)
-            m.occupants.forEach(setVCardOnOccupant);
-            m.listenTo(m.occupants, 'add', setVCardOnOccupant);
+            if (m.get('hidden_occupants') !== true) {
+                m.occupants.forEach(setVCardOnOccupant);
+            }
+            m.listenTo(m.occupants, 'add', (occupant) => {
+                if (m.get('hidden_occupants') !== true) {
+                    setVCardOnOccupant(occupant)
+                }
+            });
+            m.on('change:hidden_occupants', () => {
+                if (m.get('hidden_occupants') !== true) {
+                    m.occupants.forEach(setVCardOnOccupant);
+                }
+            })
             m.listenTo(m.occupants, 'change:image_hash', o => onOccupantAvatarChanged(o));
         });
```

This is just a first shot, an could be rewritten later on.
And maybe commited to ConverseJS upstream if maintainers are ok.

Here is what this patch does:

* when joining a room, only request all room occupants vCards if the occupant list is not hidden
* request all (missing) occupants vCards when the occupant list becomes visible
* when a user joins, only ask for its vCard if the participant list is visible

When a user sends a message, the vCard will be loaded if required (by the existing code).

The downside of this approach is that there is a little blinking when a user is posting his first message: first there is the default ConverseJS avatar, then it is replaced by the vCards when it is loaded.
We will see later on if we can a way to fix this. First we will evaluate the benefits of this approach.

There is another modification on the livechat plugin: I added a special `force_default_hide_muc_participants` query parameter, to hide or show the participant list, so we can set it to `0` or `1`, depending of what we want to test.
