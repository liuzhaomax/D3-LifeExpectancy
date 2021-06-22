/****************************************************************************
 * @copyright   LIU Zhao
 * @authors     LIU Zhao (liuzhaomax@163.com)
 * @date        2021/5/19 21:57
 * @version     v1.0
 * @filename    init.js
 * @description
 ***************************************************************************/

window.project = {
    data: {
        list: undefined,
        listGroupByRegion: undefined,
        header: [],
        regionSet: new Set(),
        countrySet: new Set()
    },
    status: '',
    attributes: '',
    factors: undefined,
    order: '',
    selectedRC: undefined,
    refreshed: false
}
// zoom data record
let zoomTransformData = null

let btnCountry = document.getElementsByClassName('btn-country')[0]
let btnRegion = document.getElementsByClassName('btn-region')[0]
let btnDesc = document.getElementsByClassName('btn-desc')[0]
let btnAsc = document.getElementsByClassName('btn-asc')[0]
let comboboxRC = document.getElementById('rc-combobox')
let comboboxFactors = document.getElementById('factors-combobox')
let spinnerAttributes = document.getElementById('attributes')

btnCountry.addEventListener('click', () => {
    btnRegion.classList.remove('btn-activated')
    btnCountry.classList.add('btn-activated')
    window.project.status = 'Country'
    project.selectedRC = new Set()
    if (zoomTransformData) {
        let svg = d3.select('#map')
        zoomTransformData.k = 1
        zoomTransformData.x = 0
        zoomTransformData.y = 0
        svg.selectAll('path').transition().duration(0).attr('transform', zoomTransformData)
    }
    zoomTransformData = null
})
btnRegion.addEventListener('click', () => {
    btnRegion.classList.add('btn-activated')
    btnCountry.classList.remove('btn-activated')
    window.project.status = 'Region'
    project.selectedRC = new Set()
    if (zoomTransformData) {
        let svg = d3.select('#map')
        zoomTransformData.k = 1
        zoomTransformData.x = 0
        zoomTransformData.y = 0
        svg.selectAll('path').transition().duration(0).attr('transform', zoomTransformData)
    }
    zoomTransformData = null
})
btnDesc.addEventListener('click', () => {
    btnDesc.classList.add('btn-activated')
    btnAsc.classList.remove('btn-activated')
    window.project.order = 'desc'
})
btnAsc.addEventListener('click', () => {
    btnAsc.classList.add('btn-activated')
    btnDesc.classList.remove('btn-activated')
    window.project.order = 'asc'
})
comboboxRC.addEventListener('focus', () => {
    if (project.status === 'Region') {
        document.getElementById('rc-combobox-region-list').style.display = 'block'
    } else if (project.status === 'Country') {
        document.getElementById('rc-combobox-country-list').style.display = 'block'
    }
})
comboboxRC.addEventListener('blur', () => {
    if (project.status === 'Region') {
        document.getElementById('rc-combobox-region-list').style.display = 'none'
    } else if (project.status === 'Country') {
        document.getElementById('rc-combobox-country-list').style.display = 'none'
    }
})
comboboxFactors.addEventListener('focus', () => {
    document.getElementById('factors-combobox-list').style.display = 'block'
})
comboboxFactors.addEventListener('blur', () => {
    document.getElementById('factors-combobox-list').style.display = 'none'
})
spinnerAttributes.addEventListener('change', () => {
    project.attributes = spinnerAttributes.value
})
