# 33-prosody-gc

On the Prosody official room, MattJ made me aware of the Lua Garbage Collection that [can be tweaked in Prosody](https://prosody.im/doc/advanced_gc).

Here we will try some tweaking, to see if it can make a difference.

The test scenario will be the same as [32-prosody-cpu](../32-prosody-cpu/), but we will try different GC tweaking.

## Run 01

Result for running this test suite [on livechat v8.0.4](./results/01/).

Plugin version: v8.0.4

See [Run output](./01.output.md).

Server CPU:

![ProsodyCPU](./results/01/monitor_server_prosody_cpu.png)

Note: default GC options are:

```lua
gc = {
  mode = "incremental";
  threshold = 105;
  speed = 250;
}
```

## Run 02

Result for running this test suite [on livechat v8.0.4](./results/02/).

Plugin version: v8.0.4 + following GC tweak in the prosody.cfg.lua file:

```lua
gc = {
  mode = "incremental";
  threshold = 200;
  speed = 150;
};
```

Here we changed threshold and speed, to see if there is any difference.
If so, we will need to tweak them one by one, to make any conclusion.

See [Run output](./02.output.md).

Server CPU:

![ProsodyCPU](./results/02/monitor_server_prosody_cpu.png)

## Run 02 conclusion

|Defaults parameters| Threshold=200 speed=150|
|--|--|
|![ProsodyCPU](./results/01/monitor_server_prosody_cpu.png)|![ProsodyCPU](./results/02/monitor_server_prosody_cpu.png)

No difference here.

Currently the livechat plugin is using Lua5.2, i should try to upgrade to Lua5.4.
MattJ told me that GC performance are way better in this version.

## Run 03

Result for running this test suite [on livechat v8.0.4](./results/02/).

Plugin version: v8.0.4 + using [Prosody 0.12.4 AppImage](https://github.com/JohnXLivingston/prosody-appimage/releases/tag/v0.12.4-1).
This version uses Lua5.4.

See [Run output](./03.output.md).

Server CPU:

![ProsodyCPU](./results/03/monitor_server_prosody_cpu.png)

## Run 03 conclusion

|Prosody 0.12.3, Lua5.2, Debian Bullseye based| Prosody 0.12.4, Lua5.4, Debian Bookwork based|
|--|--|
|![ProsodyCPU](./results/01/monitor_server_prosody_cpu.png)|![ProsodyCPU](./results/03/monitor_server_prosody_cpu.png)

Seems that performances are worst with Prosody 0.12.4.
