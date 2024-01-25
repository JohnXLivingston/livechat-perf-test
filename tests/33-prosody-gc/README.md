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
