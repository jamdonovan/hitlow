#!/usr/bin/env zx

//import 'zx/globals'

import * as _ from "async"

const HOME = os.homedir()
const LOCAL = "pending"
const REMOTE = "GDAP:/XXX SRC"
const RCLONE = ["--fast-list", "--drive-chunk-size", "128M", "--drive-upload-cutoff", "512M", "--tpslimit", "8", "--transfers", "4"]
const ARIA = ["--retry-wait", "5", "--auto-file-renaming=false", "--stream-piece-selector=inorder"]
const AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 12.5; rv:103.0) Gecko/20100101 Firefox/103.0"

const BIN_ARIA2C = "aria2c"
const BIN_RCLONE = "rclone"
const BIN_FFMPEG = "ffmpeg"
const BIN_MTN = "mtn"

const SRV_FILE = "srv.json"

let toFile = (t) =>  t.path + "." + (t.ext ? t.ext : "mp4")
let toFull = (t) => path.join(HOME, LOCAL, toFile(t))
let toDst = (t) => path.join(REMOTE, toFile(t))

let listen = async () => {
    let srv = path.join(HOME, SRV_FILE)
    let extra = []
    
    if (
        fs.existsSync(srv)
    ) {
        extra.push("--drive-service-account-file", srv)
    }
    
    await $`${BIN_RCLONE} --verbose --progress --no-update-modtime --rc-no-auth ${RCLONE} ${extra} rcd ${REMOTE}`
}

let setup = async (data) => {
    await $`mkdir -p ${LOCAL}`

    data.forEach(async e => {
        await $`mkdir -p ${path.dirname(toFull(e))}`
    })
}

let check = _.queue(async (task) => {
    let dst = toDst(task)
    
    if (argv.k) {
        return task
    }

    try {
        await $`${BIN_RCLONE} ls ${dst}`.quiet()
    } catch(p) {
        let err = p.stderr
        if (err.includes("Failed to ls") && err.includes("not found")) {
            return task
        }
    }

    throw Error("File already Exists")
}, 3)

let down = _.queue(async (task) => {
    let {url, opts = ""} = task
    let full = toFull(task)
    let file = toFile(task)

    if (
        fs.existsSync(full) && 
        !fs.existsSync(full + ".aria2") &&
        !fs.existsSync(full + ".hls")
    ) {
        return task
    }
    
    if (task.hls) {
        await $`${BIN_FFMPEG} -y -nostdin -user-agent ${AGENT} ${opts} -loglevel error -i ${url} -acodec copy -bsf:a aac_adtstoasc -vcodec copy -f mp4 ${full + ".hls"} && mv ${full + ".hls"} ${full}`
    } else {
        await $`${BIN_ARIA2C} ${ARIA} --user-agent ${AGENT} ${opts} -d ${LOCAL} -o ${file} ${url}`
    }

    return task
}, 6)

let snap = _.queue(async (task) => {
    let full = toFull(task)

    if (
        argv.n || fs.existsSync(toFull({...task, ext: "jpg"}))
    ) {
        return task
    }

    await $`${BIN_MTN} -q -n -i -t -b 2 -c 4 -r 12 -j 92 -w 1920 -o .jpg ${full}`

    return task
}, 1)

let upload = _.queue(async (task) => {
    let full = toFull(task)
    let dst = path.join("/", toFile(task))

    if (
        !fs.existsSync(full)
    ) {
        return task
    }

    let job = JSON.parse(await $`${BIN_RCLONE} rc operations/copyfile srcFs=/ srcRemote=${full} dstFs=${REMOTE} dstRemote=${dst} _async=true`)

    if (job && (job.jobid === 0 || job.jobid) ) {
        let id = job.jobid
        while(true) {
            let res = JSON.parse(await $`rclone rc job/status jobid=${id}`.quiet())

            if(res.finished) {
                if (!res.success)
                    throw Error(res.error)
                
                return task
            }

            await sleep(2500)
        }
    }
}, 4)

let remove = _.queue(async (task) => {
    let full = toFull(task)

    await $`rm ${full}`

    return task
}, 12)

if (argv.m) {
    let m = await fs.readJson(argv.m)
    console.log(m)
}

if (argv.l) {
    console.log(`-- ${BIN_RCLONE.toUpperCase()} --`)
    await listen()
}

if (argv.c) {
    let j = await fs.readJson(argv.c)
    let d = j.data

    await setup(d)

    _.eachLimit(d, argv.p ? argv.p : 8, function(m, end) {
        _.waterfall([
            (callback) => {
                check.push(
                    m,
                    (e, r) => {
                        console.log(
                            chalk.yellow("CHECK"),
                            chalk.blue(m.path)
                        )
                        
                        callback(e, r)
                    }
                )
            },
            (x, callback) => {
                down.push(
                    {...m, opts: j.options},
                    (e, r) => {
                        console.log(
                            chalk.yellow(BIN_ARIA2C.toUpperCase()),
                            chalk.blue(m.path)
                        )
                        
                        callback(e, r)
                    }
                )
            },
            (x, callback) => {
                snap.push(
                    m, 
                    (e, r) => {
                        console.log(
                            chalk.yellow(BIN_MTN.toUpperCase()),
                            chalk.blue(m.path)
                        )
                        
                        callback(null, r)
                    }
                )
            },
            (x, callback) => {
                _.parallel([
                        c => upload.push(m, c),
                        c => upload.push({...m, ext: "jpg"}, c)
                    ], 
                    (e, r) => {
                        console.log(
                            chalk.yellow(BIN_RCLONE.toUpperCase()),
                            chalk.blue(m.path)
                        )
                        
                        callback(null, r)
                    }
                )
            },
            (x, callback) => {
                _.parallel([
                        c => remove.push(m, c),
                        c => remove.push({...m, ext: "jpg"}, c)
                    ],
                    (e, r) => {
                        console.log(
                            chalk.yellow("CLEAN"),
                            chalk.blue(m.path)
                        )
                        
                        callback(null, r)
                    }
                )
            }
        ],
        (err) => {            
            console.log(
                chalk.yellow("DONE"),
                m.path,
                err ? err : "",
            )

            end()
        })
    })
}
