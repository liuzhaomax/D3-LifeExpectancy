/****************************************************************************
 * @copyright   LIU Zhao
 * @authors     LIU Zhao (liuzhaomax@163.com)
 * @date        2021/5/21 19:22
 * @version     v1.0
 * @filename    link.js
 * @description
 ***************************************************************************/

Object.defineProperties(window.project, {
    data: {
        configurable: true,
        get: function() {
            return data
        },
        set: function(value) {
            data = value  // data will never be changed by scripts in this case
        }
    },
    status: {
        configurable: true,
        get: function() {
            return status
        },
        set: function(value) {
            status = value
            if (project.data.list !== undefined) {
                createBar(project.status, project.attributes, project.order, project.selectedRC)
                createMap(project.status, project.attributes, project.selectedRC)
            }
        }
    },
    attributes: {
        configurable: true,
        get: function() {
            return attributes
        },
        set: function(value) {
            attributes = value
            if (project.data.list !== undefined) {
                createBar(project.status, project.attributes, project.order, project.selectedRC)
                createBox(project.attributes, project.order, project.selectedRC)
                createMap(project.status, project.attributes, project.selectedRC)
            }
        }
    },
    factors: {
        configurable: true,
        get: function() {
            return factors
        },
        set: function(value) {
            factors = value
            displayFactors()
            if (project.data.list !== undefined) {
                createHeatBar(project.factors)
                createRegression(project.factors)
                createScatters(project.factors)
            }
        }
    },
    order: {
        configurable: true,
        get: function() {
            return order
        },
        set: function(value) {
            order = value
            if (project.data.list !== undefined) {
                createBar(project.status, project.attributes, project.order, project.selectedRC)
                createBox(project.attributes, project.order, project.selectedRC)
            }
        }
    },
    selectedRC: {
        configurable: true,
        get: function() {
            return selectedRC
        },
        set: function(value) {
            selectedRC = value
            displaySelectedRC()
            if (project.data.list !== undefined) {
                createBar(project.status, project.attributes, project.order, project.selectedRC)
                createBox(project.attributes, project.order, project.selectedRC)
                createMap(project.status, project.attributes, project.selectedRC)
            }
        }
    }
})

window.project.data = {
    list: undefined,
    listGroupByRegion: undefined,
    header: [],
    regionSet: new Set(),
    countrySet: new Set()
}
window.project.status = 'Region'
window.project.attributes = 'Life.expectancy'
window.project.factors = new Set()
window.project.order = 'desc'
window.project.selectedRC = new Set()
window.onload = () => {
    window.project.refreshed = true
}

function displaySelectedRC() {
    document.getElementById('rc-combobox').value = Array.from(project.selectedRC).join(',')
}

function displayFactors() {
    document.getElementById('factors-combobox').value = Array.from(project.factors).join(',')
}

