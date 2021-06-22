/****************************************************************************
 * @copyright   LIU Zhao
 * @authors     LIU Zhao (liuzhaomax@163.com)
 * @date        2021/5/30 13:33
 * @version     v1.0
 * @filename    map.js
 * @description
 ***************************************************************************/

function createMap(group, attribute, selectedRC) {
    // remove all elements in svg
    document.getElementById('map').innerHTML = ''
    document.getElementById('legend-map').innerHTML = ''
    // data
    let data
    if (group === 'Country') {
        data = project.data.list
    } else if (group === 'Region') {
        data = project.data.listGroupByRegion
    }
    let min = data.reduce((accumulator, item) => {
        if (isNaN(Number(item[attribute]))) {
            return accumulator
        }
        return Math.min(accumulator, Number(item[attribute]))
    }, Number(data[0][attribute]))
    let max = data.reduce((accumulator, item) => {
        if (isNaN(Number(item[attribute]))) {
            return accumulator
        }
        return Math.max(accumulator, Number(item[attribute]))
    }, Number(data[0][attribute]))
    // let geo
    // await fetch('../../countries.json')
    //     .then(response => response.json())
    //     .then(json => geo = json.features)
    let parent = document.getElementsByClassName('main-north-north')[0]
    let width = parent.getBoundingClientRect().width
    let height = parent.getBoundingClientRect().height

    let svg = d3.select('#map').attr('width', width).attr('height', height)
    let g = svg.append('g')
    let projection = d3.geoMercator().center([-15.5, 17]).scale(167).rotate([0,0])  // geoEquirectangular
    let path = d3.geoPath().projection(projection)
    // color
    let colorValue = d => Number(d.properties[attribute])
    // let colorScale = d3.scaleSequential(d3.interpolateSpectral)
    // title
    svg.append('text').attr('x', 0).attr('y', 10).attr('font-weight', 600).text(attribute + ' grouped by ' + group)
    // zoom
    svg.call(d3.zoom().on('zoom', () => {
        g.selectAll('path').transition().duration(0).attr('transform', zoomTransformData)
        zoomTransformData = d3.event.transform
    }))
    // load and display the World
    // https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json
    d3.json('../../countries_topo.json').then(world => {
        let countries = processData(world.objects.units.geometries, project.data.list)
        // colorScale.domain(countries.map(colorValue))
        //     .domain(colorScale.domain().sort())
        // Legend
        legend({
            selection: d3.select('#legend-map'),
            color: d3.scaleSequential(getLegendTickRange(min, max), d3.interpolateSpectral),
            title: attribute
        })
        // map
        let chart
        let regionProperties
        let regionName
        let rcMappingArray = getRCMappingArray()
        if (group === 'Region') {
            for (let i = 0; i < rcMappingArray.length; i++) {
                chart = g.append('path').datum(topojson.merge(world, countries.filter(d => rcMappingArray[i].set.has(d.properties['Country']))))
                // control zoom
                if (zoomTransformData) chart.attr('transform', zoomTransformData)
                chart.attr('d', path)
                    .attr('opacity', 1)
                    .attr('region', rcMappingArray[i].name)
                    .attr('fill', function(d) {
                        regionName = d3.select(this).attr('region')
                        regionProperties = data.filter(d => regionName === d['Region'])[0]
                        d.properties = regionProperties
                        if (d.properties[attribute] !== undefined && d.properties[attribute] !== '0') {
                            return d3.interpolateSpectral((colorValue(d)-min)/(max-min))
                        } else {
                            return 'grey'
                        }
                    })
                    .attr('stroke', '#333').attr('stroke-width', d => {
                        if (selectedRC.has(d.properties[group])) {
                            return 3
                        } else {
                            return 0.5
                        }
                    }).attr('stroke-opacity', 0.8)
                    .attr('cursor', 'pointer')
                // click event
                chart.on('click', function (d) {
                    if (project.selectedRC.has(d.properties[group])) {
                        project.selectedRC.delete(d.properties[group])
                    } else {
                        project.selectedRC.add(d.properties[group])
                    }
                    displaySelectedRC()
                    createMap(project.status, project.attributes, project.selectedRC)
                    createBar(project.status, project.attributes, project.order, project.selectedRC)
                    createBox(project.attributes, project.order, project.selectedRC)
                })
                // tooltip
                toggleTooltipMap(chart, svg, parent, group)
            }
        } else {
            let countriesGeo = topojson.feature(world, world.objects.units).features
            chart = g.selectAll('path').data(countriesGeo).enter().append('path')
            // control zoom
            if (zoomTransformData) chart.attr('transform', zoomTransformData)
            chart.attr('d', path)
                .attr('opacity', 1)
                // .transition().delay((d, i) => {return (i + 1) * 2}).duration(100).ease(d3.easeBounceIn)
                .attr('fill', d => {
                    if (d.properties[attribute] !== undefined && d.properties[attribute] !== '0') {
                        return d3.interpolateSpectral((colorValue(d)-min)/(max-min))
                    } else {
                        return 'grey'
                    }
                })
                .attr('stroke', '#333').attr('stroke-width', d => {
                    if (selectedRC.has(d.properties[group])) {
                        return 3
                    } else {
                        return 0.5
                    }
                }).attr('stroke-opacity', 0.8)
                .attr('cursor', 'pointer')
            // click event
            chart.on('click', function (d) {
                if (project.selectedRC.has(d.properties[group])) {
                    project.selectedRC.delete(d.properties[group])
                } else {
                    project.selectedRC.add(d.properties[group])
                }
                displaySelectedRC()
                createMap(project.status, project.attributes, project.selectedRC)
                createBar(project.status, project.attributes, project.order, project.selectedRC)
                createBox(project.attributes, project.order, project.selectedRC)
            })
            // tooltip
            toggleTooltipMap(chart, svg, parent, group)
        }
    })
}

