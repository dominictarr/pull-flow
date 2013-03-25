# pull-flow

parallel/serial flow for pull streams

4 simple functions to drop into a
[pull-stream](https://github.com/dominictarr/pull-stream)
pipeline, to mainipulate the level of asynchronicity

## parallel (hwm, lwm)

Start `hwm` parallel reads,
and start reading again when the buffer falls below `lwm`

## serial ()

force reads to be serial.

## detect(flow)

call flow when the number of concurrent requests changes

## async

forces a stream to be async - by delaying the callback until nextTick.

## License

MIT
