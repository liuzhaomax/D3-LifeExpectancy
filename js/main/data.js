/****************************************************************************
 * @copyright   LIU Zhao
 * @authors     LIU Zhao (liuzhaomax@163.com)
 * @date        2021/5/24 10:50
 * @version     v1.0
 * @filename    data.js
 * @description
 ***************************************************************************/

d3.csv('life_happ.csv').then(data => {
    // data loading
    project.data.list = data
    project.data.listGroupByRegion = groupByRegion(data)
    // get header
    for (const key in data[0]) {
        if (Object.prototype.hasOwnProperty.call(data[0], key)) {
            project.data.header.push(key)
        }
    }
    // init CR selection in region status
    initRegionList()
    // init CR selection in country status
    initCountryList()
    // init factors selection
    initFactorList()
    // init attributes selection
    initAttributeList()
    // init bar
    createBar(project.status, project.attributes, project.order, project.selectedRC)
    // init box
    createBox(project.attributes, project.order, project.selectedRC)
    // init map
    createMap(project.status, project.attributes, project.selectedRC)
    // init 3d heatmap
    createHeat()
    // init 2d heat bar
    createHeatBar(project.factors)
    // init regression
    createRegression(project.factors)
    // init scatter plots
    createScatters(project.factors)
}).catch(error => {
    console.log(error)
})

function initRegionList() {
    let datalist = document.getElementById('rc-combobox-region-list')
    for (let i = 0; i < project.data.list.length; i++) {
        if (!(project.data.list[i]['Region'] in project.data.regionSet)) {
            project.data.regionSet.add(project.data.list[i]['Region'])
        }
    }
    for (const item of project.data.regionSet) {
        let option = document.createElement('div')
        option.innerText = item
        option.className = 'list-item list-item-rc list-item-region'
        datalist.appendChild(option)
        option.addEventListener('mousedown', () => {
            datalist.style.display = 'none'
            let set = new Set([option.innerText])
            project.selectedRC = new Set([...project.selectedRC, ...set])
        })
    }
    document.getElementsByClassName('list-item-region')[0].addEventListener('mousedown', () => {
        datalist.style.display = 'none'
        project.selectedRC = new Set()
    })
}

function initCountryList() {
    let datalist = document.getElementById('rc-combobox-country-list')
    for (let i = 0; i < project.data.list.length; i++) {
        if (!(project.data.list[i]['Country'] in project.data.countrySet)) {
            project.data.countrySet.add(project.data.list[i]['Country'])
        }
    }
    for (const item of project.data.countrySet) {
        let option = document.createElement('div')
        option.innerText = item
        option.className = 'list-item list-item-rc list-item-country'
        datalist.appendChild(option)
        option.addEventListener('mousedown', () => {
            datalist.style.display = 'none'
            let set = new Set([option.innerText])
            project.selectedRC = new Set([...project.selectedRC, ...set])
        })
    }
    document.getElementsByClassName('list-item-country')[0].addEventListener('mousedown', () => {
        datalist.style.display = 'none'
        project.selectedRC = new Set()
    })
}

function initFactorList() {
    let datalist = document.getElementById('factors-combobox-list')
    for (let i = 0; i < project.data.header.length; i++) {
        if (project.data.header[i] !== 'Country'
            && project.data.header[i] !== 'Region'
            && project.data.header[i] !== 'Life.expectancy') {
            let option = document.createElement('div')
            option.innerText = project.data.header[i]
            option.className = 'list-item list-item-factors'
            datalist.appendChild(option)
            option.addEventListener('mousedown', () => {
                datalist.style.display = 'none'
                let set = new Set([option.innerText])
                project.factors = new Set([...project.factors, ...set])
            })
        }
    }
    document.getElementsByClassName('list-item-factors')[0].addEventListener('mousedown', () => {
        datalist.style.display = 'none'
        project.factors = new Set()
    })
}

function initAttributeList() {
    let datalist = document.getElementById('attributes')
    for (let i = 0; i < project.data.header.length; i++) {
        if (project.data.header[i] !== 'Country'
            && project.data.header[i] !== 'Region') {
            let option = document.createElement('option')
            option.innerText = project.data.header[i]
            datalist.appendChild(option)
        }
    }
}

function groupByRegion(data) {
    let _data = deepClone(data)
    _data = _data.map(d => {
        delete d['Country']
        return d
    })
    _data = groupBy(_data, 'Region')
    return flatten(_data.map(d => {
        let dataWithNum = d.map(dd => {
            for (const ddKey in dd) {
                if (ddKey !== 'Region') {
                    if (Object.prototype.hasOwnProperty.call(dd, ddKey)) {
                        dd[ddKey] = Number(dd[ddKey])
                    }
                }
            }
            return dd
        })
        let totalObj = deepClone(dataWithNum[0])
        for (let i = 1; i < dataWithNum.length; i++) {
            for (const dataWithNumKey in dataWithNum[i]) {
                if (dataWithNumKey !== 'Region') {
                    if (Object.prototype.hasOwnProperty.call(dataWithNum[i], dataWithNumKey)) {
                        totalObj[dataWithNumKey] += dataWithNum[i][dataWithNumKey]
                    }
                }
            }
        }
        for (const totalObjKey in totalObj) {
            if (totalObjKey !== 'Region') {
                if (Object.prototype.hasOwnProperty.call(totalObj, totalObjKey)) {
                    totalObj[totalObjKey] = (totalObj[totalObjKey] / d.length).toFixed(2)
                }
            }
        }
        return [totalObj]
    }))
}

function quickSortByAttribute(arr, attribute, order) {
    let _arr = deepClone(arr)
    if (_arr.length <= 1) return _arr
    let pivotIndex = Math.floor(_arr.length / 2)
    let pivot = _arr.splice(pivotIndex, 1)[0]
    let left = []
    let right = []
    if (order) {
        if (order === 'desc') {
            for (let i = 0; i < _arr.length; i++){
                if (Number(_arr[i][attribute]) > Number(pivot[attribute])) {
                    left.push(_arr[i])
                } else {
                    right.push(_arr[i])
                }
            }
        } else if (order === 'asc') {
            for (let i = 0; i < _arr.length; i++){
                if (Number(_arr[i][attribute]) < Number(pivot[attribute])) {
                    left.push(_arr[i])
                } else {
                    right.push(_arr[i])
                }
            }
        } else {
            console.log('Invalid order param.')
        }
    } else {
        console.log('Param order not existed.')
    }
    return quickSortByAttribute(left, attribute, order).concat([pivot], quickSortByAttribute(right, attribute, order))
}
