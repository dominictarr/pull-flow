var pull = require('pull-stream')

var parallel = pull.Through(function (read, hwm, lwm) {
  var n = 0, output = [], cbs = [], ended
  hwm = hwm || 5
  lwm = lwm || hwm

  return function (end, cb) {
    ended = ended || end
    cbs.push(cb)

    ;(function drain() {
      if((output.length || ended) && cbs.length)
        cbs.shift() (output.length ? null : ended, output.shift())
      else if(!ended){
        var m = n + output.length
        if(m >= lwm) return

        var i = hwm - m, async = true
        //don't pull more data, unless you are BELOW the lwm

        while (i --> 0 && !ended && async) {
          n++
          //console.log('<---', n)
          read(null, function (end, data) {
            async = false
            n--
            //console.log('--->', n, end, data)
            if(!(ended = ended || end))
              output.push(data)
            drain()
          })
        }
      }
    })()
  }
})


var serial = pull.Through(function (read) {
  var queue = [], inFlight

  return function (end, cb) {
    queue.push({end: end, cb: cb})
    if(queue.length > 1) return

    ;(function drain() {
      read(queue[0].end, function (end, data) {
        var cb = queue.shift().cb
        cb(end, data)
        if(queue.length) drain()
      })
    })()
  }
})

var detect = pull.Through(function (read, flow) {
  if(!flow) return read //do nothing!
  var n = 0
  return function (end, cb) {
    var _n = n++
    read(end, function (end, data) {
      n--
      cb(end, data)
    })
    if(n != _n)
      flow(n)
  }
})

var async = pull.Through(function (read) {
  return function (end, cb) {
    read(end, function (err, data) {
      process.nextTick(function () {
        cb(err, data)
      })
    })
  }
})

exports = module.exports = parallel

exports.parallel = parallel
exports.serial   = serial
exports.detect   = detect
exports.async    = async

if(!module.parent) {
  var i = 0
  pull.values([1, 2, 3, 4, 5])
    .pipe(async())
 //   .pipe(serial())
    .pipe(detect(console.log))
    .pipe(parallel(5, 2))
    /*.pipe(function (read) {

      return function (end, cb) {
        return read(end, function (end, data) {
          console.log('>', end, data)
          cb(end, data)
        })
      }
    })*/
    .pipe(pull.collect(function (err, all) {
      console.log('ALL', all)
    }))
}