function createTooltipMap(d, group) {
    let parent = document.getElementById('tooltip-bar')
    parent.innerHTML = ''
    let text = document.createElement('p')
    text.innerHTML = d.properties[group]
    parent.appendChild(text)
    for (const key in d.properties) {
        if (key !== 'Country' && key !== 'Region') {
            if (Object.prototype.hasOwnProperty.call(d.properties, key)) {
                text = document.createElement('p')
                if (d.properties[key] === '0') {
                    text.innerHTML = key + `: <span>No Data</span>`
                } else {
                    text.innerHTML = key + `: <span>${d.properties[key]}</span>`
                }
                parent.appendChild(text)
            }
        }
    }
    return parent.innerHTML
}

function toggleTooltipMap(chart, svg, parent, group) {
    let tooltip = d3.select('#tooltip-map')
    chart.on('mouseover', function(d) {
        d3.select(this).attr('opacity', 0.7)
        tooltip.html(createTooltipMap(d, group))
            .transition().duration(0)
            .style('margin-left', d3.mouse(parent)[0] + 20 + 'px')
            .style('margin-top', d3.mouse(parent)[1] + 30 + 'px')
            .style('display', 'block')
        })
        .on('mousemove', function(d) {
            d3.select(this).attr('opacity', 0.7)
            tooltip.html(createTooltipMap(d, group))
                .transition().duration(0)
                .style('margin-left', d3.mouse(parent)[0] + 20 + 'px')
                .style('margin-top', d3.mouse(parent)[1] + 30 + 'px')
                .style('display', 'block')
        })
        .on('mouseout', function() {
            d3.select(this)
                // .transition().delay(0).duration(500)
                .attr('opacity', 1)
        })
    svg.on('mouseout', function() {
        tooltip.transition().duration(500).style('display', 'none')
    })
}

function processData(countries, data) {
    countries.forEach(d => {
        for (let i = 0; i < data.length; i++) {
            if (data[i]['Country'] === d.properties.name) {
                d.properties = data[i]
                break
            }
            if (i === data.length - 1) {
                d.properties = {
                    Country: d.properties.name,
                    Data: 'No Data Found'
                }
            }
        }
    })
    return countries
}

function getRCMappingArray() {
    let regionArray = []
    for (let i = 0; i < project.data.listGroupByRegion.length; i++) {
        regionArray.push(project.data.listGroupByRegion[i]['Region'])
    }
    let result = []
    let tempCountries
    let tempResEle
    for (let j = 0; j < regionArray.length; j++) {
        tempCountries = []
        tempResEle = {name: '', set: undefined}
        for (let i = 0; i < project.data.list.length; i++) {
            if (project.data.list[i]['Region'] === regionArray[j]) {
                tempCountries.push(project.data.list[i]['Country'])
            }
        }
        tempResEle.name = regionArray[j]
        tempResEle.set = d3.set(tempCountries)
        result.push(tempResEle)
    }
    return result
}

function getLegendTickRange(min, max) {
    if (max >= 10 && min >= 10) {
        min = Number(Math.floor(min/10).toFixed(1)) * 10
        max = Number(Math.ceil(max/10).toFixed(1)) * 10
    } else if (max >= 0.1 && min >= 0.1) {
        min = Number(Math.floor(min/0.1).toFixed(1)) * 0.1
        max = Number(Math.ceil(max/0.1).toFixed(1)) * 0.1
    } else if (max >= 0.01 && min >= 0.01) {
        min = Number(Math.floor(min/0.01).toFixed(1)) * 0.01
        max = Number(Math.ceil(max/0.01).toFixed(1)) * 0.01
    } else if (max >= 0.001 && min >= 0.01) {
        min = Number(Math.floor(min/0.001).toFixed(1)) * 0.001
        max = Number(Math.ceil(max/0.001).toFixed(1)) * 0.001
    }
    return [min, max]
}

// reset
let btnMapReset = document.getElementById('btn-map-reset')
btnMapReset.addEventListener('click', () => {
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

setTimeout(() => {
    document.getElementById('zoom-me').style.display = 'none'
}, 2000)