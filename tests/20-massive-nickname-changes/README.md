# 20-massive-nickname-changes

When anonymous users join the Peertube chat, they first get connected using a "Anonymous 12345" nickname.
Before being able to speak, they must change their nickname.

Under certain circumstances (numerous users joining at the same time, when the live begins), this can be the cause of some performance issues in browsers, as ConverseJS will render multiple time per second the user list.

It can also have some cost on the server side.

This test suite will evaluate the proposed fix for issue [#138](https://github.com/JohnXLivingston/peertube-plugin-livechat/issues/138) (hidding some nickname changes, when previous nickname was "Anonymous XXX").

We will also use this test suite to evaluate performance when implementing [#136](https://github.com/JohnXLivingston/peertube-plugin-livechat/issues/136):
grouping anonymous users on a single line for non-moderator users (to avoid having a long anonymous user list).

This test suite will also evaluate the cost when users are joining, and leaving.

This test suite will do:

* create a live
* start a chromium, connected as user_01
* wait a little
* start monitoring the server and chromium
* wait a little
* join the chat with 100 anonymous bots (nickname "Anonymous 1", and so on)
* after 20 seconds, each bot will change his nickname (for "bot 1", and so on)
* each bot will leave after 40 seconds
* finally we close the chromium, and delete the live

So we should observe some high CPU usage on Chromium, and on the server, at 3 key moments:

* when bots are joining
* when bots are changing nicknames
* when bots are leaving
