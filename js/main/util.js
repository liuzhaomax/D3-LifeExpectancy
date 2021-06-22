/****************************************************************************
 * @copyright   LIU Zhao
 * @authors     LIU Zhao (liuzhaomax@163.com)
 * @date        2021/5/30 21:56
 * @version     v1.0
 * @filename    util.js
 * @description
 ***************************************************************************/

function groupBy(array, attr) {
    let groups = {}
    array.forEach(obj => {
        let group = obj[attr]
        groups[group] = groups[group] || []
        groups[group].push(obj)
    })
    return Object.values(groups)
}

function flatten(array) {
    return array.reduce((pre, cur) => {
        return pre.concat(Array.isArray(cur) ? flatten(cur) : cur)
    }, [])
}

function deepClone(obj) {
    var objClone = Array.isArray(obj) ? [] : {}
    if (obj && typeof obj === 'object') {
        for (key in obj) {
            if (obj.hasOwnProperty(key)) {
                if (obj[key] && typeof obj[key] === 'object') {
                    objClone[key] = deepClone(obj[key])
                } else {
                    objClone[key] = obj[key]
                }
            }
        }
    }
    return objClone
}

function pearson(x, y) {
    const promedio = l => l.reduce((s, a) => s + a, 0) / l.length
    const calc = (v, prom) => Math.sqrt(v.reduce((s, a) => (s + a * a), 0) - n * prom * prom)
    let n = x.length
    let nn = 0
    for (let i = 0; i < n; i++, nn++) {
        if ((!x[i] && x[i] !== 0) || (!y[i] && y[i] !== 0)) {
            nn--
            continue
        }
        x[nn] = x[i]
        y[nn] = y[i]
    }
    if (n !== nn) {
        x = x.splice(0, nn)
        y = y.splice(0, nn)
        n = nn
    }
    const prom_x = promedio(x), prom_y = promedio(y)
    return (x
            .map((e, i) => ({ x: e, y: y[i] }))
            .reduce((v, a) => v + a.x * a.y, 0) - n * prom_x * prom_y
    ) / (calc(x, prom_x) * calc(y, prom_y))
}

Array.prototype.remove = function(val) {
    var index = this.indexOf(val)
    if (index > -1) {
        this.splice(index, 1)
    }
}